import {test,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import {testDatabase} from './harness';
import {LocalRepository} from '../../packages/persistence';
import {Application,type Actor,type FormationRecord} from '../../packages/application';
import {demoQuestionnaire} from '../../packages/domain';
import {evaluateWyomingPacket} from '../../packages/formation-packet/service';
import {syntheticWyomingIntake,WY_OBSERVED_AT} from '../../packages/formation-packet/catalog';
import {trackCase} from '../../packages/case-tracking';

test('Wyoming packet audit is private, revision bound, metadata only and never changes workflow or payment',async()=>{
 const db=await testDatabase();try{
  await db.exec(await readFile('supabase/seed.sql','utf8'));const service=new LocalRepository(db);const users=['00000000-0000-4000-8000-000000000081','00000000-0000-4000-8000-000000000082'];
  for(const id of users)await db.query('insert into auth.users(id) values($1)',[id]);
  const actors=await Promise.all(users.map(async id=>({id,organizationId:String((await service.list('organization_members',{user_id:id}))[0].organization_id),role:'customer',displayName:'Synthetic'} as Actor)));
  const app=new Application(service,true);const onboarding=await app.onboard(actors[0],demoQuestionnaire,{firstName:'Test',lastName:'Founder',dateOfBirth:'1990-01-01'});
  const wy=await app.createCase(actors[0],onboarding.businessId,'US-WY');const gb=await app.createCase(actors[0],onboarding.businessId,'GB');const initial=await service.list('formation_cases');
  const input={synthetic:true,intake:syntheticWyomingIntake(),caseId:wy.id,caseRevision:0};const now=new Date(WY_OBSERVED_AT);
  await expect(evaluateWyomingPacket(service,actors[1],true,input,now)).rejects.toMatchObject({code:'NOT_FOUND'});
  await expect(evaluateWyomingPacket(service,actors[0],true,{...input,caseRevision:1},now)).rejects.toMatchObject({code:'CONFLICT'});
  await expect(evaluateWyomingPacket(service,actors[0],true,{...input,caseId:gb.id},now)).rejects.toMatchObject({code:'CASE_GUIDE_MISMATCH'});
  const result=await evaluateWyomingPacket(service,actors[0],true,input,now);expect(result.persisted).toBe(true);
  const events=await new LocalRepository(db,users[0]).list('case_events',{case_id:wy.id,event_type:'WY_PACKET_PREPARED'});expect(events).toHaveLength(1);
  const payload=events[0].payload as Record<string,unknown>;expect(payload.packetHash).toBe(result.packet.packetHash);expect(payload.caseRevision).toBe(0);
  expect(JSON.stringify(events)).not.toContain(input.intake.agentStreet);expect(JSON.stringify(events)).not.toContain(input.intake.contactEmail);
  expect(await new LocalRepository(db,users[1]).list('case_events',{case_id:wy.id})).toEqual([]);
  await expect(new LocalRepository(db,users[0]).atomic([{kind:'insert',table:'case_events',data:{case_id:wy.id,event_type:'WY_PACKET_PREPARED'}}])).rejects.toMatchObject({code:'SERVER_ONLY'});
  expect(await service.list('formation_cases')).toEqual(initial);expect(await service.list('orders')).toHaveLength(0);expect(await service.list('companies')).toHaveLength(0);
  const stored=(await service.list<FormationRecord>('formation_cases',{id:wy.id}))[0];
  expect(trackCase(stored,events,now).agent.runStatus).toBe('NOT_STARTED');expect(trackCase(stored,events,now).registrationConfirmed).toBe(false);
  await service.atomic([{kind:'update',table:'formation_cases',where:{id:wy.id,revision:0},data:{status:'CANCELLED',revision:1}}]);
  await expect(evaluateWyomingPacket(service,actors[0],true,{...input,caseRevision:1},now)).rejects.toMatchObject({code:'TERMINAL_CASE'});
 }finally{await db.close();}
});
