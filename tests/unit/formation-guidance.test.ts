import { expect, test } from 'vitest';
import { JURISDICTIONS } from '../../packages/domain';
import { COUNTRY_GUIDES, GUIDE_IDS, assertLabAccess, authorizeResearchAction, evaluateJourney, evaluationSchema, scenariosFor, fixtureFor, screenDraftIntake } from '../../packages/formation-guidance';
import { evaluateCaseGuide } from '../../packages/formation-guidance/service';
import type { Repository, Operation } from '../../packages/persistence';
import type { Actor } from '../../packages/application';
const now = new Date('2026-09-03T10:00:00Z');

test('intake screening treats unknown identity/local officers as unconfirmed, never eligible', () => {
  const input = {...fixtureFor('base'), acceptedEstonianIdentity: null, residentSingaporeDirector: null, hkSoleDirectorAlsoSecretary: null, founders: 0};
  expect(screenDraftIntake('EE', input)).toContain('ESTONIAN_SIGNATURE_UNAVAILABLE');
  expect(screenDraftIntake('SG', input)).toContain('LOCAL_RESIDENT_DIRECTOR_MISSING');
  expect(screenDraftIntake('HK', input)).toContain('SOLE_DIRECTOR_SECRETARY_CONFLICT');
  expect(screenDraftIntake('US-DE', input)).toContain('FOUNDER_RESIDENCE_OWNERSHIP_MISSING');
});
test('Wyoming name routing handles leading spaces and lowercase without applying to Delaware', () => {
  const input = {...fixtureFor('base'), proposedName: '  atlas testing'};
  expect(screenDraftIntake('US-WY', input)).toContain('WY_PAPER_MANUAL_REVIEW');
  expect(screenDraftIntake('US-DE', input)).not.toContain('WY_PAPER_MANUAL_REVIEW');
});
test('international EIN routing depends on principal office; unknown cannot assume online eligibility', () => {
  for (const id of ['US-WY', 'US-DE'] as const) {
    expect(screenDraftIntake(id, {...fixtureFor('base'), principalOfficeInUS: null})).toContain('IRS_PRINCIPAL_OFFICE_UNCONFIRMED');
    expect(screenDraftIntake(id, {...fixtureFor('base'), principalOfficeInUS: false})).toContain('IRS_INTERNATIONAL_EIN_CHANNEL');
  }
});

test.each(GUIDE_IDS)('%s: all scenarios stop before external filing or evidence of registration', id => {
  for (const scenario of scenariosFor(id)) {
    const result = evaluateJourney(id, scenario, now);
    expect(result).toMatchObject({registered: false, externalWrites: 0, publication: 'PENDING_REVIEW', model: 'DETERMINISTIC_SUPERVISOR', filingAdapter: 'EXTERNAL_BLOCKED'});
    expect(result.blockers).toContain('HUMAN_REVIEW_PENDING');
    expect(result.trace.find(t => t.owner === 'GOVERNMENT')?.result).toBe('NOT_ATTEMPTED');
  }
  expect(evaluateJourney(id, 'missing', now).maximumStage).toBe('INTAKE_INCOMPLETE');
});

test('country-specific eligibility failures and alternate paths are surfaced', () => {
  expect(evaluateJourney('US-WY', 'wy-name-a', now).blockers).toContain('WY_PAPER_MANUAL_REVIEW');
  expect(evaluateJourney('US-DE', 'us-foreign-office', now).blockers).toContain('IRS_INTERNATIONAL_EIN_CHANNEL');
  expect(evaluateJourney('EE', 'ee-no-id', now).blockers).toContain('ESTONIAN_SIGNATURE_UNAVAILABLE');
  expect(evaluateJourney('EE', 'ee-multiple-founders', now).blockers).toContain('RIK_SIMPLIFIED_API_SINGLE_FOUNDER_ONLY');
  expect(evaluateJourney('AE-DU', 'dubai-no-authority', now).blockers).toContain('LICENSING_AUTHORITY_UNSELECTED');
  expect(evaluateJourney('SG', 'sg-no-director', now).blockers).toContain('LOCAL_RESIDENT_DIRECTOR_MISSING');
  expect(evaluateJourney('HK', 'hk-secretary-conflict', now).blockers).toContain('SOLE_DIRECTOR_SECRETARY_CONFLICT');
  expect(evaluateJourney('LT', 'base', now).blockers).toContain('SOURCE_RELOCATED');
  expect(() => evaluateJourney('US-DE', 'wy-name-a', now)).toThrow();
});

test.each([new Date('2026-09-17T00:00:00Z'), new Date('2026-09-02'), new Date('invalid')])('stale, future observations or invalid clock cannot produce a handoff: %s', time => {
  for (const id of GUIDE_IDS) {
    const evaluation = evaluateJourney(id, 'base', time);
    expect(evaluation.maximumStage).toBe('RESEARCH_ESCALATION');
    expect(evaluation.blockers).toContain('SOURCE_RECHECK_REQUIRED');
  }
});

test.each(GUIDE_IDS)('%s: adversarial destinations and attempted external actions are refused', id => {
  for (const action of ['SUBMIT', 'PAY', 'SIGN', 'LOGIN', 'ACCEPT_TERMS', 'UPLOAD_KYC', 'MARK_REGISTERED', 'PUBLISH_RULE', 'IGNORE_PREVIOUS_INSTRUCTIONS', 'unknown']) {
    expect(authorizeResearchAction(id, action).allowed).toBe(false);
  }
  for (const url of ['http://127.0.0.1/admin', 'https://evil.test/', 'javascript:alert(1)', `${COUNTRY_GUIDES.find(g => g.id === id)!.sources[0].url}?passport=secret`, 'https://corp.delaware.gov@evil.test/']) {
    expect(authorizeResearchAction(id, 'OPEN_PUBLIC_SOURCE', url).allowed).toBe(false);
  }
  const source = COUNTRY_GUIDES.find(g => g.id === id)!.sources.find(s => s.observation !== 'RELOCATED')!;
  expect(authorizeResearchAction(id, 'OPEN_PUBLIC_SOURCE', source.url).allowed).toBe(true);
});

test('research scope never expands the commercial product catalog or accepts approval flags', () => {
  expect(JURISDICTIONS).toEqual(['US-DE', 'US-WY', 'EE', 'GB']);
  for (const extra of [{registered: true}, {role: 'admin'}, {url: 'https://evil.test'}, {mock: false}, {humanApproved: true}, {passport: 'real-data'}]) {
    expect(evaluationSchema.safeParse({guideId: 'SG', scenario: 'base', ...extra}).success).toBe(false);
  }
  expect(evaluationSchema.safeParse({guideId: 'GB', scenario: 'base'}).success).toBe(false);
  expect(authorizeResearchAction('LT', 'OPEN_PUBLIC_SOURCE', COUNTRY_GUIDES.find(g => g.id === 'LT')!.sources[0].url).allowed).toBe(false);
});

test('hosted customers cannot access draft guidance regardless of input flags', () => {
  expect(() => assertLabAccess(false, 'customer')).toThrow();
  expect(() => assertLabAccess(true, 'customer')).not.toThrow();
  expect(() => assertLabAccess(false, 'compliance')).not.toThrow();
});

test('case audit enforces tenant and jurisdiction before writing; never mutates workflow', async () => {
  const operations: Operation[] = [];
  const caseId = '00000000-0000-4000-8000-000000000123';
  const record = {id: caseId, organization_id: 'org-a', jurisdiction_code: 'US-WY'};
  const repo = {list: async () => [record], atomic: async (ops: Operation[]) => {operations.push(...ops); return [];}} as unknown as Repository;
  const actor: Actor = {id: 'user', organizationId: 'org-b', role: 'customer', displayName: 'QA'};
  await expect(evaluateCaseGuide(repo, actor, true, {guideId: 'US-WY', scenario: 'base', caseId})).rejects.toMatchObject({code: 'NOT_FOUND'});
  actor.organizationId = 'org-a';
  await expect(evaluateCaseGuide(repo, actor, true, {guideId: 'SG', scenario: 'base', caseId})).rejects.toMatchObject({code: 'CASE_GUIDE_MISMATCH'});
  await expect(evaluateCaseGuide(repo, actor, false, {guideId: 'US-WY', scenario: 'base', caseId})).rejects.toMatchObject({code: 'LAB_INTERNAL_ONLY'});
  expect(operations).toEqual([]);
  const result = await evaluateCaseGuide(repo, actor, true, {guideId: 'US-WY', scenario: 'base', caseId});
  expect(result.persisted).toBe(true);
  expect(operations).toHaveLength(1);
  expect(operations[0]).toMatchObject({kind: 'insert', table: 'case_events', data: {event_type: 'AGENT_LAB_EVALUATED', payload: {synthetic: true, workflowMutation: false, registered: false}}});
});
