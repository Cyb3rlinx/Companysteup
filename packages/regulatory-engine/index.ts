import { createHash } from 'node:crypto';
import { DomainError, assertCompliance, type Jurisdiction, type Role } from '../domain';
import manifest from '../../regulatory/source-manifests/official_sources.json';
export type Source = {
 id:string; code:string; jurisdiction:Jurisdiction; authority:string; title:string; url:string; tier:string;
 critical:boolean; refreshHours:number; lastCheckedAt:string|null; lastSuccessAt:string|null;
 hash:string|null; status:'unverified'|'verified'|'needs_review'|'error';
};
export type Evidence = {sourceId:string; snapshotId:string; snapshotHash:string; locator:string; summary:string; primary:boolean};
export type Rule = {
 id:string; code:string; version:number; jurisdiction:Jurisdiction; topic:string; title:string;
 status:'DRAFT'|'PENDING_REVIEW'|'ACTIVE'|'NEEDS_REVIEW'|'SUPERSEDED'|'ARCHIVED';
 severity:'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; effectiveFrom:string; effectiveTo:string|null;
 verifiedAt:string|null; verifiedBy:string|null; confidence:'LOW'|'MEDIUM'|'HIGH';
 outcome:Record<string,unknown>; condition:Record<string,unknown>; explanation:string;
 requiresHumanReview:boolean; evidence:Evidence[];
};
export type SourceChange = {id:string; sourceId:string; previousHash:string|null; newHash:string; status:'detected'|'reviewing'|'approved'|'dismissed'; createdAt:string};
export type Registry = {sources:Source[]; rules:Rule[]; changes:SourceChange[]; sandbox:boolean};
export type Fact = {rule_code:string; rule_version_id:string; authority:string; source_title:string; canonical_url:string; last_checked_at:string; last_verified_at:string; effective_from:string; confidence:string};
export const OFFICIAL_SOURCES = manifest;
export function normalizeSource(raw:string):string {
 return raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
 .replace(/<!--[\s\S]*?-->/g,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').normalize('NFKC').trim();
}
export function hashText(raw:string) { return createHash('sha256').update(raw).digest('hex'); }
export function isFresh(s:Source,at=new Date()):boolean {
 if(!s.lastSuccessAt || s.status!=='verified') return false;
 const age=at.getTime()-Date.parse(s.lastSuccessAt);
 return Number.isFinite(age) && age>=0 && age<Math.min(s.refreshHours,s.critical?24:720)*3600000;
}
export function ruleBlockers(rule:Rule,registry:Registry,at=new Date()):string[] {
 const reasons:string[]=[];
 if(rule.status!=='ACTIVE') reasons.push('Regla sin aprobación vigente');
 const day=at.toISOString().slice(0,10);
 if(rule.effectiveFrom>day || (rule.effectiveTo && rule.effectiveTo<=day)) reasons.push('Fuera del período efectivo');
 if(!rule.verifiedAt || !rule.verifiedBy || !Number.isFinite(Date.parse(rule.verifiedAt)) || Date.parse(rule.verifiedAt)>at.getTime()) reasons.push('Falta verificación de cumplimiento');
 if(!rule.evidence.some(e=>e.primary)) reasons.push('Falta evidencia primaria');
 for(const e of rule.evidence) {
  const s=registry.sources.find(s=>s.id===e.sourceId);
  if(!s || !s.tier.startsWith('T0_') || !e.snapshotId || !e.locator || !e.summary) { reasons.push('Evidencia oficial insuficiente'); continue; }
  if(!isFresh(s,at)) reasons.push('Fuente desactualizada o no verificada');
  if(rule.severity==='CRITICAL'&&(!s.lastSuccessAt||at.getTime()-Date.parse(s.lastSuccessAt)>=86400000))reasons.push('La regla crítica requiere evidencia consultada en menos de 24 horas');
  if(s.hash!==e.snapshotHash) reasons.push('La evidencia no coincide con la fuente actual');
  if(registry.changes.some(c=>c.sourceId===s.id && !['approved','dismissed'].includes(c.status))) reasons.push('Fuente modificada pendiente de revisión');
 }
 return [...new Set(reasons)];
}
export function evaluateCondition(condition:Record<string,unknown>,context:Record<string,unknown>={}):boolean {
 if(Object.keys(condition).length===0)return true;
 if(Array.isArray(condition.all))return condition.all.every(c=>!!c&&typeof c==='object'&&evaluateCondition(c as Record<string,unknown>,context));
 if(Array.isArray(condition.any))return condition.any.some(c=>!!c&&typeof c==='object'&&evaluateCondition(c as Record<string,unknown>,context));
 if(typeof condition.field!=='string'||!Object.hasOwn(context,condition.field))return false;
 const actual=context[condition.field];
 if(condition.op==='eq')return actual===condition.value;
 if(condition.op==='in')return Array.isArray(condition.value)&&condition.value.includes(actual);
 if(condition.op==='gte')return typeof actual==='number'&&typeof condition.value==='number'&&actual>=condition.value;
 return false;
}
export function selectRule(registry:Registry,code:string,at=new Date(),context:Record<string,unknown>={}):Rule|null {
 const eligible=registry.rules.filter(r=>r.code===code && evaluateCondition(r.condition,context) && ruleBlockers(r,registry,at).length===0);
 // Ambiguous overlapping versions are unsafe even if imported externally.
 return eligible.length===1?eligible[0]:null;
}
export function factsFor(rule:Rule,registry:Registry):Fact[] {
 return rule.evidence.map(e=> { const s=registry.sources.find(s=>s.id===e.sourceId)!; return {
  rule_code:rule.code,rule_version_id:rule.id,authority:s.authority,source_title:s.title,canonical_url:s.url,
  last_checked_at:s.lastCheckedAt!,last_verified_at:rule.verifiedAt!,effective_from:rule.effectiveFrom,confidence:rule.confidence,
 }; });
}
export function ingestSource(registry:Registry,sourceId:string,raw:string,at=new Date()) {
 const next=structuredClone(registry); const source=next.sources.find(s=>s.id===sourceId);
 if(!source) throw new DomainError('SOURCE_NOT_FOUND','Fuente desconocida',404);
 const normalized=normalizeSource(raw); if(normalized.length<50) throw new DomainError('SOURCE_INVALID','Respuesta oficial vacía o inválida');
 const hash=hashText(normalized); const changed=!!source.hash && source.hash!==hash;
 source.lastCheckedAt=at.toISOString(); source.lastSuccessAt=at.toISOString();
 if(changed) {
  next.changes.push({id:crypto.randomUUID(),sourceId,previousHash:source.hash,newHash:hash,status:'detected',createdAt:at.toISOString()});
  source.status='needs_review';
  next.rules.filter(r=>r.status==='ACTIVE' && r.evidence.some(e=>e.sourceId===sourceId)).forEach(r=>r.status='NEEDS_REVIEW');
 }
 // Initial fetch is not human verification; unchanged fetch cannot clear a review state.
 source.hash=hash;
 return {registry:next,changed,hash,normalized};
}
export function publishRule(registry:Registry,draftId:string,actor:{id:string;role:Role},at=new Date()):Registry {
 assertCompliance(actor.role);
 const next=structuredClone(registry); const draft=next.rules.find(r=>r.id===draftId);
 if(!draft || !['DRAFT','PENDING_REVIEW'].includes(draft.status)) throw new DomainError('INVALID_VERSION','Se requiere una nueva versión pendiente');
 draft.status='ACTIVE';draft.verifiedAt=at.toISOString();draft.verifiedBy=actor.id;draft.confidence='HIGH';
 const blockers=ruleBlockers(draft,next,at); if(blockers.length) throw new DomainError('REGULATORY_BLOCKED',blockers.join('. '),409);
 for(const r of next.rules.filter(r=>r.id!==draft.id && r.code===draft.code && ['ACTIVE','NEEDS_REVIEW'].includes(r.status))) {
  if(r.effectiveFrom>=draft.effectiveFrom) throw new DomainError('INVALID_EFFECTIVE_DATE','La nueva vigencia debe ser posterior');
  r.status='SUPERSEDED'; r.effectiveTo=draft.effectiveFrom;
 }
 return next;
}
export function validateOfficialUrl(value:string):URL {
 const url=new URL(value);
 if(url.protocol!=='https:' || url.username || url.password || url.port || !manifest.some(s=>s.url===url.href)) throw new DomainError('SOURCE_URL_DENIED','Solo se admiten URLs exactas del catálogo oficial');
 return url;
}
export async function fetchOfficialSource(url:string,fetcher:typeof fetch=fetch):Promise<{body:string;status:number;etag:string|null;lastModified:string|null}> {
 const allowed=validateOfficialUrl(url);
 const response=await fetcher(allowed,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'User-Agent':process.env.SOURCE_MONITOR_USER_AGENT||'CompanySetupComplianceBot/0.1',Accept:'text/html,text/plain,application/pdf'}});
 if(!response.ok) throw new DomainError('SOURCE_FETCH_FAILED',`Fuente respondió HTTP ${response.status}`,502);
 if(response.status!==200) throw new DomainError('SOURCE_FETCH_FAILED','Se requiere contenido completo',502);
 if(Number(response.headers.get('content-length'))>5242880) throw new DomainError('SOURCE_TOO_LARGE','Fuente excede 5 MB');
 if(response.headers.get('content-type')?.includes('application/pdf')) throw new DomainError('PDF_REVIEW_REQUIRED','PDF requiere extracción verificada; se mantiene bloqueado');
 const reader=response.body?.getReader(); if(!reader) throw new DomainError('SOURCE_EMPTY','Fuente sin contenido');
 let size=0;const chunks:Uint8Array[]=[];
 for(;;) { const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>5242880){await reader.cancel();throw new DomainError('SOURCE_TOO_LARGE','Fuente excede 5 MB');} chunks.push(value); }
 const body=Buffer.concat(chunks).toString('utf8');
 if(/captcha|access denied|verify you are human|just a moment/i.test(body.slice(0,5000))) throw new DomainError('SOURCE_CHALLENGE','Fuente respondió un bloqueo o desafío');
 return {body,status:response.status,etag:response.headers.get('etag'),lastModified:response.headers.get('last-modified')};
}
