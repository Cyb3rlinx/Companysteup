/** Opt-in integration checks against synthetic staging. Never run in default CI.
 * Creates confirmed .test accounts without sending email; retains synthetic DB
 * fixtures for audit. Deletes only Storage objects created by this invocation.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {randomBytes,randomUUID} from 'node:crypto';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {request,chromium,expect,type APIRequestContext,type APIResponse} from '@playwright/test';
import {demoQuestionnaire,type Jurisdiction} from '../packages/domain';
import {PRODUCTS,type Recommendation} from '../packages/jurisdiction-engine';
import {signDocument} from '../packages/document-engine';

async function main(){
const origin='http://127.0.0.1:3100';
const target=JSON.parse(await readFile('supabase/environments/staging.json','utf8'));
const keys=JSON.parse(await readFile('.local/staging/credentials.json','utf8'));
if(!process.argv.includes('--synthetic-only')||target.environment!=='staging'||target.dataPolicy!=='synthetic-only'||
 target.projectRef!=='keboldglfjonxcdnmyee'||keys.projectRef!==target.projectRef||keys.url!==`https://${target.projectRef}.supabase.co`)
 throw new Error('Explicit synthetic staging target required');
const options={auth:{persistSession:false,autoRefreshToken:false}};
const admin=createClient(keys.url,keys.serviceRoleKey,options);
const anonymous=createClient(keys.url,keys.publishableKey,options);
const results:{name:string;passed:boolean;detail?:string}[]=[];
const sensitiveValues:string[]=[keys.serviceRoleKey,keys.publishableKey,keys.anonKey].filter(Boolean);
function safeError(error:unknown){let detail=error instanceof Error?error.message:'Check failed';for(const value of sensitiveValues)detail=detail.replaceAll(value,'[REDACTED]');return detail.slice(0,1500);}
const contexts:APIRequestContext[]=[];
const objects:{id:string;path:string}[]=[];
const runId=randomUUID();
function assert(condition:unknown,label:string):asserts condition{if(!condition)throw new Error(label);}
async function check(name:string,run:()=>Promise<void>){try{await run();results.push({name,passed:true});console.log(`PASS ${name}`);}catch(error){const detail=safeError(error);results.push({name,passed:false,detail});console.log(`FAIL ${name}: ${detail}`);}}
async function ok(response:APIResponse,label:string){const body=await response.json();assert(response.ok(),`${label}: HTTP ${response.status()}, code ${body.code??'unavailable'}`);return body;}
async function post(ctx:APIRequestContext,action:string,data:unknown={}){return ctx.post(`/api/${action}`,{headers:{Origin:origin},data});}
async function edge(name:string,token?:string,data:unknown={},extra:Record<string,string>={}){
 const response=await fetch(`${keys.url}/functions/v1/${name}`,{method:'POST',headers:{apikey:keys.publishableKey,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...extra},body:JSON.stringify(data),signal:AbortSignal.timeout(30000)});
 const body=await response.json();return{status:response.status,body};
}
type Identity={id:string;email:string;password:string};
type Tenant={identity:Identity;client:SupabaseClient;token:string;web:APIRequestContext;org:string;business:string;cases:Partial<Record<Jurisdiction,string>>};
const tenants:Tenant[]=[];
const anonWeb=await request.newContext({baseURL:origin});contexts.push(anonWeb);
try{
 await check('staging reachable; anonymous workspace denied',async()=>{assert((await anonWeb.get('/api/workspace')).status()===401,'Expected HTTP 401');});
 // Account passwords and JWTs are never printed, stored in reports, or sent to browsers as URLs.
 for(let index=0;index<2;index++){
  const identity={id:'',email:`staging-${runId}-${index}@example.test`,password:`Qa!${randomBytes(32).toString('base64url')}`};
  sensitiveValues.push(identity.password);
  const created=await admin.auth.admin.createUser({email:identity.email,password:identity.password,email_confirm:true,user_metadata:{display_name:`Synthetic QA ${index}`,app_role:'superadmin',role:'admin',qa_run:runId}});
  assert(!created.error&&created.data.user,'Synthetic account creation failed');identity.id=created.data.user.id;
  const client=createClient(keys.url,keys.publishableKey,options);const login=await client.auth.signInWithPassword(identity);
  assert(!login.error&&login.data.session,'Synthetic Auth login failed');
  sensitiveValues.push(login.data.session.access_token,login.data.session.refresh_token);
  const profile=await client.from('profiles').select('app_role').eq('id',identity.id).single();
  const membership=await client.from('organization_members').select('organization_id').eq('user_id',identity.id).single();
  assert(!profile.error&&profile.data.app_role==='customer'&&!membership.error,'User metadata elevated privilege or profile missing');
  const web=await request.newContext({baseURL:origin});contexts.push(web);
  await ok(await post(web,'login',identity),'Web login');
  const workspace=await ok(await web.get('/api/workspace'),'Workspace');
  assert(workspace.sandbox===false&&workspace.actor.role==='customer','Hosted mode or role incorrect');
  const onboard=await ok(await post(web,'onboard',{questionnaire:{...demoQuestionnaire,proposedName:`Synthetic QA ${runId}-${index}`},founder:{legalFirstName:'Synthetic',legalLastName:'Fixture',dateOfBirth:'1990-01-01',nationality:'MX',residence:'MX',taxResidences:['MX']}}),'Onboarding');
  const recommendations=onboard.recommendations as Recommendation[];
  assert(recommendations.length===4&&recommendations.every(r=>r.eligibility==='review_required'&&r.sources.length===0&&r.government_fees.every(f=>f.amountMinor===null&&!f.verified)),'Unreviewed facts must remain blocked');
  tenants.push({identity,client,token:login.data.session.access_token,web,org:membership.data.organization_id,business:onboard.businessId,cases:{}});
 }
 results.push({name:'two real Auth sessions; metadata cannot elevate; full onboarding persisted',passed:true});
 console.log('PASS two real Auth sessions; metadata cannot elevate; full onboarding persisted');
 const[a,b]=tenants;
 await check('incorrect password denied; service rate limit enforced',async()=>{
  assert((await post(anonWeb,'login',{email:a.identity.email,password:'Invalid-password-for-QA'})).status()===401,'Invalid password accepted');
  const bucket=`qa:${runId}`;
  const first=await admin.rpc('take_rate_limit',{bucket,max_requests:1,seconds:60});
  const second=await admin.rpc('take_rate_limit',{bucket,max_requests:1,seconds:60});
  assert(!first.error&&first.data===true&&!second.error&&second.data===false,'Rate limit not enforced');
 });
 await check('RLS isolates organizations in both directions',async()=>{
  for(const[owner,stranger]of [[a,b],[b,a]]){
   const own=await owner.client.from('business_profiles').select('id').eq('id',owner.business);
   const denied=await stranger.client.from('business_profiles').select('id').eq('id',owner.business);
   assert(!own.error&&own.data.length===1&&!denied.error&&denied.data.length===0,'Business RLS isolation failed');
   for(const table of ['founder_profiles','business_owners','consents','questionnaire_answers']){
    const rows=await stranger.client.from(table).select('id').eq('organization_id',owner.org);
    assert(!rows.error&&rows.data.length===0,`${table} cross-organization read not denied`);
   }
   assert((await post(stranger.web,'case-create',{businessId:owner.business,jurisdiction:'GB'})).status()===404,'Server ownership bypass');
  }
 });
 await check('role escalation, direct writes, service RPC and pending evidence denied',async()=>{
  assert((await a.client.from('profiles').update({app_role:'superadmin'}).eq('id',a.identity.id)).error?.code==='42501','Expected role permission denial');
  assert((await a.client.from('organization_members').update({member_role:'member'}).eq('user_id',a.identity.id)).error?.code==='42501','Expected membership permission denial');
  assert((await a.client.from('organization_members').insert({organization_id:b.org,user_id:a.identity.id,member_role:'owner'})).error?.code==='42501','Cross-tenant membership creation not denied');
  assert((await a.client.rpc('apply_operations',{operations:[]})).error?.code==='42501','Service RPC permission denial missing');
  assert((await a.client.from('business_profiles').update({proposed_name:'Unauthorized'}).eq('id',a.business)).error?.code==='42501','Direct business permission denial missing');
  for(const client of [a.client,anonymous])for(const table of ['regulatory_rule_versions','regulatory_rules']){const rows=await client.from(table).select('id');assert(!rows.error&&rows.data.length===0,'Pending regulatory data exposed');}
 });
 await check('four guided cases persist; no mock payment or registration',async()=>{
  for(const jurisdiction of Object.keys(PRODUCTS) as Jurisdiction[]){
   const c=await ok(await post(a.web,'case-create',{businessId:a.business,jurisdiction}),'Case creation');a.cases[jurisdiction]=c.id;
   const row=await a.client.from('formation_cases').select('execution_mode,workflow_state').eq('id',c.id).single();
   assert(!row.error&&row.data.execution_mode==='GUIDED'&&!row.data.workflow_state.registered,'Case claimed real registration');
   const step=PRODUCTS[jurisdiction].workflow[0].code;
   const advance=await post(a.web,'case-advance',{caseId:c.id,stepCode:step,confirmed:true,mock:true});
   assert(advance.status()===409&&(await advance.json()).code==='PAYMENT_REQUIRED','Unpaid mocked advance allowed');
   const checkout=await post(a.web,'checkout-create',{caseId:c.id});
   assert(checkout.status()===503&&(await checkout.json()).code==='EXTERNAL_BLOCKED','External payment unexpectedly enabled');
  }
  const orders=await a.client.from('orders').select('id,status');assert(!orders.error&&orders.data.length===4&&orders.data.every(o=>o.status==='pending'),'Order status incorrect');
  assert((await post(a.web,'checkout-mock',{orderId:orders.data[0].id})).status()===403,'Mock settlement allowed');
  assert((await post(a.web,'sandbox-ops')).status()===404,'Sandbox operator bypass exposed');
  const stranger=await b.client.from('formation_cases').select('id');assert(!stranger.error&&stranger.data.length===0,'Case RLS failed');
 });
 await check('Edge gateway rejects missing, malformed and tampered JWTs',async()=>{
  for(const token of [undefined,'not-a-jwt',`${a.token.slice(0,a.token.lastIndexOf('.')+1)}invalid-signature`]){const r=await edge('jurisdiction-recommend',token,{businessId:a.business});assert(r.status===401,'Invalid JWT accepted');}
 });
 await check('Edge authenticated recommendation and human escalation',async()=>{
  const r=await edge('jurisdiction-recommend',a.token,{businessId:a.business});assert(r.status===200,`Recommendation HTTP ${r.status}: ${r.body.code??r.body.message??'unknown'}`);
  assert(Array.isArray(r.body)&&r.body.length===4&&r.body.every((r:Recommendation)=>r.eligibility==='review_required'),'Edge recommendation did not fail closed');
  const answer=await edge('regulatory-answer',a.token,{jurisdiction:'US-DE',question:'What is the verified filing fee?'});
  assert(answer.status===200&&answer.body.requires_human_review===true&&answer.body.facts.length===0&&answer.body.model_status==='deterministic','Regulatory answer was not safely escalated');
  const escalation=await a.client.from('case_escalations').select('id').eq('escalation_type','regulatory_answer');assert(!escalation.error&&escalation.data.length>0,'Missing persisted escalation');
 });
 await check('Edge creates guided case and preserves tenant/payment boundaries',async()=>{
  const c=await edge('case-create',b.token,{businessId:b.business,jurisdiction:'GB'});assert(c.status===200,`Edge create HTTP ${c.status}`);
  const denied=await edge('case-create',b.token,{businessId:a.business,jurisdiction:'GB'});assert(denied.status===404,'Edge cross-tenant access allowed');
  const advance=await edge('case-advance',b.token,{caseId:c.body.id,stepCode:PRODUCTS.GB.workflow[0].code,confirmed:true,mock:true});assert(advance.status===409&&advance.body.code==='PAYMENT_REQUIRED','Edge advanced unpaid case');
  const payment=await edge('checkout-create',b.token,{caseId:c.body.id});assert(payment.status===503&&payment.body.code==='EXTERNAL_BLOCKED','Edge payment unexpectedly enabled');
 });
 await check('Edge privileged functions, forged worker and webhook denied',async()=>{
  for(const name of ['source-monitor','source-ingest','compliance-generate']){const r=await edge(name,a.token,{});assert(r.status===403,`${name} HTTP ${r.status}; expected role denial`);}
  for(const name of ['source-monitor','notify']){
   assert((await edge(name,undefined,{})).status===401,`${name} allowed anonymous`);
   assert((await edge(name,undefined,{}, {'x-automation-secret':'x'.repeat(32)})).status===401,`${name} allowed forged worker`);
  }
  const notify=await edge('notify',a.token,{});assert(notify.status===200&&notify.body.created===0,'Customer notification did not stay scoped');
  assert((await edge('stripe-webhook',undefined,{type:'checkout.session.completed'})).status===400,'Unsigned webhook accepted');
 });
 await check('Storage quarantine, owner access, cross-tenant denial and expiring links',async()=>{
  const bytes=Buffer.from('%PDF-1.7\nSynthetic staging fixture. Not an identity document.\n%%EOF');
  const uploaded=await ok(await a.web.post('/api/upload',{headers:{Origin:origin},multipart:{caseId:a.cases.GB!,file:{name:'synthetic-qa.pdf',mimeType:'application/pdf',buffer:bytes}}}),'Document upload');
  const doc=await admin.from('case_documents').select('storage_path').eq('id',uploaded.id).single();assert(!doc.error,'Document metadata missing');
  const storagePath=doc.data.storage_path;objects.push({id:uploaded.id,path:storagePath});
  assert((await post(a.web,'document-link',{id:uploaded.id})).status()===409,'Quarantine bypass via API');
  assert((await a.client.storage.from('customer-documents').download(storagePath)).error,'Quarantine bypass via Storage');
  assert((await post(a.web,'document-review',{id:uploaded.id,approve:true})).status()===403,'Customer approved own document');
  // This fixture status is for testing Storage authorization, not KYC or regulatory approval.
  const approval=await admin.rpc('apply_operations',{operations:[{kind:'update',table:'case_documents',where:{id:uploaded.id},data:{status:'approved'}},{kind:'insert',table:'audit_logs',data:{organization_id:a.org,action:'SYNTHETIC_STORAGE_FIXTURE',resource_type:'case_documents',resource_id:uploaded.id,metadata:{qa_run:runId}}}]});
  assert(!approval.error,'Synthetic fixture status update failed');
  const own=await a.client.storage.from('customer-documents').download(storagePath);assert(!own.error&&Buffer.from(await own.data.arrayBuffer()).equals(bytes),'Owner Storage download mismatch');
  for(const client of [b.client,anonymous]){
   assert((await client.storage.from('customer-documents').download(storagePath)).error,'Cross-tenant/anonymous Storage download allowed');
   assert((await client.storage.from('customer-documents').createSignedUrl(storagePath,30)).error,'Cross-tenant/anonymous signed URL allowed');
  }
  const deniedUpload=await a.client.storage.from('customer-documents').upload(`${a.org}/${a.cases.GB}/${randomUUID()}`,bytes,{contentType:'application/pdf'});assert(deniedUpload.error,'Client bypassed server upload validation');
  const link=await ok(await post(a.web,'document-link',{id:uploaded.id}),'Document link');
  const download=await a.web.get(link.url);assert(download.ok()&&(await download.body()).equals(bytes),'Session download mismatch');
  assert((await anonWeb.get(link.url)).status()===401,'Anonymous reused private link');assert((await b.web.get(link.url)).status()===403,'Other tenant reused private link');
  const local=JSON.parse(await readFile('.local/staging/server.json','utf8'));
  const expired=signDocument(uploaded.id,a.org,local.documentSigningSecret,Date.now()-1000);
  assert((await a.web.get(`/api/document-download?token=${encodeURIComponent(expired)}`)).status()===403,'Expired signed link allowed');
  const signed=await a.client.storage.from('customer-documents').createSignedUrl(storagePath,1);assert(!signed.error,'Owner signed Storage URL unavailable');
  await new Promise(resolve=>setTimeout(resolve,2200));
  const expiredStorage=await fetch(signed.data.signedUrl,{cache:'no-store'});assert(!expiredStorage.ok,'Expired Storage link allowed');
 });
 await check('browser sign-in, onboarding, guided case and English/Spanish switch',async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{const page=await browser.newPage();await page.goto(origin+'/ingresar');await page.getByLabel('Correo electrónico').fill(a.identity.email);await page.getByLabel('Contraseña',{exact:true}).fill(a.identity.password);await page.getByRole('button',{name:'Ingresar',exact:true}).click();await page.waitForURL('**/panel');
   const response=await page.request.get(origin+'/api/workspace');const workspace=await response.json();assert(response.ok()&&workspace.sandbox===false&&workspace.records.business_profiles.length===1,'Browser did not load hosted tenant');
   await page.goto(origin+'/iniciar');await page.getByLabel('Nombre legal',{exact:true}).fill('Synthetic');await page.getByLabel('Apellido legal').fill('Browser Fixture');await page.getByLabel('Fecha de nacimiento').fill('1990-01-01');await page.getByRole('button',{name:'Continuar',exact:true}).click();
   await page.getByLabel('Nombre propuesto').fill(`Synthetic Browser ${runId}`);await page.getByLabel('¿A qué se dedica tu negocio?').fill('Synthetic software consulting fixture');await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('checkbox',{name:/Acepto el/}).check();await page.getByRole('button',{name:'Ver mis recomendaciones'}).click();await page.waitForURL('**/recomendaciones/**');await expect(page.locator('.recommendation')).toHaveCount(4);
   await page.locator('.recommendation').filter({has:page.getByRole('heading',{name:'Wyoming LLC',exact:true})}).getByRole('button',{name:'Preparar esta ruta'}).click();await page.waitForURL('**/casos/**');
   const hosted=await(await page.request.get(origin+'/api/workspace')).json();assert(hosted.records.business_profiles.length===2&&hosted.records.formation_cases.length===5&&hosted.records.companies.length===0,'Browser onboarding was not persisted safely');
   await page.goto(origin);assert(await page.locator('html').getAttribute('lang')==='en','Public default language not English');
   await page.getByRole('button',{name:'Español',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('lang','es-419');
   await page.screenshot({path:'.local/staging/browser.png',fullPage:true});
  }finally{await browser.close();}
 });
 await check('no companies, payment settlement, published rules or source capture',async()=>{
  for(const table of ['companies','source_snapshots','rule_source_evidence']){const rows=await admin.from(table).select('id',{count:'exact',head:true});assert(!rows.error&&rows.count===0,`${table} unexpected data`);}
  const rules=await admin.from('regulatory_rule_versions').select('status,published_at,verified_by');assert(!rules.error&&rules.data.every(r=>r.status==='PENDING_REVIEW'&&!r.published_at&&!r.verified_by),'Rules were published or approved');
  const orders=await admin.from('orders').select('status');assert(!orders.error&&orders.data.every(o=>o.status==='pending'),'Payment was settled');
 });
}catch(error){results.push({name:'setup or prerequisite',passed:false,detail:safeError(error)});console.log('FAIL setup or prerequisite; consult sanitized report');}
finally{
 for(const object of objects){await check('remove this run synthetic Storage object',async()=>{const removed=await admin.storage.from('customer-documents').remove([object.path]);assert(!removed.error,'Fixture blob cleanup failed');const updated=await admin.from('case_documents').update({status:'rejected'}).eq('id',object.id);assert(!updated.error,'Fixture cleanup metadata failed');});}
 for(const tenant of tenants){await tenant.client.auth.signOut();}
 await Promise.all(contexts.map(c=>c.dispose()));
 await mkdir('.local/staging',{recursive:true});
 await writeFile('.local/staging/report.json',JSON.stringify({at:new Date().toISOString(),projectRef:target.projectRef,runId,mode:'synthetic-only',results,retainedSyntheticAccounts:tenants.length},null,2));
 console.log(`${results.filter(r=>r.passed).length}/${results.length} hosted checks passed`);
 if(results.some(r=>!r.passed))process.exitCode=1;
}
}
main().catch(()=>{console.error('Staging runner could not initialize; verify ignored credentials and target descriptor.');process.exitCode=1;});
