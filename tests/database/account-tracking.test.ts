import {test,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import {testDatabase} from './harness';
import {LocalRepository} from '../../packages/persistence';
import {Application,type Actor} from '../../packages/application';
import {demoQuestionnaire} from '../../packages/domain';
import {prepareCaseBrief} from '../../packages/case-tracking/service';

test('OAuth-style account metadata cannot grant roles; sorted tracking remains tenant scoped beyond 1000 events',async()=>{
 const db=await testDatabase();
 try{
  await db.exec(await readFile('supabase/seed.sql','utf8'));
  const user='00000000-0000-4000-8000-000000000071';const other='00000000-0000-4000-8000-000000000072';
  await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[user,'oauth-fixture@example.test',JSON.stringify({provider:'google',full_name:'Fiction',app_role:'superadmin',role:'admin',organization_id:'attacker-controlled'})]);
  await db.query('insert into auth.users(id) values($1)',[other]);const service=new LocalRepository(db);const userRepo=new LocalRepository(db,user);const otherRepo=new LocalRepository(db,other);
  expect((await userRepo.list('profiles',{id:user}))[0].app_role).toBe('customer');
  const membership=(await userRepo.list('organization_members',{user_id:user}))[0];expect(membership.organization_id).not.toBe('attacker-controlled');
  const actor:Actor={id:user,organizationId:String(membership.organization_id),role:'customer',displayName:'QA'};const app=new Application(service,true);
  const q=await app.onboard(actor,demoQuestionnaire,{firstName:'Test',lastName:'Founder',dateOfBirth:'1990-01-01'});const c=await app.createCase(actor,q.businessId,'GB');
  await db.query("insert into case_events(organization_id,case_id,event_type,actor_type) select $1,$2,'QA_NOISE','customer' from generate_series(1,1002)",[actor.organizationId,c.id]);
  await prepareCaseBrief(service,actor,{caseId:c.id});
  const latest=await userRepo.list('case_events',{case_id:c.id},{orderBy:'id',descending:true,limit:2});expect(latest.map(e=>e.event_type)).toEqual(['CASE_BRIEF_COMPLETED','CASE_BRIEF_STARTED']);
  expect(await otherRepo.list('case_events',{case_id:c.id},{orderBy:'id',descending:true,limit:100})).toEqual([]);
  await expect(userRepo.list('case_events',{}, {orderBy:'id; drop table profiles',limit:1})).rejects.toThrow();
  await expect(userRepo.list('case_events',{}, {orderBy:'id',limit:1001})).rejects.toThrow();
  await expect(userRepo.atomic([{kind:'insert',table:'case_events',data:{case_id:c.id,event_type:'CASE_BRIEF_COMPLETED'}}])).rejects.toMatchObject({code:'SERVER_ONLY'});
 }finally{await db.close();}
});
