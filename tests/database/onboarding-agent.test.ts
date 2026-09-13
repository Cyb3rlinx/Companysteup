import {expect,test} from 'vitest';
import {testDatabase} from './harness';
import {LocalRepository} from '../../packages/persistence';
import {Application,type Actor} from '../../packages/application';
import {demoQuestionnaire} from '../../packages/domain';
import {startWyomingConversation,getWyomingConversation,sendWyomingMessage,confirmWyomingPatch} from '../../packages/onboarding-agent/service';

test('Wyoming conversation is private, idempotent, confirmed and cannot mutate the case',async()=>{
 const db=await testDatabase();try{
  await db.exec(await (await import('node:fs/promises')).readFile('supabase/seed.sql','utf8'));const repo=new LocalRepository(db);
  const users=['00000000-0000-4000-8000-000000000091','00000000-0000-4000-8000-000000000092'];for(const id of users)await db.query('insert into auth.users(id) values($1)',[id]);
  const actors=await Promise.all(users.map(async id=>({id,organizationId:String((await repo.list('organization_members',{user_id:id}))[0].organization_id),role:'customer',displayName:'QA'} as Actor)));
  const app=new Application(repo,true);const onboarding=await app.onboard(actors[0],demoQuestionnaire,{firstName:'Test',lastName:'Founder',dateOfBirth:'1990-01-01'});const created=await app.createCase(actors[0],onboarding.businessId,'US-WY');
  const before=(await repo.list('formation_cases',{id:created.id}))[0];const startId='10000000-0000-4000-8000-000000000001';
  const started=await startWyomingConversation(repo,actors[0],true,{caseId:created.id,caseRevision:0,synthetic:true,clientRequestId:startId});expect(started.conversation.revision).toBe(0);
  expect((await startWyomingConversation(repo,actors[0],true,{caseId:created.id,caseRevision:0,synthetic:true,clientRequestId:startId})).conversation.id).toBe(started.conversation.id);
  await expect(getWyomingConversation(repo,actors[1],true,created.id)).rejects.toMatchObject({code:'NOT_FOUND'});
  const messageId='10000000-0000-4000-8000-000000000002';const sent=await sendWyomingMessage(repo,actors[0],true,{conversationId:started.conversation.id,revision:0,message:'Nombre propuesto: Orbit QA LLC',clientRequestId:messageId});
  expect(sent.conversation.state.companyName).toBe('');expect(sent.conversation.pendingPatch).toEqual({companyName:'Orbit QA LLC'});expect(sent.turns).toHaveLength(1);
  expect((await sendWyomingMessage(repo,actors[0],true,{conversationId:started.conversation.id,revision:0,message:'Nombre propuesto: Orbit QA LLC',clientRequestId:messageId})).turns).toHaveLength(1);
  await expect(sendWyomingMessage(repo,actors[0],true,{conversationId:started.conversation.id,revision:1,message:'Actividad ficticia: Software QA',clientRequestId:'10000000-0000-4000-8000-000000000003'})).rejects.toMatchObject({code:'CONFIRMATION_REQUIRED'});
  const confirmed=await confirmWyomingPatch(repo,actors[0],true,{conversationId:started.conversation.id,revision:1,accept:true,clientRequestId:'10000000-0000-4000-8000-000000000004'});expect(confirmed.conversation.state.companyName).toBe('Orbit QA LLC');expect(confirmed.conversation.pendingPatch).toEqual({});
  const proposedCorrection=await sendWyomingMessage(repo,actors[0],true,{conversationId:started.conversation.id,revision:2,message:'Nombre propuesto: Orbit Corrected LLC',clientRequestId:'10000000-0000-4000-8000-000000000005'});expect(proposedCorrection.conversation.state.companyName).toBe('Orbit QA LLC');
  const rejectedCorrection=await confirmWyomingPatch(repo,actors[0],true,{conversationId:started.conversation.id,revision:3,accept:false,clientRequestId:'10000000-0000-4000-8000-000000000006'});expect(rejectedCorrection.conversation.state.companyName).toBe('Orbit QA LLC');
  await sendWyomingMessage(repo,actors[0],true,{conversationId:started.conversation.id,revision:4,message:'Nombre propuesto: Orbit Corrected LLC',clientRequestId:'10000000-0000-4000-8000-000000000007'});
  const corrected=await confirmWyomingPatch(repo,actors[0],true,{conversationId:started.conversation.id,revision:5,accept:true,clientRequestId:'10000000-0000-4000-8000-000000000008'});expect(corrected.conversation.state.companyName).toBe('Orbit Corrected LLC');
  const unavailable=async()=>new Response('',{status:404});
  await expect(sendWyomingMessage(repo,actors[0],true,{conversationId:started.conversation.id,revision:6,message:'Actividad ficticia: Software QA',clientRequestId:'10000000-0000-4000-8000-000000000010'},{key:'test-key',model:'missing-model',failureMode:'throw',fetcher:unavailable as typeof fetch})).rejects.toMatchObject({code:'MODEL_UNAVAILABLE',message:expect.stringContaining('HTTP 404')});
  expect(await new LocalRepository(db,users[1]).list('agent_conversations')).toEqual([]);expect(await new LocalRepository(db,users[1]).list('agent_conversation_turns')).toEqual([]);
  await expect(repo.atomic([{kind:'insert',table:'agent_conversation_turns',data:{organization_id:actors[1].organizationId,conversation_id:started.conversation.id,turn_kind:'USER_MESSAGE',assistant_message:'cross tenant',model_status:'NOT_APPLICABLE',client_request_id:'10000000-0000-4000-8000-000000000009',created_by:users[1]}}])).rejects.toThrow(/foreign key/);
  expect(await repo.list('formation_cases',{id:created.id})).toEqual([before]);expect(await repo.list('orders')).toHaveLength(0);expect(await repo.list('companies')).toHaveLength(0);
  const events=await repo.list('case_events',{case_id:created.id});expect(events.map(e=>e.event_type)).toEqual(expect.arrayContaining(['AGENT_CONVERSATION_STARTED','AGENT_TURN_COMPLETED']));expect(JSON.stringify(events)).not.toContain('Orbit QA LLC');expect(JSON.stringify(events)).not.toContain('Orbit Corrected LLC');
 }finally{await db.close();}
});

test('hosted mode blocks conversations before any repository access',async()=>{
 const repo={list:async()=>{throw new Error('must not read')},atomic:async()=>{throw new Error('must not write')}} as unknown as LocalRepository;const actor={id:'a',organizationId:'o',role:'customer',displayName:'QA'} as Actor;
 await expect(startWyomingConversation(repo,actor,false,{})).rejects.toMatchObject({code:'AGENT_SANDBOX_ONLY'});
});
