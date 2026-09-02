import { owned, type Actor, type FormationRecord } from '../application';
import type { Repository } from '../persistence';
import { DomainError } from '../domain';
import { assertLabAccess, evaluationSchema, evaluateJourney } from './index';

export async function evaluateCaseGuide(repo: Repository, actor: Actor, sandbox: boolean, input: unknown) {
  assertLabAccess(sandbox, actor.role);
  const values = evaluationSchema.parse(input);
  const record = values.caseId ? owned((await repo.list<FormationRecord>('formation_cases', {id: values.caseId}))[0], actor) : undefined;
  if (record && record.jurisdiction_code !== values.guideId) throw new DomainError('CASE_GUIDE_MISMATCH', 'El expediente no corresponde a esta guía');
  const evaluation = evaluateJourney(values.guideId, values.scenario);
  if (record) await repo.atomic([{kind: 'insert', table: 'case_events', data: {
    organization_id: record.organization_id, case_id: record.id, event_type: 'AGENT_LAB_EVALUATED',
    actor_type: actor.role, actor_user_id: actor.id,
    payload: {...evaluation, synthetic: true, workflowMutation: false},
  }}]);
  return {...evaluation, caseId: record?.id ?? null, persisted: Boolean(record)};
}
