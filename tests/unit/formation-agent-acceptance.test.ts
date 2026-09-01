import { expect,test } from 'vitest';
import { demoQuestionnaire,type Jurisdiction } from '../../packages/domain';
import { PRODUCTS } from '../../packages/jurisdiction-engine/catalog';
import { advanceWorkflow,analyzeWorkflow,initializeWorkflow } from '../../packages/workflow-engine';

const jurisdictions=Object.keys(PRODUCTS) as Jurisdiction[];
const ops={id:'acceptance-ops',role:'ops' as const};
const context={sandbox:true,questionnaire:demoQuestionnaire,now:new Date('2026-08-31T12:00:00Z')};

test.each(jurisdictions)('%s has complete ownership and automation coverage',jurisdiction=>{
 const coverage=analyzeWorkflow(PRODUCTS[jurisdiction].workflow);
 expect(coverage.totalSteps).toBe(PRODUCTS[jurisdiction].workflow.length);
 expect(coverage.byActor.YOU).toBeGreaterThan(0);
 expect(coverage.byActor.WE_PREPARE).toBeGreaterThan(0);
 expect(coverage.byActor.PARTNER).toBeGreaterThan(0);
 expect(coverage.byActor.GOVERNMENT).toBeGreaterThan(0);
 expect(coverage.externalSteps).toBe(coverage.byActor.PARTNER+coverage.byActor.GOVERNMENT);
 expect(coverage.canFinishWithoutExternalAuthority).toBe(false);
});

test.each(jurisdictions)('%s reaches registration and compliance only as an explicit sandbox simulation',jurisdiction=>{
 let state=initializeWorkflow(jurisdiction,PRODUCTS[jurisdiction].workflow);state.paid=true;
 const confirmation=state.steps.findIndex(step=>step.gate==='confirmation');
 expect(confirmation).toBeGreaterThan(-1);
 for(const [index,step] of PRODUCTS[jurisdiction].workflow.entries()){
  state=advanceWorkflow(state,{stepCode:step.code,confirmed:true,mock:true,reference:`ACCEPTANCE-${step.code}`},ops,context);
  if(index<confirmation)expect(state.registered).toBe(false);
 }
 expect(state).toMatchObject({status:'ACTIVE_COMPLIANCE',registered:true});
 expect(state.events.every(event=>event.type==='SANDBOX_STEP_COMPLETED')).toBe(true);
 expect(state.steps.every(step=>step.reference?.startsWith('MOCK:'))).toBe(true);
});

test.each(jurisdictions)('%s blocks uncontracted partners and every real government transition',jurisdiction=>{
 const steps=PRODUCTS[jurisdiction].workflow;
 const partner=steps.find(step=>step.actor==='PARTNER')!;
 const government=steps.find(step=>step.actor==='GOVERNMENT')!;
 const before=(target:string,partnerVerified:boolean)=>{const state=initializeWorkflow(jurisdiction,steps);state.paid=true;state.signals={identityVerified:true,partnerVerified,riskApproved:true,signaturesComplete:true};for(const step of state.steps){if(step.code===target)break;step.status='completed';}return state;};
 expect(()=>advanceWorkflow(before(partner.code,false),{stepCode:partner.code,confirmed:true,reference:'UNVERIFIED'},ops,{...context,sandbox:false})).toThrow(/partner pendientes/);
 expect(()=>advanceWorkflow(before(government.code,true),{stepCode:government.code,confirmed:true,reference:'SELF-ASSERTED'},ops,{...context,sandbox:false})).toThrow(/gubernamental requiere adaptador/);
});

test('invalid workflow ownership cannot enter the acceptance catalog',()=>{
 const malformed=structuredClone(PRODUCTS.GB.workflow);malformed[0].automation='A_FULLY_AUTOMATABLE';
 expect(()=>analyzeWorkflow(malformed)).toThrow(/automatización/);
});
