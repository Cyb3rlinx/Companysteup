import { type Jurisdiction } from '../domain';
import type { FormationRecord } from '../application';
import type { Row } from '../persistence';

export const CASE_AGENT_VERSION = '2026-09-03.1';
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
};
export function trackCase(record: FormationRecord, allEvents: Row[], now = new Date()) {
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
    requiresEvidenceReview: !sandbox && (state.registered || ['SUBMITTED','REGISTERED','POST_FORMATION','ACTIVE_COMPLIANCE'].includes(record.status)),
    blockers, canPrepare: !terminal,
    activity: events.filter(e => eventLabels[String(e.event_type)]).slice(0,8).map(e => ({id: String(e.id), label: eventLabels[String(e.event_type)], at: String(e.created_at), synthetic: sandbox || String(e.event_type).startsWith('SANDBOX') || e.event_type === 'AGENT_LAB_EVALUATED'})),
  };
}
export type CaseTracking = ReturnType<typeof trackCase>;
