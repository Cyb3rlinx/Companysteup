import {z} from 'zod';
import {assertCompliance,DomainError} from '../domain';
import {loadRegistry,owned,type Actor,type FormationRecord,type BusinessRecord} from './index';
import type {Repository,Operation,Row} from '../persistence';
import {generateObligations} from '../compliance-engine';
export const complianceInput=z.object({companyId:z.uuid(),periodStart:z.iso.date(),periodEnd:z.iso.date(),lastConfirmationDate:z.iso.date().optional(),taxPeriodEnd:z.iso.date().optional(),reason:z.string().trim().min(30).max(2000)});
export async function regenerateCompliance(repo:Repository,actor:Actor,input:unknown,sandbox:boolean){
 assertCompliance(actor.role);const data=complianceInput.parse(input);const company=owned((await repo.list('companies',{id:data.companyId}))[0] as Row&{organization_id:string},actor);const incorporation=String(company.incorporation_date).slice(0,10);
 if(data.periodStart<incorporation||data.periodEnd<data.periodStart||Date.parse(data.periodEnd)-Date.parse(data.periodStart)>730*86400000)throw new DomainError('PERIOD_INVALID','Confirma un período válido posterior a la constitución');
 const c=(await repo.list<FormationRecord>('formation_cases',{id:company.formation_case_id}))[0];const business=(await repo.list<BusinessRecord>('business_profiles',{id:c.business_profile_id}))[0];
 const obligations=generateObligations({id:String(company.id),jurisdiction:c.jurisdiction_code,incorporationDate:incorporation,periodStart:data.periodStart,financialYearEnd:data.periodEnd,wyomingAssetsMinor:business.questionnaire.wyomingAssetsMinor,foreignOwnedDisregarded:business.questionnaire.foreignOwnedDisregarded,lastConfirmationDate:data.lastConfirmationDate,taxPeriodEnd:data.taxPeriodEnd},await loadRegistry(repo,sandbox));
 const prior=await repo.list('company_obligations',{company_id:company.id});const operations:Operation[]=[];
 for(const obligation of obligations){const existing=prior.find(o=>o.obligation_code===obligation.code&&String(o.period_start).slice(0,10)===data.periodStart);if(existing?.status==='completed')continue;
 const id=existing?.id??crypto.randomUUID();const row={organization_id:company.organization_id,company_id:company.id,obligation_code:obligation.code,title:obligation.title,period_start:data.periodStart,period_end:data.periodEnd,due_at:obligation.dueDate?`${obligation.dueDate}T12:00:00Z`:null,status:obligation.status,amount_minor:obligation.amountMinor,currency:obligation.currency,source_rule_version_id:obligation.ruleVersionId,notes:obligation.notes,evidence_json:obligation.evidence};
 operations.push(existing?{kind:'update',table:'company_obligations',where:{id},data:row}:{kind:'insert',table:'company_obligations',data:{id,...row}});
 operations.push({kind:'insert',table:'obligation_events',data:{organization_id:company.organization_id,company_obligation_id:id,event_type:existing?'RECALCULATED':'GENERATED',actor_type:actor.role,payload:{reason:data.reason,actorId:actor.id,previous:existing??null,ruleVersionId:obligation.ruleVersionId}}});
 }
 if(operations.length)await repo.atomic(operations);return{processed:operations.length/2};
}
