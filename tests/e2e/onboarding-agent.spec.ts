import {test,expect,type APIRequestContext} from '@playwright/test';
import {demoQuestionnaire} from '../../packages/domain';
const headers={Origin:'http://127.0.0.1:3000'};
const requestId=()=>crypto.randomUUID();
async function post(request:APIRequestContext,action:string,data:unknown){const response=await request.post(`/api/${action}`,{headers,data});expect(response.ok(),`${action}: ${await response.text()}`).toBe(true);return response.json();}

test('cliente ficticio conversa, confirma, retoma la sesión y permanece aislado',async({page,playwright})=>{
 await post(page.request,'signup',{email:`agent-${Date.now()}@example.test`,password:'Synthetic-Agent-2026!',displayName:'Cliente agéntico ficticio'});
 const onboarding=await post(page.request,'onboard',{questionnaire:demoQuestionnaire,founder:{legalFirstName:'Test',legalLastName:'Founder',dateOfBirth:'1990-01-01',nationality:'MX',residence:'MX',taxResidences:['MX']}});const formation=await post(page.request,'case-create',{businessId:onboarding.businessId,jurisdiction:'US-WY'});
 await page.goto('/laboratorio-agentes');const lab=page.getByRole('region',{name:'Onboarding conversacional Wyoming'});await lab.getByLabel('Expediente Wyoming ficticio').selectOption(formation.id);await lab.getByRole('button',{name:'Iniciar conversación'}).click();
 await expect(lab.getByText('0/21 campos confirmados')).toBeVisible();await lab.getByLabel('Mensaje del cliente ficticio').fill('Nombre propuesto: Orbit QA LLC');await lab.getByRole('button',{name:'Enviar al agente'}).click();
 await expect(lab.getByRole('heading',{name:'Confirmación requerida'})).toBeVisible();await expect(lab).toContainText('companyName: Orbit QA LLC');await lab.getByRole('button',{name:'Confirmar y guardar'}).click();await expect(lab.getByText('1/21 campos confirmados')).toBeVisible();
 await page.reload();await lab.getByLabel('Expediente Wyoming ficticio').selectOption(formation.id);await expect(lab.getByText('1/21 campos confirmados')).toBeVisible();await expect(lab).toContainText('Orbit QA LLC');
 const conversation=await(await page.request.get(`/api/agent-conversation?caseId=${formation.id}`)).json();expect(conversation.conversation.state.companyName).toBe('Orbit QA LLC');expect(conversation.conversation.synthetic).toBe(true);
 expect((await page.request.post('/api/agent-conversation-message',{headers,data:{conversationId:conversation.conversation.id,revision:conversation.conversation.revision,message:'Mi pasaporte QA123',clientRequestId:requestId()}})).status()).toBe(400);
 expect((await page.request.post('/api/agent-conversation-message',{headers:{Origin:'https://evil.test'},data:{conversationId:conversation.conversation.id,revision:conversation.conversation.revision,message:'Actividad ficticia: Software QA',clientRequestId:requestId()}})).status()).toBe(403);
 const stranger=await playwright.request.newContext({baseURL:'http://127.0.0.1:3000'});try{await post(stranger,'signup',{email:`agent-other-${Date.now()}@example.test`,password:'Synthetic-Agent-2026!'});expect((await stranger.get(`/api/agent-conversation?caseId=${formation.id}`)).status()).toBe(404);}finally{await stranger.dispose();}
 const workspace=await(await page.request.get('/api/workspace')).json();const current=workspace.records.formation_cases.find((item:{id:string})=>item.id===formation.id);expect(current.revision).toBe(0);expect(workspace.records.orders).toHaveLength(0);expect(workspace.records.companies).toHaveLength(0);
});
