import { DomainError, type CaseStatus, type ExecutionActor, type Jurisdiction, type Questionnaire, type Role, type AUTOMATION_LEVELS } from '../domain';
export type StepTemplate = {code:string;title:string;actor:ExecutionActor;automation:typeof AUTOMATION_LEVELS[number];prerequisites:string[];gate?:'identity'|'agent'|'signatures'|'filing'|'confirmation'|'tax'|'eregistry'};
export type CaseStep = StepTemplate & {status:'pending'|'completed'|'blocked';completedAt?:string;reference?:string;blockingReason?:string};
export type FormationState = {jurisdiction:Jurisdiction;status:CaseStatus;paid:boolean;steps:CaseStep[];revision:number;registered:boolean;signals:{identityVerified:boolean;partnerVerified:boolean;riskApproved:boolean;signaturesComplete:boolean};events:{type:string;actor:string;at:string;step?:string}[]};
export type StepInput = {stepCode:string;reference?:string;confirmed?:boolean;mock?:boolean};
export type WorkflowCoverage = {
 totalSteps:number;
 byActor:Record<ExecutionActor,number>;
 byAutomation:Record<typeof AUTOMATION_LEVELS[number],number>;
 externalSteps:number;
 requiresLicensedPartner:boolean;
 requiresGovernment:boolean;
 canFinishWithoutExternalAuthority:boolean;
};
export const ACTOR_LABELS:Record<ExecutionActor,string>={YOU:'Tú',WE_PREPARE:'Preparamos',PARTNER:'Partner',GOVERNMENT:'Gobierno'};
export function initializeWorkflow(jurisdiction:Jurisdiction,steps:StepTemplate[],reviewRequired=false):FormationState {
 return {jurisdiction,status:reviewRequired?'REVIEW_REQUIRED':'AWAITING_PAYMENT',paid:false,steps:steps.map(s=>({...s,status:'pending'})),revision:0,registered:false,signals:{identityVerified:false,partnerVerified:false,riskApproved:!reviewRequired,signaturesComplete:false},events:[]};
}
export function advanceWorkflow(state:FormationState,input:StepInput,actor:{id:string;role:Role},context:{sandbox:boolean;questionnaire:Questionnaire;now?:Date}):FormationState {
 if(['CANCELLED','REJECTED','ACTIVE_COMPLIANCE'].includes(state.status)) throw new DomainError('TERMINAL_CASE','El caso no admite más transiciones',409);
 const next=structuredClone(state);const step=next.steps.find(s=>s.code===input.stepCode);
 if(!step) throw new DomainError('STEP_NOT_FOUND','Paso desconocido',404);
 if(step.status==='completed') throw new DomainError('ALREADY_COMPLETED','El paso ya se completó',409);
 const first=next.steps.find(s=>s.status!=='completed');
 if(first?.code!==step.code || step.prerequisites.some(p=>!next.steps.some(s=>s.code===p && s.status==='completed'))) throw new DomainError('PREREQUISITE','Completa los pasos anteriores',409);
 if(!next.signals.riskApproved) throw new DomainError('RISK_REVIEW','Se necesita revisión de riesgo',409);
 if(!next.paid) throw new DomainError('PAYMENT_REQUIRED','Completa el pago de plataforma primero',409);
 const internal=['ops','compliance','admin','superadmin'].includes(actor.role);
 if(step.actor!=='YOU' && !internal) throw new DomainError('ACTOR_DENIED','Este paso corresponde al equipo o a un tercero',403);
 if(input.mock && (!context.sandbox || !internal)) throw new DomainError('MOCK_DENIED','La simulación solo está habilitada para operaciones sandbox',403);
 const simulation=context.sandbox && input.mock===true;
 if(!input.confirmed) throw new DomainError('CONFIRMATION_REQUIRED','Confirma la acción realizada');
 if(['PARTNER','GOVERNMENT'].includes(step.actor) && !input.reference?.trim()) throw new DomainError('EVIDENCE_REQUIRED','Se requiere referencia de evidencia');
 if(step.actor==='GOVERNMENT' && !simulation) throw new DomainError('EXTERNAL_BLOCKED','Confirmación gubernamental requiere adaptador o evidencia verificada por un operador autorizado',409);
 if(step.actor==='PARTNER' && !simulation && !next.signals.partnerVerified) throw new DomainError('EXTERNAL_BLOCKED','Contrato y verificación del partner pendientes',409);
 if(step.gate==='identity' && !simulation && !next.signals.identityVerified) throw new DomainError('IDENTITY_REQUIRED','Falta evidencia de identidad verificada',409);
 if(step.gate==='eregistry' && !simulation && !context.questionnaire.eResident) throw new DomainError('ERESIDENCY_REQUIRED','Puedes completar onboarding; para esta ruta digital se requiere e-Residency o identidad digital compatible',409);
 if(step.gate==='filing' && !simulation && !next.signals.signaturesComplete) throw new DomainError('SIGNATURE_REQUIRED','Faltan firmas verificadas',409);
 if(step.gate==='filing' && !simulation && !next.signals.identityVerified)throw new DomainError('IDENTITY_REQUIRED','La presentación requiere identidad verificada',409);
 if(step.gate==='tax' && !internal && context.questionnaire.foreignOwnedDisregarded) throw new DomainError('TAX_REVIEW','Se requiere revisión profesional de obligaciones fiscales',409);
 const at=(context.now??new Date()).toISOString();
 step.status='completed';step.completedAt=at;step.reference=simulation?`MOCK:${input.reference||step.code}`:input.reference;
 if(simulation && step.gate==='identity')next.signals.identityVerified=true;
 if(step.gate==='signatures')next.signals.signaturesComplete=true;
 if(step.gate==='confirmation'){next.registered=true;next.status='REGISTERED';}
 else if(next.steps.every(s=>s.status==='completed'))next.status='ACTIVE_COMPLIANCE';
 else if(step.gate==='filing')next.status='SUBMITTED';
 else next.status=next.registered?'POST_FORMATION':'ONBOARDING';
 next.revision++;next.events.push({type:simulation?'SANDBOX_STEP_COMPLETED':'STEP_COMPLETED',actor:actor.id,at,step:step.code});
 return next;
}
export function makeSteps(prefix:string,definitions:readonly (readonly [string,string,ExecutionActor,StepTemplate['gate']?])[]):StepTemplate[] {
 return definitions.map(([suffix,title,actor,gate],index)=>({code:`${prefix}_${suffix}`,title,actor,gate,automation:actor==='YOU'?'E_CUSTOMER_ACTION':actor==='WE_PREPARE'?'B_AUTOMATABLE_WITH_REVIEW':actor==='PARTNER'?'D_LICENSED_PARTNER':'F_GOVERNMENT_OR_BANK',prerequisites:index?[`${prefix}_${definitions[index-1][0]}`]:[]}));
}

export function analyzeWorkflow(steps:StepTemplate[]):WorkflowCoverage {
 const byActor:WorkflowCoverage['byActor']={YOU:0,WE_PREPARE:0,PARTNER:0,GOVERNMENT:0};
 const byAutomation=Object.fromEntries((['A_FULLY_AUTOMATABLE','B_AUTOMATABLE_WITH_REVIEW','C_EXTERNAL_API','D_LICENSED_PARTNER','E_CUSTOMER_ACTION','F_GOVERNMENT_OR_BANK'] as const).map(level=>[level,0])) as WorkflowCoverage['byAutomation'];
 const seen=new Set<string>();
 for(const step of steps){
  if(seen.has(step.code))throw new DomainError('INVALID_WORKFLOW','Los códigos de paso deben ser únicos');
  if(step.prerequisites.some(code=>!seen.has(code)))throw new DomainError('INVALID_WORKFLOW','Cada prerrequisito debe apuntar a un paso anterior');
  const expected=step.actor==='YOU'?'E_CUSTOMER_ACTION':step.actor==='WE_PREPARE'?'B_AUTOMATABLE_WITH_REVIEW':step.actor==='PARTNER'?'D_LICENSED_PARTNER':'F_GOVERNMENT_OR_BANK';
  if(step.automation!==expected)throw new DomainError('INVALID_WORKFLOW','El nivel de automatización no coincide con el responsable');
  seen.add(step.code);byActor[step.actor]++;byAutomation[step.automation]++;
 }
 const externalSteps=byActor.PARTNER+byActor.GOVERNMENT;
 return {totalSteps:steps.length,byActor,byAutomation,externalSteps,requiresLicensedPartner:byActor.PARTNER>0,requiresGovernment:byActor.GOVERNMENT>0,canFinishWithoutExternalAuthority:externalSteps===0};
}
