import {test,expect,type APIRequestContext} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {demoQuestionnaire} from '../../packages/domain';
import {syntheticWyomingIntake,WY_FIELDS} from '../../packages/formation-packet/catalog';
const headers={Origin:'http://127.0.0.1:3000'};
async function post(request:APIRequestContext,action:string,data:unknown){const r=await request.post(`/api/${action}`,{headers,data});expect(r.ok(),`${action}: ${await r.text()}`).toBe(true);return r.json();}

test('Wyoming packet: real UI intake, field map, safe export, private audit and no submission',async({page,playwright})=>{
 const writes:string[]=[];const errors:string[]=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3000')&&!['GET','HEAD'].includes(r.method()))writes.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
 const input={synthetic:true,intake:syntheticWyomingIntake()};
 expect((await page.request.post('/api/wyoming-packet',{headers,data:input})).status()).toBe(401);
 await post(page.request,'signup',{email:`wy-packet-${Date.now()}@example.test`,password:'Synthetic-Wyoming-2026!',displayName:'Fundador WY ficticio'});
 const onboarding=await post(page.request,'onboard',{questionnaire:demoQuestionnaire,founder:{legalFirstName:'Test',legalLastName:'Founder',dateOfBirth:'1990-01-01',nationality:'MX',residence:'MX',taxResidences:['MX']}});
 const c=await post(page.request,'case-create',{businessId:onboarding.businessId,jurisdiction:'US-WY'});
 const original=await(await page.request.get('/api/workspace')).json();
 await page.goto('/laboratorio-agentes');const packet=page.getByRole('region',{name:'Paquete de revisión de Wyoming',exact:true});
 await expect(packet.getByRole('button',{name:'Preparar paquete de revisión'})).toBeDisabled();
 await packet.getByLabel('Confirmo que uso únicamente datos ficticios').check();await packet.getByRole('button',{name:'Preparar paquete de revisión'}).click();
 const output=packet.getByRole('region',{name:'Resultado del paquete Wyoming'});await expect(output.getByRole('heading',{name:'Faltan datos o aclaraciones'})).toBeVisible();
 await packet.getByRole('button',{name:'Cargar fundador ficticio'}).click();await expect(output).toHaveCount(0);
 await packet.getByLabel('Nombre propuesto',{exact:true}).fill('Andes QA LLC');await packet.getByLabel('Vincular solo auditoría a expediente local').selectOption(c.id);
 await packet.getByRole('button',{name:'Preparar paquete de revisión'}).click();await expect(output.getByRole('heading',{name:'Datos completos para revisión interna'})).toBeVisible();
 await expect(output.getByRole('status')).toContainText('Metadatos del ensayo guardados');await expect(output).toContainText('Registro real: no');
 await output.getByText('Mapa del paquete y fuentes',{exact:true}).click();await expect(output.locator('tbody tr')).toHaveCount(WY_FIELDS.length);
 const pendingDownload=page.waitForEvent('download');await output.getByRole('button',{name:'Descargar paquete Wyoming JSON'}).click();const download=await pendingDownload;
 expect(download.suggestedFilename()).toBe('wyoming-review-packet-synthetic.json');const exported=JSON.parse(await readFile((await download.path())!,'utf8'));
 expect(exported.packet).toMatchObject({status:'DRAFT_NOT_FOR_FILING',registered:false,externalWrites:0,binding:{caseId:c.id,revision:0},filingAdapter:'EXTERNAL_BLOCKED'});expect(exported.receipt.providerAccepted).toBe(false);
 const stale=exported.packet.blockers.some((b:{code:string})=>b.code==='SOURCE_RECHECK_REQUIRED');expect(exported.packet.routing.filing).toBe(stale?'RECHECK_REQUIRED':'PAPER_MANUAL_REVIEW');
 await output.getByText('Mapa del paquete y fuentes',{exact:true}).click();await output.scrollIntoViewIfNeeded();await page.screenshot({path:'.local/qa/wyoming-packet-desktop.png',animations:'disabled'});
 await page.setViewportSize({width:390,height:844});await output.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'.local/qa/wyoming-packet-mobile.png',animations:'disabled'});
 await packet.getByLabel('Nombre propuesto',{exact:true}).fill('New QA LLC');await expect(output).toHaveCount(0); // Never export an old result for edited inputs.
 const bound={...input,caseId:c.id,caseRevision:0};const other=await playwright.request.newContext({baseURL:'http://127.0.0.1:3000'});
 try{
  await post(other,'signup',{email:`wy-stranger-${Date.now()}@example.test`,password:'Synthetic-Wyoming-2026!'});
  expect((await other.post('/api/wyoming-packet',{headers,data:bound})).status()).toBe(404);expect((await(await other.get('/api/workspace')).json()).records.case_events).toHaveLength(0);
 }finally{await other.dispose();}
 expect((await page.request.post('/api/wyoming-packet',{headers:{Origin:'https://evil.test'},data:bound})).status()).toBe(403);
 expect((await page.request.post('/api/wyoming-packet',{headers,data:{...bound,caseRevision:999}})).status()).toBe(409);
 for(const extra of [{synthetic:false},{registered:true},{sourceApproved:true},{url:'https://evil.test'},{intake:{...input.intake,ssn:'000-00-0000'}}])expect((await page.request.post('/api/wyoming-packet',{headers,data:{...bound,...extra}})).status()).toBe(400);
 const latest=await(await page.request.get('/api/workspace')).json();expect(latest.records.formation_cases).toEqual(original.records.formation_cases);expect(latest.records.orders).toHaveLength(0);expect(latest.records.companies).toHaveLength(0);
 const events=latest.records.case_events.filter((e:{event_type:string})=>e.event_type==='WY_PACKET_PREPARED');expect(events).toHaveLength(1);expect(events[0].payload.packetHash).toBe(exported.packet.packetHash);expect(JSON.stringify(events)).not.toContain(input.intake.agentStreet);
 expect(writes).toEqual([]);expect(errors).toEqual([]);
});
