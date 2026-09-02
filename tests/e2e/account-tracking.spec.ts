import {test,expect,type APIRequestContext} from '@playwright/test';
import {demoQuestionnaire} from '../../packages/domain';
import {PRODUCTS} from '../../packages/jurisdiction-engine';
const headers={Origin:'http://127.0.0.1:3000'};
async function post(request:APIRequestContext,action:string,data:unknown={}){const r=await request.post(`/api/${action}`,{headers,data});expect(r.ok(),`${action}: ${await r.text()}`).toBe(true);return r.json();}

test('Google unavailable is explicit; OAuth tampering, CSRF and invalid callbacks create no session',async({page})=>{
 await page.goto('/ingresar');await expect(page.getByRole('button',{name:'Continuar con Google'})).toBeDisabled();await expect(page.getByText('Google pendiente de configuración.',{exact:false})).toBeVisible();
 const blocked=await page.request.post('/api/oauth-google',{headers,data:{}});expect(blocked.status()).toBe(503);expect((await blocked.json()).code).toBe('EXTERNAL_BLOCKED');
 expect((await page.request.post('/api/oauth-google',{headers:{Origin:'https://evil.test'},data:{}})).status()).toBe(403);
 expect((await page.request.post('/api/oauth-google',{headers,data:{provider:'google',redirectTo:'https://evil.test',role:'admin'}})).status()).toBe(400);
 for(const path of ['/auth/callback?code=fake&next=https://evil.test','/auth/callback?error=denied&error_description=private-token','/auth/callback?code=one&code=two']){
  const r=await page.request.get(path,{maxRedirects:0,headers:{'X-Forwarded-Host':'evil.test'}});expect(r.status()).toBe(307);
  const target=new URL(r.headers().location);expect(['localhost','127.0.0.1']).toContain(target.hostname);expect(target.pathname).toBe('/ingresar');expect(target.search).toBe('?confirmation=failed');expect(r.headers()['cache-control']).toBe('no-store');
 }
 expect((await page.request.get('/api/case-tracking')).status()).toBe(401);
 await page.goto('/ingresar?confirmation=failed');await expect(page.locator('form').getByRole('alert')).toContainText('No se pudo completar el acceso');
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'.local/qa/google-auth-unconfigured.png',fullPage:true,animations:'disabled'});
});

test('UK customer dashboard tracks real stored preparation events, isolation and automatic progress refresh',async({page,playwright})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await post(page.request,'signup',{email:`tracking-${Date.now()}@example.test`,password:'Synthetic-tracking-2026!',displayName:'Cliente UK ficticio'});
 const q=await post(page.request,'onboard',{questionnaire:{...demoQuestionnaire,proposedName:'UK QA Studio'},founder:{legalFirstName:'Test',legalLastName:'Founder',dateOfBirth:'1990-01-01',nationality:'MX',residence:'MX',taxResidences:['MX']}});
 const c=await post(page.request,'case-create',{businessId:q.businessId,jurisdiction:'GB'});
 await page.goto('/panel');const tracker=page.getByRole('region',{name:'Seguimiento de mis expedientes'});
 await expect(tracker.getByText('Asistente UK Ltd',{exact:false})).toBeVisible();await expect(tracker.getByText('Sin ejecución disponible',{exact:true})).toBeVisible();
 await tracker.getByRole('button',{name:'Preparar resumen del expediente'}).click();await expect(tracker.getByRole('status')).toContainText('No se presentó ninguna solicitud');await expect(tracker.getByText('Resumen preparado',{exact:true})).toBeVisible();
 const before=await(await page.request.get(`/api/case-tracking?caseId=${c.id}`)).json();expect(before.cases[0]).toMatchObject({revision:0,registrationConfirmed:false,completedSteps:0});
 expect(before.cases[0].agent.runStatus).toBe('COMPLETED');
 const other=await playwright.request.newContext({baseURL:'http://127.0.0.1:3000'});const ops=await playwright.request.newContext({baseURL:'http://127.0.0.1:3000'});
 try{
  await post(other,'signup',{email:`tracking-other-${Date.now()}@example.test`,password:'Synthetic-tracking-2026!'});
  expect((await other.get(`/api/case-tracking?caseId=${c.id}`)).status()).toBe(404);
  expect((await other.post('/api/case-brief',{headers,data:{caseId:c.id}})).status()).toBe(404);
  expect((await(await other.get('/api/case-tracking')).json()).cases).toHaveLength(0);
  expect((await page.request.post('/api/case-brief',{headers,data:{caseId:c.id,registered:true,agentId:'admin'}})).status()).toBe(400);
  expect((await page.request.post('/api/case-brief',{headers:{Origin:'https://evil.test'},data:{caseId:c.id}})).status()).toBe(403);
  await post(ops,'sandbox-ops');await post(page.request,'checkout-create',{caseId:c.id});const workspace=await(await page.request.get('/api/workspace')).json();await post(page.request,'checkout-mock',{orderId:workspace.records.orders[0].id});
  await post(ops,'case-advance',{caseId:c.id,stepCode:PRODUCTS.GB.workflow[0].code,confirmed:true,mock:true,reference:'QA-ONLY'});
  await expect(tracker.getByText(`1 de ${PRODUCTS.GB.workflow.length} pasos del expediente`)).toBeVisible({timeout:35000});
  await expect(page.locator('.case-list')).toContainText(`1/${PRODUCTS.GB.workflow.length} pasos`);
  await expect(tracker.getByText('Resumen anterior; actualizar expediente',{exact:true})).toBeVisible();
  await expect(tracker.getByText('Sandbox; sin registro real',{exact:true})).toBeVisible();
  await page.screenshot({path:'.local/qa/user-tracking-desktop.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'.local/qa/user-tracking-mobile.png',fullPage:true,animations:'disabled'});
  await page.goto(`/casos/${c.id}`);await expect(page.getByRole('region',{name:'Seguimiento de mis expedientes'})).toBeVisible();
  await post(page.request,'logout');expect((await page.request.get(`/api/case-tracking?caseId=${c.id}`)).status()).toBe(401);
  expect(errors).toEqual([]);
 }finally{await other.dispose();await ops.dispose();}
});
