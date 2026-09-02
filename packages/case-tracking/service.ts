import { z } from 'zod';
import { DomainError } from '../domain';
import { owned, type Actor, type FormationRecord, type BusinessRecord } from '../application';
import type { Repository, Row } from '../persistence';
import { CASE_AGENTS, CASE_AGENT_VERSION, trackCase } from './index';
import { prepareFormationDocument } from '../document-engine';

export async function prepareCaseBrief(repo: Repository, actor: Actor, input: unknown) {
  const {caseId} = z.object({caseId: z.uuid()}).strict().parse(input);
  const record = owned((await repo.list<FormationRecord>('formation_cases', {id: caseId}))[0], actor);
  if (['CANCELLED','REJECTED'].includes(record.status)) throw new DomainError('TERMINAL_CASE', 'El expediente no admite nuevas preparaciones', 409);
  const agent = CASE_AGENTS[record.jurisdiction_code];
  const payload = {runId: crypto.randomUUID(), agentId: agent.id, version: CASE_AGENT_VERSION, caseRevision: record.revision, engine: 'DETERMINISTIC', synthetic: record.execution_mode === 'SANDBOX', workflowMutation: false};
  const event = async (event_type: string, extra: Row = {}) => repo.atomic([{kind: 'insert', table: 'case_events', data: {case_id: record.id, organization_id: record.organization_id, actor_type: actor.role, actor_user_id: actor.id, event_type, payload: {...payload, ...extra}}}]);
  await event('CASE_BRIEF_STARTED');
  try {
    const business = owned((await repo.list<BusinessRecord>('business_profiles', {id: record.business_profile_id}))[0], actor);
    if (business.organization_id !== record.organization_id) throw new DomainError('NOT_FOUND', 'Recurso no encontrado', 404);
    const draft = prepareFormationDocument(record.jurisdiction_code, business.questionnaire);
    const current = (await repo.list<FormationRecord>('formation_cases', {id: record.id}))[0];
    if (!current || current.revision !== record.revision) throw new DomainError('CONFLICT', 'El expediente cambió. Actualiza antes de preparar el resumen.', 409);
    // Only operational metadata is stored. No questionnaire, legal advice or sensitive identifiers in event payloads.
    await event('CASE_BRIEF_COMPLETED', {documentStatus: draft.status, pendingItemCount: draft.missing.length});
    return {agent, version: CASE_AGENT_VERSION, runId: payload.runId, draft, tracking: trackCase(record, await repo.list('case_events', {case_id: record.id}, {orderBy:'id',descending:true,limit:100}))};
  } catch (error) {
    try { await event('CASE_BRIEF_FAILED'); } catch { /* Started executions expire to UNCONFIRMED in the read model. */ }
    if (error instanceof DomainError) throw error;
    throw new DomainError('BRIEF_FAILED', 'No se pudo preparar el resumen. Vuelve a intentarlo.', 503);
  }
}
