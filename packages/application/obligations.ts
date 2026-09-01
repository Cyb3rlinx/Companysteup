import type {Row} from '../persistence';
import {ruleBlockers,type Registry,type Fact} from '../regulatory-engine';
// Historical rows remain immutable evidence; this projection prevents stale values becoming current advice.
export function verifiedObligations(rows:Row[],registry:Registry,at=new Date()):Row[]{return rows.map(row=>{
 const ids=new Set([row.source_rule_version_id,...((row.evidence_json??[]) as Fact[]).map(e=>e.rule_version_id)]);
 const usable=[...ids].every(id=>{const rule=registry.rules.find(r=>r.id===id);return !!rule&&ruleBlockers(rule,registry,at).length===0;});
 if(usable&&row.status!=='review_required')return row;
 return {...row,status:row.status==='completed'?'completed':'review_required',due_at:null,amount_minor:null,notes:`Información histórica en revisión; no usar importes o fechas como instrucciones actuales. ${row.notes??''}`};
});}
