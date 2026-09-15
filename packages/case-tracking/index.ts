import { type Jurisdiction } from '../domain';
import type { FormationRecord } from '../application';
import type { Row } from '../persistence';
import { WY_FIELDS } from '../formation-packet/catalog';
import { DE_FIELDS } from '../formation-packet/delaware-catalog';
import { EE_FIELDS } from '../formation-packet/estonia-catalog';
import { UK_FIELDS } from '../formation-packet/uk-catalog';

export const CASE_AGENT_VERSION = '2026-09-03.1';
export const OPS_SLA_POLICY_VERSION = '2026-09-15.1';
export const CASE_AGENTS: Record<Jurisdiction,{id: string; name: string}> = {
  'US-WY': {id: 'case-wyoming', name: 'Asistente Wyoming LLC'},
  'US-DE': {id: 'case-delaware', name: 'Asistente Delaware LLC'},
  EE: {id: 'case-estonia', name: 'Asistente Estonia OÜ'},
  GB: {id: 'case-uk', name: 'Asistente UK Ltd'},
};
export type ProgressBlocker = {code: string; message: string; owner: string};
const owners = {YOU: 'Tú', WE_PREPARE: 'Equipo de preparación', PARTNER: 'Proveedor autorizado', GOVERNMENT: 'Autoridad'};
const eventLabels: Record<string,string> = {
  CASE_CREATED: 'Expediente creado', CASE_BRIEF_STARTED: 'Preparación del resumen iniciada',
  CASE_BRIEF_COMPLETED: 'Resumen del expediente preparado', CASE_BRIEF_FAILED: 'Preparación interrumpida; requiere reintento',
  STEP_COMPLETED: 'Paso del expediente completado', SANDBOX_STEP_COMPLETED: 'Paso completado en simulación',
  SANDBOX_PAYMENT: 'Pago simulado', PAYMENT_CONFIRMED: 'Pago de plataforma confirmado',
  AGENT_LAB_EVALUATED: 'Evaluación sintética del laboratorio',
  WY_PACKET_PREPARED: 'Paquete Wyoming preparado en ensayo sintético',
  DE_PACKET_PREPARED: 'Paquete Delaware preparado en ensayo sintético',
  EE_PACKET_PREPARED: 'Paquete Estonia preparado en ensayo sintético',
  UK_PACKET_PREPARED: 'Paquete UK preparado en ensayo sintético',
  AGENT_CONVERSATION_STARTED: 'Onboarding conversacional iniciado por el cliente',
  AGENT_TURN_COMPLETED: 'Respuesta de onboarding procesada',
  AGENT_PATCH_ACCEPTED: 'Datos de onboarding confirmados por el cliente',
  AGENT_PATCH_REJECTED: 'Propuesta de onboarding rechazada por el cliente',
};
export type ConversationTrackingInput = Pick<Row,'organization_id'|'case_id'|'status'|'execution_mode'|'state_json'|'pending_patch'|'updated_at'>;
export function trackCase(record: FormationRecord, allEvents: Row[], now = new Date(), conversation?: ConversationTrackingInput | null, allEscalations: Row[] = []) {
  const state = record.workflow_state;
  const agent = CASE_AGENTS[record.jurisdiction_code];
  const events = allEvents.filter(e => e.case_id === record.id && e.organization_id === record.organization_id)
    .sort((a,b) => new Date(String(b.created_at)).getTime()-new Date(String(a.created_at)).getTime() || Number(b.id)-Number(a.id));
  const sandbox = record.execution_mode === 'SANDBOX';
  const terminal = ['CANCELLED','REJECTED'].includes(record.status);
  const next = state.steps.find(step => step.status !== 'completed');
  const blockers: ProgressBlocker[] = [];
  if (!terminal) {
    if (!state.signals.riskApproved) blockers.push({code: 'REVIEW_PENDING', message: 'Revisión humana del expediente pendiente.', owner: 'Equipo de cumplimiento'});
    if (!state.paid) blockers.push({code: 'PAYMENT_PENDING', message: 'La orden de plataforma está pendiente. La preparación del resumen no requiere pagar.', owner: 'Plataforma'});
    if (!state.signals.identityVerified) blockers.push({code: 'IDENTITY_PENDING', message: 'La identidad aún no tiene verificación registrada.', owner: 'Tú / proveedor autorizado'});
    if (!state.signals.partnerVerified) blockers.push({code: 'PROVIDER_PENDING', message: 'Falta validar el proveedor y su alcance de actuación.', owner: 'Operaciones'});
    if (!state.signals.signaturesComplete) blockers.push({code: 'SIGNATURE_PENDING', message: 'Firmas y declaraciones pendientes de revisión.', owner: 'Tú / firmantes'});
    if (!sandbox) blockers.push({code: 'EXTERNAL_BLOCKED', message: 'Presentación externa sin integración autorizada; no se ha confirmado un envío al registro.', owner: 'Operaciones / autoridad'});
    if (next?.blockingReason) blockers.push({code: 'STEP_BLOCKED', message: 'El paso actual necesita revisión. Consulta al equipo por el canal de soporte.', owner: owners[next.actor]});
  }
  const runEvents = events.filter(e => ['CASE_BRIEF_STARTED','CASE_BRIEF_COMPLETED','CASE_BRIEF_FAILED'].includes(String(e.event_type)));
  const latest = runEvents[0];
  const payload = latest?.payload as {agentId?: string; version?: string; caseRevision?: number; runId?: string} | undefined;
  const age = latest ? now.getTime()-new Date(String(latest.created_at)).getTime() : 0;
  let runStatus: 'NOT_STARTED'|'RUNNING'|'COMPLETED'|'FAILED'|'UNCONFIRMED'|'OUTDATED' = 'NOT_STARTED';
  if (latest) {
    if (payload?.agentId !== agent.id || payload.version !== CASE_AGENT_VERSION || payload.caseRevision !== record.revision) runStatus = 'OUTDATED';
    else if (latest.event_type === 'CASE_BRIEF_COMPLETED') runStatus = 'COMPLETED';
    else if (latest.event_type === 'CASE_BRIEF_FAILED') runStatus = 'FAILED';
    else runStatus = Number.isFinite(age) && age >= 0 && age < 120000 ? 'RUNNING' : 'UNCONFIRMED';
  }
  const completed = state.steps.filter(step => step.status === 'completed').length;
  const conversationAvailable=['US-WY','US-DE','EE','GB'].includes(record.jurisdiction_code);
  const intakeFields=record.jurisdiction_code==='US-DE'?DE_FIELDS:record.jurisdiction_code==='EE'?EE_FIELDS:record.jurisdiction_code==='GB'?UK_FIELDS:WY_FIELDS;
  const matchingConversation=conversationAvailable&&conversation?.organization_id===record.organization_id&&conversation.case_id===record.id?conversation:null;
  const intakeState=matchingConversation?.state_json&&typeof matchingConversation.state_json==='object'&&!Array.isArray(matchingConversation.state_json)?matchingConversation.state_json as Record<string,unknown>:{};
  const pendingState=matchingConversation?.pending_patch&&typeof matchingConversation.pending_patch==='object'&&!Array.isArray(matchingConversation.pending_patch)?matchingConversation.pending_patch as Record<string,unknown>:{};
  const confirmedFields=intakeFields.filter(field=>typeof intakeState[field.key]==='string'&&String(intakeState[field.key]).trim().length>0).length;
  const pendingFields=intakeFields.filter(field=>typeof pendingState[field.key]==='string'&&String(pendingState[field.key]).trim().length>0).length;
  const intakeStatus=matchingConversation?(matchingConversation.status==='ready_for_packet_review'?'READY_FOR_REVIEW':'ACTIVE'):'NOT_STARTED';
  const nextMissingField=intakeFields.find(field=>typeof intakeState[field.key]!=='string'||!String(intakeState[field.key]).trim())?.label??null;
  const openEscalations=allEscalations.filter(item=>item.organization_id===record.organization_id&&item.case_id===record.id&&item.status==='open');
  const severityRank:Record<string,number>={LOW:1,MEDIUM:2,HIGH:3,CRITICAL:4};
  const highestEscalation=openEscalations.sort((a,b)=>(severityRank[String(b.severity)]??0)-(severityRank[String(a.severity)]??0)||new Date(String(a.created_at)).getTime()-new Date(String(b.created_at)).getTime())[0];
  const addHours=(value:unknown,hours:number)=>{const timestamp=new Date(String(value)).getTime();return Number.isFinite(timestamp)?new Date(timestamp+hours*3600000).toISOString():null;};
  let attention:'TERMINAL'|'ESCALATED'|'AGENT_ATTENTION'|'READY_FOR_REVIEW'|'WAITING_CUSTOMER_CONFIRMATION'|'WAITING_CUSTOMER'|'MONITOR'='MONITOR';let attentionLabel='Seguimiento operativo';let attentionOwner='Operaciones';let slaDueAt:string|null=null;
  if(terminal){attention='TERMINAL';attentionLabel='Expediente cerrado';attentionOwner='Sin acciones en curso';}
  else if(highestEscalation){const hours={CRITICAL:2,HIGH:4,MEDIUM:12,LOW:24}[String(highestEscalation.severity)]??24;attention='ESCALATED';attentionLabel='Excepción abierta para revisión';attentionOwner='Cumplimiento / operaciones';slaDueAt=addHours(highestEscalation.created_at,hours);}
  else if(['FAILED','UNCONFIRMED'].includes(runStatus)){attention='AGENT_ATTENTION';attentionLabel='Revisar ejecución del preparador';attentionOwner='Operaciones';slaDueAt=addHours(latest?.created_at,4);}
  else if(intakeStatus==='READY_FOR_REVIEW'){attention='READY_FOR_REVIEW';attentionLabel='Paquete listo para revisión interna';attentionOwner='Revisor humano';slaDueAt=addHours(matchingConversation?.updated_at,8);}
  else if(pendingFields){attention='WAITING_CUSTOMER_CONFIRMATION';attentionLabel='Esperando confirmación del cliente';attentionOwner='Cliente';}
  else if(intakeStatus==='ACTIVE'||intakeStatus==='NOT_STARTED'){attention='WAITING_CUSTOMER';attentionLabel=intakeStatus==='ACTIVE'?'Esperando información del cliente':'Esperando inicio del onboarding';attentionOwner='Cliente';}
  const slaTimestamp=slaDueAt?new Date(slaDueAt).getTime():null;const nowTimestamp=now.getTime();const slaBreached=slaTimestamp!==null&&Number.isFinite(nowTimestamp)&&nowTimestamp>slaTimestamp;
  const latestActivity=events.find(item=>eventLabels[String(item.event_type)]);
  return {
    caseId: record.id, jurisdiction: record.jurisdiction_code, revision: record.revision,
    mode: sandbox ? 'SANDBOX' as const : 'GUIDED' as const,
    agent: {...agent, version: CASE_AGENT_VERSION, engine: 'DETERMINISTIC' as const, runStatus, lastRunAt: latest ? String(latest.created_at) : null},
    status: terminal ? record.status === 'CANCELLED' ? 'Expediente cancelado' : 'Expediente rechazado' : next?.title || 'Pasos internos completados',
    nextOwner: terminal ? 'Sin acciones en curso' : next ? owners[next.actor] : 'Equipo de cumplimiento',
    nextAction: terminal ? 'Consulta a soporte si necesitas revisar este expediente.' : blockers[0]?.message || 'Revisar la evidencia y el siguiente paso con el responsable.',
    completedSteps: completed, totalSteps: state.steps.length,
    progressPercent: state.steps.length ? Math.round(100*completed/state.steps.length) : 0,
    registrationConfirmed: false as const,
    registrationLabel: sandbox ? state.registered ? 'Registro simulado; sin efecto legal' : 'Sandbox; sin registro real' : 'Sin confirmación oficial de constitución',
    filingLabel: sandbox ? 'Ningún envío real desde este sandbox' : 'Presentación externa no confirmada',
    intake: {available: conversationAvailable, jurisdiction: conversationAvailable?record.jurisdiction_code:null, status: conversationAvailable?intakeStatus:'NOT_AVAILABLE', label: !conversationAvailable?'Agente conversacional aún no implementado para esta ruta':intakeStatus==='READY_FOR_REVIEW'?'Información completa; requiere revisión interna':intakeStatus==='ACTIVE'?'Onboarding iniciado por el cliente':'El cliente aún no inició el onboarding', confirmedFields, pendingFields, totalFields: intakeFields.length, executionMode: matchingConversation?.execution_mode==='OPENAI_RESPONSES'?'OPENAI_RESPONSES':matchingConversation?'DETERMINISTIC_MOCK':null, updatedAt: matchingConversation?.updated_at?String(matchingConversation.updated_at):null},
    operations:{policyVersion:OPS_SLA_POLICY_VERSION,attention,attentionLabel,owner:attentionOwner,nextMissingField,openEscalations:openEscalations.length,highestSeverity:highestEscalation?String(highestEscalation.severity):null,slaDueAt,slaBreached,latestEvent:latestActivity?{label:eventLabels[String(latestActivity.event_type)],at:String(latestActivity.created_at)}:null},
    requiresEvidenceReview: !sandbox && (state.registered || ['SUBMITTED','REGISTERED','POST_FORMATION','ACTIVE_COMPLIANCE'].includes(record.status)),
    blockers, canPrepare: !terminal,
    activity: events.filter(e => eventLabels[String(e.event_type)]).slice(0,8).map(e => ({id: String(e.id), label: eventLabels[String(e.event_type)], at: String(e.created_at), synthetic: sandbox || String(e.event_type).startsWith('SANDBOX') || e.event_type === 'AGENT_LAB_EVALUATED'})),
  };
}
export type CaseTracking = ReturnType<typeof trackCase>;
