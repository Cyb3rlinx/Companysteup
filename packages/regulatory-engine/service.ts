import { type Repository,type Operation } from '../persistence';
import { assertCompliance,DomainError } from '../domain';
import { type Actor,loadRegistry } from '../application';
import { fetchOfficialSource,normalizeSource,hashText,ruleBlockers } from './index';
import {validateOutcome} from './outcomes';
import {z} from 'zod';
export interface SnapshotStorage {put(path:string,content:string):Promise<void>;get(path:string):Promise<string>}
export async function monitorSource(repo:Repository,actor:Actor,sourceId:string,storage:SnapshotStorage) {
 assertCompliance(actor.role);const source=(await repo.list('regulatory_sources',{id:sourceId}))[0];if(!source)throw new DomainError('NOT_FOUND','Fuente no encontrada',404);
 const now=new Date().toISOString();const runId=crypto.randomUUID();await repo.atomic([{kind:'insert',table:'source_monitor_runs',data:{id:runId,status:'running',sources_attempted:1}}]);
 try{
  const fetched=await fetchOfficialSource(String(source.canonical_url));const normalized=normalizeSource(fetched.body);if(normalized.length<50)throw new Error('Fuente vacía');const hash=hashText(normalized);const snapshotId=crypto.randomUUID();const changed=!!source.last_content_hash&&source.last_content_hash!==hash;
  const storagePath=`${sourceId}/${snapshotId}.json`;
  await storage.put(storagePath,JSON.stringify({url:source.canonical_url,capturedAt:now,raw:fetched.body,normalized,contentHash:hashText(fetched.body),normalizedHash:hash}));
  const operations:Operation[]=[{kind:'insert',table:'source_snapshots',data:{id:snapshotId,source_id:sourceId,storage_path:storagePath,http_status:200,etag:fetched.etag,last_modified_header:fetched.lastModified,content_hash:hashText(fetched.body),normalized_text_hash:hash,fetch_status:'success',extraction_metadata:{method:'html_normalize_v1',untrusted:true,characters:normalized.length}}},{kind:'update',table:'regulatory_sources',where:{id:sourceId},data:{last_checked_at:now,last_success_at:now,last_content_hash:hash,status:changed?'needs_review':source.status}},{kind:'update',table:'source_monitor_runs',where:{id:runId},data:{status:'completed',finished_at:now,sources_changed:changed?1:0}}];
  if(changed){const previous=(await repo.list('source_snapshots',{source_id:sourceId})).sort((a,b)=>String(b.fetched_at).localeCompare(String(a.fetched_at)))[0];operations.push({kind:'insert',table:'source_change_events',data:{source_id:sourceId,previous_snapshot_id:previous?.id??null,new_snapshot_id:snapshotId,change_type:'normalized_content',severity:source.critical?'CRITICAL':'MEDIUM',changed_sections:{previous_hash:source.last_content_hash,new_hash:hash},ai_summary:null,status:'detected'}});}
  await repo.atomic(operations);return{changed,snapshotId,status:'captured_requires_review',normalized};
 }catch(error){await repo.atomic([{kind:'update',table:'regulatory_sources',where:{id:sourceId},data:{last_checked_at:now,status:'error'}},{kind:'update',table:'source_monitor_runs',where:{id:runId},data:{status:'failed',finished_at:new Date().toISOString(),errors:[{sourceId,error:error instanceof Error?error.message:'fetch failed'}]}}]);throw error;}
}
export async function reviewSource(repo:Repository,actor:Actor,sourceId:string,reason:string){
 assertCompliance(actor.role);if(reason.trim().length<30)throw new DomainError('REVIEW_REQUIRED','Describe la evidencia y el análisis (mínimo 30 caracteres)');
 const source=(await repo.list('regulatory_sources',{id:sourceId}))[0];if(!source?.last_success_at||Date.now()-Date.parse(String(source.last_success_at))>=Number(source.refresh_cadence_hours)*3600000)throw new DomainError('STALE_SOURCE','Vuelve a obtener la fuente antes de aprobar',409);
 const changes=await repo.list('source_change_events',{source_id:sourceId});const ops:Operation[]=[{kind:'update',table:'regulatory_sources',data:{status:'verified',notes:reason},where:{id:sourceId}},{kind:'insert',table:'audit_logs',data:{actor_user_id:actor.id,action:'SOURCE_REVIEWED',resource_type:'regulatory_sources',resource_id:sourceId,metadata:{reason}}}];
 for(const change of changes.filter(c=>!['approved','dismissed'].includes(String(c.status))))ops.push({kind:'update',table:'source_change_events',where:{id:change.id},data:{status:'approved',reviewer_id:actor.id,resolved_at:new Date().toISOString()}});
 await repo.atomic(ops);return{reviewed:true};
}
export const draftSchema=z.object({versionId:z.uuid(),effectiveFrom:z.iso.date(),outcome:z.record(z.string(),z.unknown()),explanation:z.string().trim().min(30).max(5000),evidence:z.array(z.object({snapshotId:z.uuid(),locator:z.string().trim().min(5).max(500),summary:z.string().trim().min(30).max(3000)})).min(1).max(10)});
export async function createRuleDraft(repo:Repository,actor:Actor,input:unknown){
 assertCompliance(actor.role);const data=draftSchema.parse(input);const parent=(await repo.list('regulatory_rule_versions',{id:data.versionId}))[0];if(!parent)throw new DomainError('NOT_FOUND','Versión no encontrada',404);
 const rule=(await repo.list('regulatory_rules',{id:parent.rule_id}))[0];const outcome=validateOutcome(String(rule.rule_code),data.outcome);const versions=await repo.list('regulatory_rule_versions',{rule_id:parent.rule_id});const id=crypto.randomUUID();
 const operations:Operation[]=[{kind:'insert',table:'regulatory_rule_versions',data:{id,rule_id:parent.rule_id,version:Math.max(...versions.map(v=>Number(v.version)))+1,status:'PENDING_REVIEW',effective_from:data.effectiveFrom,outcome_json:outcome,condition_json:parent.condition_json,explanation_template:data.explanation}}];
 for(const item of data.evidence){const snapshot=(await repo.list('source_snapshots',{id:item.snapshotId}))[0];if(!snapshot||snapshot.fetch_status!=='success'||!snapshot.normalized_text_hash)throw new DomainError('EVIDENCE_REQUIRED','Selecciona un snapshot obtenido correctamente',409);operations.push({kind:'insert',table:'rule_source_evidence',data:{rule_version_id:id,source_id:snapshot.source_id,snapshot_id:snapshot.id,source_locator:item.locator,evidence_summary:item.summary,is_primary:true}});}
 operations.push({kind:'insert',table:'audit_logs',data:{actor_user_id:actor.id,action:'RULE_DRAFT_CREATED',resource_type:'regulatory_rule_versions',resource_id:id,metadata:{parentVersion:data.versionId}}});await repo.atomic(operations);return{id};
}
export async function publishCandidate(repo:Repository,actor:Actor,versionId:string,reason:string,sandbox:boolean){
 assertCompliance(actor.role);if(reason.trim().length<30)throw new DomainError('REVIEW_REQUIRED','Documenta la justificación de la nueva versión');
 const registry=await loadRegistry(repo,sandbox);const existing=registry.rules.find(r=>r.id===versionId);if(!existing)throw new DomainError('NOT_FOUND','Versión no encontrada',404);
 const version=(await repo.list('regulatory_rule_versions',{id:versionId}))[0];const versions=await repo.list('regulatory_rule_versions',{rule_id:version.rule_id});const evidence=await repo.list('rule_source_evidence',{rule_version_id:versionId});
 if(!['DRAFT','PENDING_REVIEW'].includes(String(version.status)))throw new DomainError('NEW_VERSION_REQUIRED','Crea una nueva versión para preservar el historial',409);
 validateOutcome(existing.code,version.outcome_json);
 const today=String(version.effective_from).slice(0,10);const now=new Date().toISOString();const newId=versionId;
 if(!evidence.length)throw new DomainError('EVIDENCE_REQUIRED','Asocia evidencia a la versión antes de publicarla',409);
 const draft={...existing,status:'ACTIVE' as const,verifiedAt:now,verifiedBy:actor.id};
 const blockers=ruleBlockers(draft,registry);if(blockers.length)throw new DomainError('REGULATORY_BLOCKED',blockers.join('. '),409);
 const ops:Operation[]=[];
 for(const v of versions.filter(v=>['ACTIVE','NEEDS_REVIEW'].includes(String(v.status)))){if(String(v.effective_from).slice(0,10)>today)throw new DomainError('EFFECTIVE_DATE_CONFLICT','La sustitución no puede empezar antes de la versión existente',409);ops.push({kind:'update',table:'regulatory_rule_versions',where:{id:v.id},data:{status:'SUPERSEDED',effective_to:today}});}
 ops.push({kind:'update',table:'regulatory_rule_versions',where:{id:newId,status:version.status},data:{status:'ACTIVE',confidence:'HIGH',verified_at:now,verified_by:actor.id,published_at:now}},{kind:'insert',table:'audit_logs',data:{actor_user_id:actor.id,action:'RULE_PUBLISHED',resource_type:'regulatory_rule_versions',resource_id:newId,metadata:{reason}}});
 const affected=(await repo.list('company_obligations')).filter(o=>versions.some(v=>v.id===o.source_rule_version_id)&&o.status!=='completed');
 for(const o of affected)ops.push({kind:'update',table:'company_obligations',where:{id:o.id},data:{status:'review_required',notes:'Nueva versión normativa publicada: revisar y recalcular antes de actuar.'}},{kind:'insert',table:'regulatory_alerts',data:{organization_id:o.organization_id,company_id:o.company_id,rule_id:version.rule_id,severity:'HIGH',title:'Cambio normativo revisado',message:'Una obligación necesita recálculo con la nueva versión aprobada.'}});
 await repo.atomic(ops);return{id:newId,affected:affected.length};
}

