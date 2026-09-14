import {z} from 'zod';
import {DomainError} from '../domain';
import {owned,type Actor,type FormationRecord} from '../application';
import type {Repository,Row} from '../persistence';
import {prepareWyomingPacket} from '../formation-packet/wyoming';
import {WY_FIELDS,wyomingIntakeSchema} from '../formation-packet/catalog';
import {applyConfirmedPatch,assistantFor,deterministicExtract,initialConversationState,nextMissing,permittedFieldsForMessage,safeSyntheticMessage,type ProposedUpdate} from './index';
import {extractWithOpenAI,type OpenAIConfiguration} from './openai';

export interface ConversationRecord extends Row{id:string;organization_id:string;case_id:string;jurisdiction_code:'US-WY';status:string;execution_mode:string;model:string|null;synthetic:boolean;state_json:unknown;pending_patch:unknown;revision:number;created_by:string;created_at:string;updated_at:string}
export interface ConversationTurn extends Row{id:string;organization_id:string;conversation_id:string;turn_kind:string;customer_message:string|null;assistant_message:string;proposed_patch:unknown;model_status:string;client_request_id:string;created_at:string}
const startSchema=z.object({caseId:z.uuid(),caseRevision:z.number().int().nonnegative(),synthetic:z.literal(true),clientRequestId:z.uuid()}).strict();
const messageSchema=z.object({conversationId:z.uuid(),revision:z.number().int().nonnegative(),message:z.string(),clientRequestId:z.uuid()}).strict();
const confirmationSchema=z.object({conversationId:z.uuid(),revision:z.number().int().nonnegative(),accept:z.boolean(),clientRequestId:z.uuid()}).strict();

async function record(repo:Repository,actor:Actor,id:string){return owned((await repo.list<ConversationRecord>('agent_conversations',{id}))[0],actor);}
async function response(repo:Repository,conversation:ConversationRecord){
 const turns=await repo.list<ConversationTurn>('agent_conversation_turns',{conversation_id:conversation.id},{orderBy:'id',limit:200});
 return{conversation:{id:conversation.id,caseId:conversation.case_id,jurisdiction:conversation.jurisdiction_code,status:conversation.status,executionMode:conversation.execution_mode,model:conversation.model,synthetic:conversation.synthetic,state:wyomingIntakeSchema.parse(conversation.state_json),pendingPatch:z.record(z.string(),z.string()).parse(conversation.pending_patch),revision:conversation.revision,createdAt:conversation.created_at,updatedAt:conversation.updated_at},turns};
}
function assertSandbox(sandbox:boolean){if(!sandbox)throw new DomainError('AGENT_SANDBOX_ONLY','La conversación agéntica está habilitada solo con datos ficticios en sandbox',403);}
async function checkedCase(repo:Repository,actor:Actor,id:string,revision:number){
 const item=owned((await repo.list<FormationRecord>('formation_cases',{id}))[0],actor);
 if(item.jurisdiction_code!=='US-WY')throw new DomainError('CASE_GUIDE_MISMATCH','El expediente no corresponde a Wyoming');
 if(item.execution_mode!=='SANDBOX')throw new DomainError('AGENT_SANDBOX_ONLY','El expediente debe ser sintético',403);
 if(item.revision!==revision)throw new DomainError('CONFLICT','El expediente cambió. Recarga antes de iniciar la conversación.',409);
 if(['CANCELLED','REJECTED'].includes(item.status))throw new DomainError('TERMINAL_CASE','El expediente no admite conversación',409);
 return item;
}

export async function startWyomingConversation(repo:Repository,actor:Actor,sandbox:boolean,input:unknown,model?:OpenAIConfiguration){
 assertSandbox(sandbox);const values=startSchema.parse(input);
 const prior=(await repo.list<ConversationRecord>('agent_conversations',{organization_id:actor.organizationId,client_request_id:values.clientRequestId}))[0];
 if(prior)return response(repo,owned(prior,actor));
 const formation=await checkedCase(repo,actor,values.caseId,values.caseRevision);const id=crypto.randomUUID();
 const mode=model?.key&&model.model?'OPENAI_RESPONSES':'DETERMINISTIC_MOCK';
 await repo.atomic([
  {kind:'insert',table:'agent_conversations',data:{id,organization_id:formation.organization_id,case_id:formation.id,jurisdiction_code:'US-WY',status:'active',execution_mode:mode,model:mode==='OPENAI_RESPONSES'?model!.model:null,synthetic:true,state_json:initialConversationState(),pending_patch:{},revision:0,client_request_id:values.clientRequestId,created_by:actor.id}},
  {kind:'insert',table:'case_events',data:{organization_id:formation.organization_id,case_id:formation.id,event_type:'AGENT_CONVERSATION_STARTED',actor_type:actor.role,actor_user_id:actor.id,payload:{conversationId:id,synthetic:true,mode,caseRevision:formation.revision}}}
 ]);
 return response(repo,(await repo.list<ConversationRecord>('agent_conversations',{id}))[0]);
}

export async function getWyomingConversation(repo:Repository,actor:Actor,sandbox:boolean,caseId:string){
 assertSandbox(sandbox);const id=z.uuid().parse(caseId);await checkedCase(repo,actor,id,Number((await repo.list<FormationRecord>('formation_cases',{id}))[0]?.revision));
 const items=await repo.list<ConversationRecord>('agent_conversations',{case_id:id},{orderBy:'created_at',descending:true,limit:1});return items[0]?response(repo,owned(items[0],actor)):null;
}

export async function sendWyomingMessage(repo:Repository,actor:Actor,sandbox:boolean,input:unknown,model?:OpenAIConfiguration){
 assertSandbox(sandbox);const values=messageSchema.parse(input);const conversation=await record(repo,actor,values.conversationId);
 const duplicate=(await repo.list<ConversationTurn>('agent_conversation_turns',{conversation_id:conversation.id,client_request_id:values.clientRequestId}))[0];if(duplicate)return response(repo,conversation);
 if(conversation.revision!==values.revision)throw new DomainError('CONFLICT','La conversación cambió. Recarga antes de continuar.',409);
 if(conversation.status==='closed')throw new DomainError('CONVERSATION_CLOSED','La conversación está cerrada',409);
 if(Object.keys(z.record(z.string(),z.string()).parse(conversation.pending_patch)).length)throw new DomainError('CONFIRMATION_REQUIRED','Confirma o rechaza los datos propuestos antes de continuar.',409);
 const message=safeSyntheticMessage(values.message);let extraction=deterministicExtract(message);
 if(model?.key&&model.model){try{extraction=await extractWithOpenAI(message,permittedFieldsForMessage(conversation.state_json,message),model);}catch(error){if(!(error instanceof DomainError)||model.failureMode==='throw')throw error;extraction={updates:[],modelStatus:'EXTERNAL_BLOCKED'};}}
 const patch=Object.fromEntries(extraction.updates.map(update=>[update.field,update.value]));const assistant=assistantFor(conversation.state_json,extraction.updates);
 await repo.atomic([
  {kind:'update',table:'agent_conversations',where:{id:conversation.id,revision:conversation.revision},data:{pending_patch:patch,revision:conversation.revision+1,status:'active'}},
  {kind:'insert',table:'agent_conversation_turns',data:{organization_id:conversation.organization_id,conversation_id:conversation.id,turn_kind:'USER_MESSAGE',customer_message:message,assistant_message:assistant,proposed_patch:patch,model_status:extraction.modelStatus,client_request_id:values.clientRequestId,created_by:actor.id}},
  {kind:'insert',table:'case_events',data:{organization_id:conversation.organization_id,case_id:conversation.case_id,event_type:'AGENT_TURN_COMPLETED',actor_type:actor.role,actor_user_id:actor.id,payload:{conversationId:conversation.id,synthetic:true,modelStatus:extraction.modelStatus,proposedFields:extraction.updates.map(update=>update.field),conversationRevision:conversation.revision+1}}}
 ]);
 return response(repo,(await repo.list<ConversationRecord>('agent_conversations',{id:conversation.id}))[0]);
}

export async function confirmWyomingPatch(repo:Repository,actor:Actor,sandbox:boolean,input:unknown,now=new Date()){
 assertSandbox(sandbox);const values=confirmationSchema.parse(input);const conversation=await record(repo,actor,values.conversationId);
 const duplicate=(await repo.list<ConversationTurn>('agent_conversation_turns',{conversation_id:conversation.id,client_request_id:values.clientRequestId}))[0];if(duplicate)return response(repo,conversation);
 if(conversation.revision!==values.revision)throw new DomainError('CONFLICT','La conversación cambió. Recarga antes de confirmar.',409);
 const patch=z.partialRecord(z.enum(WY_FIELDS.map(f=>f.key) as [typeof WY_FIELDS[number]['key'],...typeof WY_FIELDS[number]['key'][]]),z.string()).parse(conversation.pending_patch);
 if(!Object.keys(patch).length)throw new DomainError('NOTHING_TO_CONFIRM','No hay datos propuestos para confirmar',409);
 const updates=Object.entries(patch).map(([field,value])=>({field:field as ProposedUpdate['field'],value,evidence:value}));const state=values.accept?applyConfirmedPatch(conversation.state_json,updates):wyomingIntakeSchema.parse(conversation.state_json);
 const missing=nextMissing(state);const status=!missing?'ready_for_packet_review':'active';const assistant=values.accept?(missing?`Datos guardados. Siguiente: ${missing.label}.`:'Datos completos para preparar el paquete de revisión interno.'):'No guardé los datos propuestos. Puedes corregirlos y volver a intentarlo.';
 await repo.atomic([
  {kind:'update',table:'agent_conversations',where:{id:conversation.id,revision:conversation.revision},data:{state_json:state,pending_patch:{},revision:conversation.revision+1,status}},
  {kind:'insert',table:'agent_conversation_turns',data:{organization_id:conversation.organization_id,conversation_id:conversation.id,turn_kind:values.accept?'PATCH_ACCEPTED':'PATCH_REJECTED',customer_message:null,assistant_message:assistant,proposed_patch:patch,model_status:'NOT_APPLICABLE',client_request_id:values.clientRequestId,created_by:actor.id}}
 ]);
 const current=(await repo.list<ConversationRecord>('agent_conversations',{id:conversation.id}))[0];const result=await response(repo,current);
 return{...result,packetPreview:status==='ready_for_packet_review'?prepareWyomingPacket(state,{caseId:conversation.case_id,revision:Number((await repo.list<FormationRecord>('formation_cases',{id:conversation.case_id}))[0].revision)},now):null};
}
