import {test,expect} from 'vitest';
import {initializeWorkflow} from '../../packages/workflow-engine';
import {PRODUCTS} from '../../packages/jurisdiction-engine';
import {demoQuestionnaire,type Jurisdiction} from '../../packages/domain';
import type {FormationRecord,Actor} from '../../packages/application';
import type {Repository,Operation,Row} from '../../packages/persistence';
import {CASE_AGENTS,CASE_AGENT_VERSION,trackCase} from '../../packages/case-tracking';
import {prepareCaseBrief} from '../../packages/case-tracking/service';
const now=new Date('2026-09-03T12:00:00Z');
const id='00000000-0000-4000-8000-000000000042';
function record(jurisdiction:Jurisdiction='GB'):FormationRecord{return{id,organization_id:'org-a',business_profile_id:'business-a',jurisdiction_code:jurisdiction,status:'AWAITING_PAYMENT',execution_mode:'GUIDED',revision:0,created_at:now.toISOString(),workflow_state:initializeWorkflow(jurisdiction,PRODUCTS[jurisdiction].workflow)};}
test.each(['GB','EE','US-WY','US-DE'] as const)('%s owns a route agent but cannot claim an execution or registration without evidence',j=>{
 const r=record(j);const tracked=trackCase(r,[],now);expect(tracked.agent.id).toBe(CASE_AGENTS[j].id);expect(tracked.agent.runStatus).toBe('NOT_STARTED');expect(tracked.registrationConfirmed).toBe(false);expect(tracked.blockers.map(b=>b.code)).toContain('EXTERNAL_BLOCKED');
 r.workflow_state.registered=true;r.status='REGISTERED';expect(trackCase(r,[],now)).toMatchObject({registrationConfirmed:false,requiresEvidenceReview:true});
 r.execution_mode='SANDBOX';expect(trackCase(r,[],now).registrationLabel).toBe('Registro simulado; sin efecto legal');
});
test('tenant events, lab output and arbitrary payload text cannot become agent execution evidence',()=>{
 const r=record();const e={id:5,case_id:r.id,organization_id:'org-b',event_type:'CASE_BRIEF_COMPLETED',created_at:now.toISOString(),payload:{agentId:CASE_AGENTS.GB.id,version:CASE_AGENT_VERSION,caseRevision:0}};
 expect(trackCase(r,[e],now).agent.runStatus).toBe('NOT_STARTED');
 expect(trackCase(r,[{...e,organization_id:r.organization_id,event_type:'AGENT_LAB_EVALUATED',payload:{...e.payload,registered:true,secret:'not-for-output'}}],now).agent.runStatus).toBe('NOT_STARTED');
 expect(JSON.stringify(trackCase(r,[{...e,organization_id:r.organization_id,payload:{secret:'not-for-output'}}],now))).not.toContain('not-for-output');
});
test('Wyoming tracking exposes only bounded onboarding progress and ignores foreign conversation rows',()=>{
 const r=record('US-WY');r.execution_mode='SANDBOX';
 const conversation={organization_id:r.organization_id,case_id:r.id,status:'active',execution_mode:'OPENAI_RESPONSES',state_json:{companyName:'Private Orbit LLC',entityVariant:'ordinary',unexpected:'do-not-leak'},pending_patch:{nameSearch:'pending-secret-value',injected:'do-not-leak'},updated_at:now.toISOString()};
 const tracked=trackCase(r,[{id:7,case_id:r.id,organization_id:r.organization_id,event_type:'AGENT_PATCH_ACCEPTED',created_at:now.toISOString(),payload:{fields:['companyName']}}],now,conversation);
 expect(tracked.intake).toMatchObject({available:true,status:'ACTIVE',confirmedFields:2,pendingFields:1,totalFields:21,executionMode:'OPENAI_RESPONSES'});
 expect(tracked.activity[0].label).toBe('Datos de onboarding confirmados por el cliente');
 expect(JSON.stringify(tracked)).not.toContain('Private Orbit LLC');expect(JSON.stringify(tracked)).not.toContain('pending-secret-value');expect(JSON.stringify(tracked)).not.toContain('do-not-leak');
 expect(trackCase(r,[],now,{...conversation,organization_id:'foreign'}).intake).toMatchObject({status:'NOT_STARTED',confirmedFields:0,pendingFields:0});
});
test('Delaware tracking exposes bounded progress without intake values',()=>{
 const r=record('US-DE');r.execution_mode='SANDBOX';const conversation={organization_id:r.organization_id,case_id:r.id,status:'active',execution_mode:'DETERMINISTIC_MOCK',state_json:{companyName:'Private Delaware LLC',nameSearch:'yes'},pending_patch:{activity:'Private activity'},updated_at:now.toISOString()};const tracked=trackCase(r,[],now,conversation);expect(tracked.intake).toMatchObject({available:true,jurisdiction:'US-DE',status:'ACTIVE',confirmedFields:2,pendingFields:1,totalFields:20,executionMode:'DETERMINISTIC_MOCK'});expect(JSON.stringify(tracked)).not.toContain('Private Delaware LLC');expect(JSON.stringify(tracked)).not.toContain('Private activity');
});
test('Estonia tracking exposes bounded progress without intake values',()=>{
 const r=record('EE');r.execution_mode='SANDBOX';const conversation={organization_id:r.organization_id,case_id:r.id,status:'active',execution_mode:'OPENAI_RESPONSES',state_json:{companyName:'Private Estonia OÜ',nameSearch:'yes'},pending_patch:{principalActivity:'Private activity'},updated_at:now.toISOString()};const tracked=trackCase(r,[],now,conversation);expect(tracked.intake).toMatchObject({available:true,jurisdiction:'EE',status:'ACTIVE',confirmedFields:2,pendingFields:1,totalFields:24,executionMode:'OPENAI_RESPONSES'});expect(JSON.stringify(tracked)).not.toContain('Private Estonia OÜ');expect(JSON.stringify(tracked)).not.toContain('Private activity');
});
test('UK tracking exposes bounded progress without intake values',()=>{
 const r=record('GB');r.execution_mode='SANDBOX';const conversation={organization_id:r.organization_id,case_id:r.id,status:'active',execution_mode:'OPENAI_RESPONSES',state_json:{companyName:'Private United Kingdom Ltd',nameSearch:'yes'},pending_patch:{principalActivity:'Private activity'},updated_at:now.toISOString()};const tracked=trackCase(r,[],now,conversation);expect(tracked.intake).toMatchObject({available:true,jurisdiction:'GB',status:'ACTIVE',confirmedFields:2,pendingFields:1,totalFields:22,executionMode:'OPENAI_RESPONSES'});expect(JSON.stringify(tracked)).not.toContain('Private United Kingdom Ltd');expect(JSON.stringify(tracked)).not.toContain('Private activity');
});
test('only a recent matching execution is running; stale clocks and newer case revisions invalidate it',()=>{
 const r=record();const e={id:1,case_id:r.id,organization_id:r.organization_id,event_type:'CASE_BRIEF_STARTED',created_at:now.toISOString(),payload:{agentId:CASE_AGENTS.GB.id,version:CASE_AGENT_VERSION,caseRevision:0}};
 expect(trackCase(r,[e],now).agent.runStatus).toBe('RUNNING');
 expect(trackCase(r,[e],new Date(now.getTime()+120000)).agent.runStatus).toBe('UNCONFIRMED');
 expect(trackCase(r,[e],new Date(now.getTime()-1000)).agent.runStatus).toBe('UNCONFIRMED');
 const completed={...e,id:2,event_type:'CASE_BRIEF_COMPLETED'};
 expect(trackCase(r,[e,completed],now).agent.runStatus).toBe('COMPLETED');r.revision=1;expect(trackCase(r,[completed],now).agent.runStatus).toBe('OUTDATED');
});
test('brief generation records an actual bounded run without changing workflow or charging',async()=>{
 const r=record();const original=structuredClone(r);const events:Row[]=[];const actor:Actor={id:'customer-a',organizationId:'org-a',role:'customer',displayName:'Test'};
 const repo={list:async(table:string)=>table==='formation_cases'?[r]:table==='business_profiles'?[{id:'business-a',organization_id:'org-a',questionnaire:demoQuestionnaire}]:events,atomic:async(ops:Operation[])=>{for(const op of ops){expect(op.kind).toBe('insert');expect(op.table).toBe('case_events');events.push({...op.data,id:events.length+1,created_at:now.toISOString()});}return[];}} as unknown as Repository;
 await expect(prepareCaseBrief(repo,{...actor,organizationId:'stranger'},{caseId:id})).rejects.toMatchObject({code:'NOT_FOUND'});expect(events).toHaveLength(0);
 await expect(prepareCaseBrief(repo,actor,{caseId:id,registered:true})).rejects.toThrow();expect(events).toHaveLength(0);
 const result=await prepareCaseBrief(repo,actor,{caseId:id});expect(result.draft.status).toBe('DRAFT_NOT_FOR_FILING');expect(result.tracking.agent.runStatus).toBe('COMPLETED');expect(events.map(e=>e.event_type)).toEqual(['CASE_BRIEF_STARTED','CASE_BRIEF_COMPLETED']);expect(r).toEqual(original);expect(JSON.stringify(events)).not.toContain(demoQuestionnaire.activity);
});
test('a failed preparation is recorded without exposing provider or database error text',async()=>{
 const r=record();const events:Row[]=[];const repo={list:async(table:string)=>{if(table==='business_profiles')throw new Error('sensitive-db-detail');return[r];},atomic:async(ops:Operation[])=>{events.push(...ops.map(o=>o.data));return[];}} as unknown as Repository;
 await expect(prepareCaseBrief(repo,{id:'a',organizationId:'org-a',role:'customer',displayName:'QA'},{caseId:id})).rejects.toMatchObject({code:'BRIEF_FAILED'});expect(events.map(e=>e.event_type)).toEqual(['CASE_BRIEF_STARTED','CASE_BRIEF_FAILED']);expect(JSON.stringify(events)).not.toContain('sensitive-db-detail');
});
