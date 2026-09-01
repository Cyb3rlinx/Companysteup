import manifest from '../../regulatory/source-manifests/official_sources.json';
import candidates from '../../regulatory/normalized/rule-candidates.json';
import { hashText, type Registry, type Rule, type Source } from './index';
import type { Jurisdiction } from '../domain';
// Synthetic approval fixtures only. Never imported by production repository initialization.
export const FIXTURE_TIME = '2026-08-31T00:00:00.000Z';
export function sandboxRegistry(at=FIXTURE_TIME):Registry {
 const sources:Source[]=manifest.map(s=>({id:s.source_code,code:s.source_code,jurisdiction:s.jurisdiction as Jurisdiction,authority:s.authority,title:s.title,url:s.url,tier:s.tier,critical:s.critical,refreshHours:s.refresh_hours,lastCheckedAt:at,lastSuccessAt:at,hash:hashText(`SANDBOX FIXTURE ${s.source_code}`),status:'verified'}));
 const rules:Rule[]=candidates.map(c=>({id:`${c.code}:1`,code:c.code,version:1,jurisdiction:c.jurisdiction as Jurisdiction,topic:c.topic,title:c.title,status:'ACTIVE',severity:'CRITICAL',effectiveFrom:c.effectiveFrom||'2026-08-31',effectiveTo:null,verifiedAt:at,verifiedBy:'SANDBOX_REVIEWER',confidence:'HIGH',outcome:c.outcome,condition:{},explanation:c.explanation,requiresHumanReview:c.review,evidence:[{sourceId:c.source,snapshotId:`sandbox:${c.source}`,snapshotHash:sources.find(s=>s.id===c.source)!.hash!,locator:c.locator,summary:c.explanation,primary:true}]}));
 return {sources,rules,changes:[],sandbox:true};
}
