import { z } from 'zod';
export const JURISDICTIONS = ['US-DE', 'US-WY', 'EE', 'GB'] as const;
export type Jurisdiction = typeof JURISDICTIONS[number];
export const ENTITY_TYPES = ['LLC', 'OU', 'LTD_PRIVATE_SHARES'] as const;
export const AUTOMATION_LEVELS = ['A_FULLY_AUTOMATABLE','B_AUTOMATABLE_WITH_REVIEW','C_EXTERNAL_API','D_LICENSED_PARTNER','E_CUSTOMER_ACTION','F_GOVERNMENT_OR_BANK'] as const;
export const RULE_STATUSES = ['DRAFT','PENDING_REVIEW','ACTIVE','NEEDS_REVIEW','SUPERSEDED','ARCHIVED'] as const;
export const RISK_LEVELS = ['LOW','MEDIUM','HIGH','CRITICAL'] as const;
export const CASE_STATUSES = ['DRAFT','QUALIFYING','ELIGIBLE','REVIEW_REQUIRED','AWAITING_PAYMENT','ONBOARDING','AWAITING_CUSTOMER','AWAITING_PARTNER','READY_TO_FILE','SUBMITTED','REGISTERED','POST_FORMATION','ACTIVE_COMPLIANCE','REJECTED','CANCELLED'] as const;
export type CaseStatus = typeof CASE_STATUSES[number];
export type Role = 'customer' | 'ops' | 'compliance' | 'admin' | 'superadmin';
export type ExecutionActor = 'YOU' | 'WE_PREPARE' | 'PARTNER' | 'GOVERNMENT';
export type IntegrationStatus = 'LIVE' | 'SANDBOX' | 'EXTERNAL_BLOCKED';
export const country = z.string().regex(/^[A-Z]{2}$/);
export const founderSchema = z.object({
  legalFirstName:z.string().trim().min(1).max(100), legalLastName:z.string().trim().min(1).max(100),
  nationality:country, residence:country, taxResidences:z.array(country).min(1),
  dateOfBirth:z.iso.date().refine(d => { const age = (Date.now()-Date.parse(d))/(365.2425*86400000); return age>=18 && age<120; },'Debes ser mayor de edad'),
});
export const questionnaireSchema = z.object({
  proposedName:z.string().trim().min(2).max(120), activity:z.string().trim().min(10).max(2000),
  nationality:country, residence:country, taxResidences:z.array(country).min(1),
  founderCount:z.number().int().min(1).max(100), ownershipPercent:z.number().min(0).max(100),
  expectedRevenueMinor:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), currency:z.enum(['USD','EUR','GBP']),
  customerCountries:z.array(country).min(1), operatingCountries:z.array(country).min(1),
  hasEmployees:z.boolean(), plansFundraising:z.boolean(), requiresUsd:z.boolean(), requiresEur:z.boolean(), needsStripe:z.boolean(),
  physicalOffice:z.boolean(), inventory:z.boolean(), crypto:z.boolean(), regulated:z.boolean(),
  eResident:z.boolean(), boardInEstonia:z.boolean(), legalAddressInEstonia:z.boolean(),
  directorsVerified:z.boolean(), pscVerified:z.boolean(), foreignOwnedDisregarded:z.boolean(),
  wyomingAssetsMinor:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  consent:z.literal(true),
}).refine(x => x.founderCount !== 1 || x.ownershipPercent === 100, { message:'Un único propietario debe sumar 100% de titularidad',path:['ownershipPercent'] });
export type Questionnaire = z.infer<typeof questionnaireSchema>;
export const demoQuestionnaire: Questionnaire = {
  proposedName:'Andes Studio', activity:'Consultoría de diseño y desarrollo de software para empresas',
  nationality:'MX', residence:'MX', taxResidences:['MX'], founderCount:1, ownershipPercent:100,
  expectedRevenueMinor:10000000, currency:'USD', customerCountries:['US'], operatingCountries:['MX'],
  hasEmployees:false, plansFundraising:false, requiresUsd:true, requiresEur:false, needsStripe:true,
  physicalOffice:false, inventory:false, crypto:false, regulated:false, eResident:false,
  boardInEstonia:false, legalAddressInEstonia:true, directorsVerified:false, pscVerified:false,
  foreignOwnedDisregarded:true, wyomingAssetsMinor:0, consent:true,
};
export class DomainError extends Error {
  constructor(public code:string, message:string, public status=400) { super(message); }
}
export function assertInternal(role:Role) { if(!['ops','compliance','admin','superadmin'].includes(role)) throw new DomainError('FORBIDDEN','Acceso interno requerido',403); }
export function assertCompliance(role:Role) { if(!['compliance','admin','superadmin'].includes(role)) throw new DomainError('FORBIDDEN','Revisión de cumplimiento requerida',403); }
