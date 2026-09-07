import {DomainError} from '../domain';
import {owned,type Actor,type FormationRecord} from '../application';
import type {Repository} from '../persistence';
import {assertLabAccess} from '../formation-guidance';
import {wyomingPacketRequest} from './catalog';
import {prepareWyomingPacket,simulatePacketReceipt} from './wyoming';

export async function evaluateWyomingPacket(repo:Repository,actor:Actor,sandbox:boolean,input:unknown,now=new Date()){
  assertLabAccess(sandbox,actor.role);
  const values=wyomingPacketRequest.parse(input);
  if(!sandbox&&values.caseId)throw new DomainError('LAB_CASE_WRITE_DISABLED','No se vincula investigación a expedientes alojados',403);
  const record=values.caseId?owned((await repo.list<FormationRecord>('formation_cases',{id:values.caseId}))[0],actor):null;
  if(record){
    if(record.jurisdiction_code!=='US-WY')throw new DomainError('CASE_GUIDE_MISMATCH','El expediente no corresponde a Wyoming');
    if(record.execution_mode!=='SANDBOX')throw new DomainError('LAB_CASE_WRITE_DISABLED','Solo se admite vincular casos sintéticos locales',403);
    if(record.revision!==values.caseRevision)throw new DomainError('CONFLICT','El expediente cambió. Recarga antes de preparar el paquete.',409);
    if(['CANCELLED','REJECTED'].includes(record.status))throw new DomainError('TERMINAL_CASE','El expediente no admite nuevas preparaciones',409);
  }
  const packet=prepareWyomingPacket(values.intake,record?{caseId:record.id,revision:record.revision}:null,now);
  if(record)await repo.atomic([{kind:'insert',table:'case_events',data:{case_id:record.id,organization_id:record.organization_id,event_type:'WY_PACKET_PREPARED',actor_type:actor.role,actor_user_id:actor.id,
    payload:{version:packet.version,packetHash:packet.packetHash,caseRevision:record.revision,synthetic:true,workflowMutation:false,inputStatus:packet.inputStatus,blockerCodes:[...new Set(packet.blockers.map(b=>b.code))]}}}]);
  // Only operational metadata is persisted, never addresses, questionnaire values or draft legal guidance.
  return {packet,receipt:simulatePacketReceipt(packet),persisted:Boolean(record)};
}
