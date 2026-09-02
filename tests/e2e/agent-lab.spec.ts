import { test, expect, type APIRequestContext } from '@playwright/test';
import { demoQuestionnaire, JURISDICTIONS } from '../../packages/domain';
import { GUIDE_IDS, scenariosFor } from '../../packages/formation-guidance';
const headers = {Origin: 'http://127.0.0.1:3000'};
async function post(request: APIRequestContext, action: string, data: unknown) {
  const response = await request.post(`/api/${action}`, {headers, data});
  expect(response.ok(), `${action}: ${await response.text()}`).toBe(true);
  return response.json();
}
test('synthetic user: all country guides, real case audit, no external writes or tenant access', async ({page, playwright}) => {
  const externalWrites: string[] = [];
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:3000') && !['GET','HEAD'].includes(request.method())) externalWrites.push(request.url());
  });
  const browserErrors: string[] = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.goto('/laboratorio-agentes');
  await expect(page).toHaveURL('/ingresar');
  expect((await page.request.post('/api/agent-lab-evaluate', {headers, data: {guideId: 'SG', scenario: 'base'}})).status()).toBe(401);
  await post(page.request, 'signup', {email: `agent-lab-${Date.now()}@example.test`, password: 'Synthetic-Lab-2026-only', displayName: 'Fundadora QA ficticia'});
  const onboarding = await post(page.request, 'onboard', {questionnaire: demoQuestionnaire, founder: {legalFirstName: 'Test', legalLastName: 'Founder', dateOfBirth: '1990-01-01', nationality: 'MX', residence: 'MX', taxResidences: ['MX']}});
  const caseIds: Record<string,string> = {};
  for (const id of JURISDICTIONS) {
    caseIds[id] = (await post(page.request, 'case-create', {businessId: onboarding.businessId, jurisdiction: id})).id;
  }
  const initial = await (await page.request.get('/api/workspace')).json();
  for (const guideId of GUIDE_IDS) for (const scenario of scenariosFor(guideId)) {
    const result = await post(page.request, 'agent-lab-evaluate', {guideId, scenario, ...(caseIds[guideId] ? {caseId: caseIds[guideId]} : {})});
    expect(result.registered).toBe(false); expect(result.externalWrites).toBe(0);
    expect(result.filingAdapter).toBe('EXTERNAL_BLOCKED');
  }
  const other = await playwright.request.newContext({baseURL: 'http://127.0.0.1:3000'});
  try {
    await post(other, 'signup', {email: `agent-other-${Date.now()}@example.test`, password: 'Synthetic-Lab-2026-only'});
    const response = await other.post('/api/agent-lab-evaluate', {headers, data: {guideId: 'US-WY', scenario: 'base', caseId: caseIds['US-WY']}});
    expect(response.status()).toBe(404);
    const records = (await (await other.get('/api/workspace')).json()).records;
    expect(records.case_events).toHaveLength(0);
  } finally { await other.dispose(); }
  expect((await page.request.post('/api/agent-lab-evaluate', {headers, data: {guideId: 'SG', scenario: 'base', caseId: caseIds['US-WY']}})).status()).toBe(400);
  expect((await page.request.post('/api/agent-lab-evaluate', {headers: {Origin: 'https://evil.test'}, data: {guideId: 'SG', scenario: 'base'}})).status()).toBe(403);
  for (const extra of [{role: 'admin'}, {registered: true}, {url: 'http://127.0.0.1/admin'}, {humanApproved: true}]) {
    expect((await page.request.post('/api/agent-lab-evaluate', {headers, data: {guideId: 'SG', scenario: 'base', ...extra}})).status()).toBe(400);
  }
  const final = await (await page.request.get('/api/workspace')).json();
  expect(final.records.formation_cases).toEqual(initial.records.formation_cases);
  expect(final.records.companies).toHaveLength(0);
  expect(final.records.orders).toHaveLength(0);
  expect(final.records.case_events.filter((event: {event_type: string}) => event.event_type === 'AGENT_LAB_EVALUATED')).toHaveLength(JURISDICTIONS.reduce((total,id)=>total+scenariosFor(id).length,0));
  await page.goto('/laboratorio-agentes');
  await expect(page.getByRole('heading', {name: 'Laboratorio de agentes'})).toBeVisible();
  await page.getByRole('button', {name: `Evaluar las ${GUIDE_IDS.length} rutas`}).click();
  await expect(page.getByRole('region', {name: 'Comparación de resultados'}).locator('tbody tr')).toHaveCount(GUIDE_IDS.length);
  await page.getByLabel('Escenario de prueba').selectOption('wy-name-a');
  await page.getByLabel('Expediente para registrar la evaluación').selectOption(caseIds['US-WY']);
  await page.getByRole('button', {name: 'Probar este escenario'}).click();
  await expect(page.getByText('Evaluación sintética guardada en el historial del expediente.')).toBeVisible();
  await page.getByText('Códigos de bloqueo para auditoría').click();
  await expect(page.getByText('WY_PAPER_MANUAL_REVIEW', {exact: true})).toBeVisible();
  await page.screenshot({path: '.local/qa/agent-lab-desktop.png', fullPage: true});
  for (const name of ['Estonia', 'Reino Unido', 'Lituania', 'Dubái', 'Singapur', 'Hong Kong', 'Delaware']) {
    await page.getByRole('button', {name: new RegExp(name)}).click();
    await expect(page.getByRole('heading', {name: 'Qué información va en cada sitio'})).toBeVisible();
    expect(await page.getByRole('link', {name: 'Fuente oficial ↗', exact: true}).count()).toBeGreaterThan(1);
  }
  await page.setViewportSize({width: 390, height: 844});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({path: '.local/qa/agent-lab-mobile.png', fullPage: true});
  const download = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Descargar informe JSON'}).click();
  expect((await download).suggestedFilename()).toBe('agent-lab-synthetic-report.json');
  expect(externalWrites).toEqual([]); expect(browserErrors).toEqual([]);
});
