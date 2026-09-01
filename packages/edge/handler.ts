import {timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {Application,loadRegistry,owned,type Actor,type BusinessRecord} from '../application';
import {regenerateCompliance} from '../application/compliance';
import {DomainError,JURISDICTIONS,assertCompliance} from '../domain';
import {supabaseRepository,SupabaseRepository,type Repository} from '../persistence';
import {recommend} from '../jurisdiction-engine';
import {answerRegulatoryQuestion} from '../ai';
import {answerWithOpenAI} from '../ai/openai';
import {monitorSource,type SnapshotStorage} from '../regulatory-engine/service';
import {hashText} from '../regulatory-engine';
import {StripeTestCheckout,SandboxCheckout,verifyStripeEvent} from '../billing';
import {applySubscriptionEvent} from '../billing/subscriptions';
export const FUNCTION_NAMES=['jurisdiction-recommend','case-create','case-advance','compliance-generate','regulatory-answer','source-monitor','source-ingest','checkout-create','stripe-webhook','notify'] as const;
type Environment=Record<string,string|undefined>;
type Dependencies={env:Environment;repo?:Repository;authenticate?:(token:string)=>Promise<Actor>;storage?:SnapshotStorage};
async function bodyText(request:Request,max=262144){const reader=request.body?.getReader();if(!reader)return '';const chunks:Uint8Array[]=[];let size=0;for(;;){const{done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new DomainError('BODY_TOO_LARGE','Solicitud demasiado grande',413);}chunks.push(value);}return Buffer.concat(chunks).toString('utf8');}
function equalSecret(a:string,b:string){const x=Buffer.from(a);const y=Buffer.from(b);return x.length>=32&&x.length===y.length&&timingSafeEqual(x,y);}
export function createEdgeHandler(dependencies:Dependencies){return async(request:Request,name:string):Promise<Response>=>{
 const env=dependencies.env;const origin=request.headers.get('origin');const headers:Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
 const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
 try{
  if(!FUNCTION_NAMES.includes(name as typeof FUNCTION_NAMES[number]))throw new DomainError('NOT_FOUND','Función no encontrada',404);
  if(origin&&origin!==env.APP_ORIGIN)throw new DomainError('ORIGIN_DENIED','Origen no autorizado',403);
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}});
  if(request.method!=='POST')throw new DomainError('METHOD_DENIED','Usa POST',405);
  if(!dependencies.repo&&(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY))throw new DomainError('EXTERNAL_BLOCKED','Configura Supabase',503);
  const repo=dependencies.repo??supabaseRepository(env.SUPABASE_URL!,env.SUPABASE_SERVICE_ROLE_KEY!);const sandbox=env.APP_MODE==='sandbox';const app=new Application(repo,sandbox);
  const raw=await bodyText(request,name==='stripe-webhook'?262144:65536);
  if(name==='stripe-webhook'){
   if(!env.STRIPE_SECRET_KEY||!env.STRIPE_WEBHOOK_SECRET)throw new DomainError('WEBHOOK_INVALID','Webhook no configurado',400);
   let event;try{event=verifyStripeEvent(raw,request.headers.get('stripe-signature')??'',env.STRIPE_SECRET_KEY,env.STRIPE_WEBHOOK_SECRET);}catch{throw new DomainError('WEBHOOK_INVALID','Firma o evento inválido',400);}
   if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded'){const s=event.data.object;if(s.mode==='payment'&&s.payment_status==='paid'&&s.metadata?.order_id)await app.settleOrder(s.metadata.order_id,{mock:false,eventId:event.id,eventHash:hashText(raw),sessionId:s.id,amount:s.amount_total??undefined,currency:s.currency??undefined});}
   await applySubscriptionEvent(repo,event,hashText(raw),env.STRIPE_COMPLIANCE_PRICE_ID??'');return json({received:true});
  }
  const body=raw?JSON.parse(raw):{};
  let actor:Actor;const worker=request.headers.get('x-automation-secret');
  if(worker&&['source-monitor','notify'].includes(name)){
   if(!env.SOURCE_MONITOR_SECRET||!equalSecret(worker,env.SOURCE_MONITOR_SECRET)||!env.AUTOMATION_USER_ID)throw new DomainError('UNAUTHORIZED','Credencial de automatización inválida',401);
   const profile=(await repo.list('profiles',{id:env.AUTOMATION_USER_ID}))[0];const membership=(await repo.list('organization_members',{user_id:env.AUTOMATION_USER_ID,status:'active'}))[0];if(!profile||!membership)throw new DomainError('UNAUTHORIZED','Actor de automatización no configurado',401);
   actor={id:String(profile.id),organizationId:String(membership.organization_id),role:profile.app_role as Actor['role'],displayName:'Automatización'};assertCompliance(actor.role);
  }else{
   const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];if(!token)throw new DomainError('UNAUTHORIZED','Inicia sesión',401);
   if(dependencies.authenticate)actor=await dependencies.authenticate(token);else{
    const client=(repo as SupabaseRepository).client;const{data,error}=await client.auth.getUser(token);if(error||!data.user)throw new DomainError('UNAUTHORIZED','Sesión inválida',401);
    const profile=(await repo.list('profiles',{id:data.user.id}))[0];const membership=(await repo.list('organization_members',{user_id:data.user.id,status:'active'}))[0];if(!profile||!membership)throw new DomainError('FORBIDDEN','Organización no disponible',403);
    actor={id:data.user.id,organizationId:String(membership.organization_id),role:profile.app_role as Actor['role'],displayName:String(profile.display_name)};
   }
  }
  if(!await repo.rateLimit(`edge:${actor.id}`,120,60))throw new DomainError('RATE_LIMIT','Espera un minuto',429);
  if(name==='jurisdiction-recommend'){const{businessId}=z.object({businessId:z.uuid()}).parse(body);const business=owned((await repo.list<BusinessRecord>('business_profiles',{id:businessId}))[0],actor);return json(recommend(business.questionnaire,await loadRegistry(repo,sandbox)));}
  if(name==='case-create'){const data=z.object({businessId:z.uuid(),jurisdiction:z.enum(JURISDICTIONS)}).parse(body);return json(await app.createCase(actor,data.businessId,data.jurisdiction));}
  if(name==='case-advance'){const data=z.object({caseId:z.uuid(),stepCode:z.string().min(1).max(20),reference:z.string().max(300).optional(),confirmed:z.boolean(),mock:z.boolean().optional()}).parse(body);return json(await app.advance(actor,data.caseId,data));}
  if(name==='compliance-generate')return json(await regenerateCompliance(repo,actor,body,sandbox));
  if(name==='checkout-create'){const{caseId}=z.object({caseId:z.uuid()}).parse(body);const order=await app.prepareOrder(actor,caseId);const adapter=env.STRIPE_SECRET_KEY?new StripeTestCheckout(env.STRIPE_SECRET_KEY):sandbox?new SandboxCheckout():null;if(!adapter||!env.APP_ORIGIN)throw new DomainError('EXTERNAL_BLOCKED','Configura Stripe test y APP_ORIGIN',503);const session=await adapter.create({orderId:String(order.id),organizationId:String(order.organization_id),caseId,amountMinor:Number(order.total_minor),currency:String(order.currency),origin:env.APP_ORIGIN,idempotencyKey:String(order.idempotency_key)});await repo.atomic([{kind:'update',table:'orders',where:{id:order.id},data:{stripe_checkout_session_id:session.sessionId}}]);return json({...session,mode:adapter.mode});}
  if(name==='regulatory-answer'){const data=z.object({question:z.string().trim().min(4).max(2000),jurisdiction:z.enum(JURISDICTIONS)}).parse(body);const registry=await loadRegistry(repo,sandbox);let answer=answerRegulatoryQuestion(data.question,data,registry);let modelStatus='deterministic';if(env.OPENAI_API_KEY&&env.OPENAI_MODEL){try{answer=await answerWithOpenAI(data.question,data.jurisdiction,registry,{key:env.OPENAI_API_KEY,model:env.OPENAI_MODEL});modelStatus='verified_tool';}catch{modelStatus='deterministic_fallback';}}if(answer.requires_human_review)await repo.atomic([{kind:'insert',table:'case_escalations',data:{organization_id:actor.organizationId,escalation_type:'regulatory_answer',severity:'HIGH',reason:'Respuesta sujeta a revisión humana'}}]);return json({...answer,model_status:modelStatus});}
  if(name==='notify')return json(await app.notifications(actor));
  if(name==='source-monitor'||name==='source-ingest'){
   assertCompliance(actor.role);const{sourceId}=z.object({sourceId:z.uuid().optional()}).parse(body);if(!sourceId&&name==='source-ingest')throw new DomainError('SOURCE_REQUIRED','Selecciona una fuente');
   const bucket=dependencies.storage?null:(repo as SupabaseRepository).client.storage.from('regulatory-snapshots');const storage=dependencies.storage??{async put(key:string,content:string){const{error}=await bucket!.upload(key,content,{contentType:'application/json',upsert:false});if(error)throw new Error('Snapshot storage failed');},async get(key:string){const{data,error}=await bucket!.download(key);if(error)throw new Error('Snapshot missing');return data.text();}};
   const sources=sourceId?[{id:sourceId}]:(await repo.list('regulatory_sources',{active:true})).filter(s=>!s.last_checked_at||Date.now()-Date.parse(String(s.last_checked_at))>=Number(s.refresh_cadence_hours)*3600000).sort((a,b)=>String(a.last_checked_at??'').localeCompare(String(b.last_checked_at??''))).slice(0,3);
   const results=[];for(const source of sources){try{const{normalized,...result}=await monitorSource(repo,actor,String(source.id),storage);void normalized;results.push({sourceId:source.id,...result});}catch(error){results.push({sourceId:source.id,status:'blocked',code:error instanceof DomainError?error.code:'CAPTURE_FAILED'});}}return json({results});
  }
  throw new DomainError('NOT_FOUND','Función no encontrada',404);
 }catch(error){if(error instanceof DomainError)return json({error:error.message,code:error.code},error.status);if(error instanceof z.ZodError||error instanceof SyntaxError)return json({error:'Solicitud inválida',code:'VALIDATION'},400);return json({error:'No se pudo completar la operación',code:'INTERNAL_ERROR'},500);}
};}
