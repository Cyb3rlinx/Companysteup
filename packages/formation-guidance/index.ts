import { z } from 'zod';
import { DomainError, type Role } from '../domain';
import { GUIDE_IDS, GUIDE_VERSION, countryGuide, type GuideId } from './catalog';
export { COUNTRY_GUIDES, GUIDE_VERSION, GUIDE_IDS } from './catalog';

// Evidence dates describe research observations, never an effective law or approval.
export const OBSERVED_AT = '2026-09-03T00:00:00+07:00';
export const RECHECK_AFTER = '2026-09-17T00:00:00+07:00';
export const SCENARIOS = ['base', 'missing', 'wy-name-a', 'us-foreign-office', 'ee-no-id', 'ee-multiple-founders', 'gb-no-director-id', 'gb-psc-unlinked', 'gb-address-mismatch', 'dubai-no-authority', 'sg-no-director', 'hk-secretary-conflict'] as const;
export type Scenario = typeof SCENARIOS[number];
export const evaluationSchema = z.object({guideId: z.enum(GUIDE_IDS), scenario: z.enum(SCENARIOS), caseId: z.uuid().optional()}).strict();
export function assertLabAccess(sandbox: boolean, role: Role) {
  if (!sandbox && !['ops', 'compliance', 'admin', 'superadmin'].includes(role)) throw new DomainError('LAB_INTERNAL_ONLY', 'Investigación interna: no disponible para clientes fuera del sandbox', 403);
}
export function scenariosFor(id: GuideId): readonly Scenario[] {
  return ['base', 'missing', ...({ 'US-WY': ['wy-name-a', 'us-foreign-office'], 'US-DE': ['us-foreign-office'], EE: ['ee-no-id', 'ee-multiple-founders'], GB: ['gb-no-director-id', 'gb-psc-unlinked', 'gb-address-mismatch'], LT: [], 'AE-DU': ['dubai-no-authority'], SG: ['sg-no-director'], HK: ['hk-secretary-conflict'] } as const)[id]];
}
export const scenarioLabels: Record<Scenario, string> = {
  base: 'Expediente ficticio base', missing: 'Faltan datos del fundador',
  'wy-name-a': 'Wyoming: nombre Andes comienza con A', 'us-foreign-office': 'EE. UU.: domicilio principal fuera del país',
  'ee-no-id': 'Estonia: firmante sin identidad digital admitida', 'ee-multiple-founders': 'Estonia: API con dos fundadores',
  'dubai-no-authority': 'Dubái: sin elegir mainland o zona franca', 'sg-no-director': 'Singapur: sin director residente local',
  'hk-secretary-conflict': 'Hong Kong: director único también secretario único',
  'gb-no-director-id': 'UK: director sin verificación de identidad',
  'gb-psc-unlinked': 'UK: director verificado, rol PSC pendiente',
  'gb-address-mismatch': 'UK: domicilio fuera de la nación de registro',
};
export type Trace = { stage: string; owner: 'PLATFORM' | 'USER' | 'PROVIDER' | 'GOVERNMENT' | 'REVIEWER'; result: 'PREPARED' | 'BLOCKED' | 'NOT_ATTEMPTED'; reason: string };
export type DraftIntake = {
  proposedName: string; residenceDeclared: boolean; ownershipDeclared: boolean;
  principalOfficeInUS: boolean | null; acceptedEstonianIdentity: boolean | null;
  founders: number | null; dubaiAuthority: 'MAINLAND' | 'NAMED_FREE_ZONE' | null;
  residentSingaporeDirector: boolean | null; hkSoleDirectorAlsoSecretary: boolean | null;
  ukDirectorsVerified: boolean | null; ukPscLinked: boolean | null; ukAddressMatchesNation: boolean | null;
};
export function fixtureFor(scenario: Scenario): DraftIntake {
  const base: DraftIntake = {proposedName: 'Orbit QA', residenceDeclared: true, ownershipDeclared: true, principalOfficeInUS: true, acceptedEstonianIdentity: true, founders: 1, dubaiAuthority: 'MAINLAND', residentSingaporeDirector: true, hkSoleDirectorAlsoSecretary: false, ukDirectorsVerified: true, ukPscLinked: true, ukAddressMatchesNation: true};
  if (scenario === 'missing') return {...base, residenceDeclared: false, ownershipDeclared: false};
  if (scenario === 'wy-name-a') return {...base, proposedName: 'Andes QA'};
  if (scenario === 'us-foreign-office') return {...base, principalOfficeInUS: false};
  if (scenario === 'ee-no-id') return {...base, acceptedEstonianIdentity: false};
  if (scenario === 'ee-multiple-founders') return {...base, founders: 2};
  if (scenario === 'dubai-no-authority') return {...base, dubaiAuthority: null};
  if (scenario === 'sg-no-director') return {...base, residentSingaporeDirector: false};
  if (scenario === 'hk-secretary-conflict') return {...base, hkSoleDirectorAlsoSecretary: true};
  if (scenario === 'gb-no-director-id') return {...base, ukDirectorsVerified: false};
  if (scenario === 'gb-psc-unlinked') return {...base, ukPscLinked: false};
  if (scenario === 'gb-address-mismatch') return {...base, ukAddressMatchesNation: false};
  return base;
}
/** Draft screening only: declarations cannot establish identity, eligibility or registration. */
export function screenDraftIntake(id: GuideId, intake: DraftIntake): string[] {
  const issues: string[] = [];
  if (!intake.proposedName.trim() || !intake.residenceDeclared || !intake.ownershipDeclared || !intake.founders || !Number.isInteger(intake.founders) || intake.founders < 1) issues.push('FOUNDER_RESIDENCE_OWNERSHIP_MISSING');
  if (id === 'US-WY' && /^a/i.test(intake.proposedName.trim())) issues.push('WY_PAPER_MANUAL_REVIEW');
  if (id === 'US-WY' || id === 'US-DE') {
    if (intake.principalOfficeInUS === false) issues.push('IRS_INTERNATIONAL_EIN_CHANNEL');
    if (intake.principalOfficeInUS === null) issues.push('IRS_PRINCIPAL_OFFICE_UNCONFIRMED');
  }
  if (id === 'EE') {
    if (intake.acceptedEstonianIdentity !== true) issues.push('ESTONIAN_SIGNATURE_UNAVAILABLE');
    if (intake.founders !== 1) issues.push('RIK_SIMPLIFIED_API_SINGLE_FOUNDER_ONLY');
  }
  if (id === 'AE-DU' && !intake.dubaiAuthority) issues.push('LICENSING_AUTHORITY_UNSELECTED');
  if (id === 'SG' && intake.residentSingaporeDirector !== true) issues.push('LOCAL_RESIDENT_DIRECTOR_MISSING');
  if (id === 'HK' && intake.hkSoleDirectorAlsoSecretary !== false) issues.push('SOLE_DIRECTOR_SECRETARY_CONFLICT');
  if (id === 'GB') {
    if (intake.ukDirectorsVerified !== true) issues.push('UK_DIRECTOR_IDENTITY_PENDING');
    if (intake.ukPscLinked !== true) issues.push('UK_PSC_ROLE_LINK_PENDING');
    if (intake.ukAddressMatchesNation !== true) issues.push('UK_REGISTERED_OFFICE_REVIEW');
  }
  return issues;
}
export type Evaluation = {
  guideId: GuideId; agent: string; version: string; scenario: Scenario; evaluatedAt: string;
  mode: 'SANDBOX'; model: 'DETERMINISTIC_SUPERVISOR'; publication: 'PENDING_REVIEW';
  filingAdapter: 'EXTERNAL_BLOCKED'; registered: false; externalWrites: 0;
  maximumStage: 'INTAKE_INCOMPLETE' | 'RESEARCH_ESCALATION' | 'DRAFT_HANDOFF';
  blockers: string[]; trace: Trace[];
};

/** Runs synthetic fixtures, not customer facts. No tool can execute an external action. */
export function evaluateJourney(id: GuideId, scenario: Scenario, now = new Date()): Evaluation {
  const guide = countryGuide(id);
  if (!scenariosFor(id).includes(scenario)) throw new DomainError('SCENARIO_MISMATCH', 'El escenario no pertenece a esta ruta');
  const blockers = ['HUMAN_REVIEW_PENDING', 'EXTERNAL_FILING_DISABLED'];
  const fresh = Number.isFinite(now.getTime()) && now >= new Date(OBSERVED_AT) && now < new Date(RECHECK_AFTER);
  if (!fresh) blockers.push('SOURCE_RECHECK_REQUIRED');
  if (guide.scope === 'RESEARCH_ONLY') blockers.push('ROLLOUT_NOT_APPROVED');
  if (id === 'LT') blockers.push('SOURCE_RELOCATED', 'DIGITAL_ROUTE_UNCONFIRMED');
  blockers.push(...screenDraftIntake(id, fixtureFor(scenario)));
  if (id === 'EE') blockers.push('RIK_LICENSE_XROAD_AGREEMENT_UNVERIFIED');
  if (id === 'SG') blockers.push('CSP_AUTHORIZATION_UNVERIFIED');
  if (id === 'HK') blockers.push('SECRETARY_PROVIDER_UNVERIFIED');
  if (id === 'US-WY' || id === 'US-DE') blockers.push('REGISTERED_AGENT_UNVERIFIED');
  if (id === 'AE-DU') blockers.push('AUTHORITY_SPECIFIC_FLOW_UNVERIFIED');
  if (id === 'GB') blockers.push('UK_FILING_ROUTE_UNVALIDATED');
  const maximumStage = scenario === 'missing' ? 'INTAKE_INCOMPLETE' : !fresh || guide.scope === 'RESEARCH_ONLY' ? 'RESEARCH_ESCALATION' : 'DRAFT_HANDOFF';
  return {
    guideId: id, agent: guide.agent, version: GUIDE_VERSION, scenario, evaluatedAt: Number.isFinite(now.getTime()) ? now.toISOString() : 'INVALID_CLOCK',
    mode: 'SANDBOX', model: 'DETERMINISTIC_SUPERVISOR', publication: 'PENDING_REVIEW', filingAdapter: 'EXTERNAL_BLOCKED', registered: false, externalWrites: 0,
    maximumStage, blockers,
    trace: [
      {stage: 'Entrevista y datos mínimos ficticios', owner: 'PLATFORM', result: scenario === 'missing' ? 'BLOCKED' : 'PREPARED', reason: scenario === 'missing' ? 'Completar residencia, titularidad y datos del fundador' : 'Fixture sintético; no identidad verificada'},
      {stage: 'Mapa de información y enlaces', owner: 'PLATFORM', result: fresh && id !== 'LT' ? 'PREPARED' : 'BLOCKED', reason: fresh && id !== 'LT' ? 'Borrador basado en páginas públicas; no demuestra acceso al formulario autenticado' : 'Revisar vigencia y localizar documentación antes de continuar'},
      {stage: 'Revisión de elegibilidad y expediente', owner: 'REVIEWER', result: 'BLOCKED', reason: guide.nextResearch},
      {stage: 'Identidad, acceso y firma', owner: 'USER', result: 'NOT_ATTEMPTED', reason: 'No se crean cuentas oficiales ni se manejan credenciales o firmas'},
      {stage: 'Proveedor y presentación', owner: 'PROVIDER', result: 'BLOCKED', reason: guide.handoff},
      {stage: 'Pago y resolución del registro', owner: 'GOVERNMENT', result: 'NOT_ATTEMPTED', reason: 'Ninguna solicitud presentada; no existe una compañía constituida por este ensayo'},
    ],
  };
}

/** Exact, static public links only. A webpage cannot introduce a tool or new destination. */
export function authorizeResearchAction(id: GuideId, action: string, url?: string): {allowed: boolean; reason: string} {
  if (action === 'EXPLAIN_FIELDS' && url === undefined) return {allowed: true, reason: 'DRAFT_ONLY'};
  if (action !== 'OPEN_PUBLIC_SOURCE' || !url) return {allowed: false, reason: 'EXTERNAL_ACTION_DISABLED'};
  const allowed = countryGuide(id).sources.some(source => source.url === url && source.observation !== 'RELOCATED');
  return {allowed, reason: allowed ? 'PUBLIC_READ_ONLY_NO_REDIRECT_AUTHORIZATION' : 'DESTINATION_NOT_ALLOWLISTED'};
}
