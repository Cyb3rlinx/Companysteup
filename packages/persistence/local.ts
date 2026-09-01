import { PGlite } from '@electric-sql/pglite';
import { readFile,readdir,mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { hashText } from '../regulatory-engine';
import candidates from '../../regulatory/normalized/rule-candidates.json';
export function repositoryRoot(){let root=process.cwd();while(!existsSync(path.join(root,'supabase','config.toml'))){const parent=path.dirname(root);if(parent===root)throw new Error('Repository root not found');root=parent;}return root;}
export const SANDBOX_OPS_ID='00000000-0000-4000-8000-000000000099';
export async function openLocalDatabase(dataDir?:string) {
 const root=repositoryRoot();const dir=dataDir??path.join(root,'.local','postgres');await mkdir(dir,{recursive:true});
 const db=new PGlite(dir);await db.waitReady;
 const found=await db.query<{present:string|null}>("select to_regclass('public.profiles')::text as present");
 if(!found.rows[0].present) {
  await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create schema storage;
  create table auth.users(id uuid primary key default gen_random_uuid(),email text unique,raw_user_meta_data jsonb default '{}',encrypted_password text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  grant usage on schema auth,public,storage to anon,authenticated,service_role;
  grant execute on function auth.uid() to anon,authenticated,service_role;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
  alter table storage.objects enable row level security; grant select on storage.objects to anon,authenticated;
  create table auth.sandbox_sessions(id_hash text primary key,user_id uuid references auth.users(id),expires_at timestamptz not null);
  `);
  for(const file of (await readdir(path.join(root,'supabase/migrations'))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile(path.join(root,'supabase/migrations',file),'utf8'));
  await db.exec(await readFile(path.join(root,'supabase/seed.sql'),'utf8'));
  await db.query("insert into auth.users(id,email,raw_user_meta_data) values($1,'ops@sandbox.invalid',$2)",[SANDBOX_OPS_ID,JSON.stringify({display_name:'Operaciones sandbox'})]);
  await db.query("update profiles set app_role='compliance' where id=$1",[SANDBOX_OPS_ID]);
  // Dedicated local database only: fixtures are synthetic, never a production migration.
  const fixtureAt=process.env.SANDBOX_FIXTURE_TIME||'2026-08-31T00:00:00.000Z';
  const sources=await db.query<{id:string;source_code:string}>('select id,source_code from regulatory_sources');
  for(const s of sources.rows){
   const hash=hashText(`SANDBOX FIXTURE ${s.source_code}`);
   await db.query("update regulatory_sources set last_checked_at=$1,last_success_at=$1,last_content_hash=$2,status='verified',notes='SANDBOX synthetic evidence, not production approval' where id=$3",[fixtureAt,hash,s.id]);
   const snapshot=await db.query<{id:string}>("insert into source_snapshots(source_id,fetched_at,http_status,content_hash,normalized_text_hash,fetch_status,extraction_metadata) values($1,$2,200,$3,$3,'success','{\"sandbox\":true}') returning id",[s.id,fixtureAt,hash]);
   for(const c of candidates.filter(c=>c.source===s.source_code))await db.query("insert into rule_source_evidence(rule_version_id,source_id,snapshot_id,source_locator,evidence_summary) select v.id,$1,$2,$3,$4 from regulatory_rule_versions v join regulatory_rules r on r.id=v.rule_id where r.rule_code=$5",[s.id,snapshot.rows[0].id,c.locator,c.explanation,c.code]);
  }
  // Keep fixtures pending if local clock lies outside their 24-hour verification window.
  if(Date.now()>=Date.parse(fixtureAt)&&Date.now()<Date.parse(fixtureAt)+86400000)await db.query("update regulatory_rule_versions set status='ACTIVE',verified_at=$1,verified_by=$2,confidence='HIGH',published_at=$1",[fixtureAt,SANDBOX_OPS_ID]);
 }
 const migrations=(await readdir(path.join(root,'supabase/migrations'))).filter(f=>f.endsWith('.sql')).sort();
 const tracked=await db.query<{present:string|null}>("select to_regclass('auth.sandbox_migrations')::text as present");
 if(!tracked.rows[0].present){
  await db.exec('create table auth.sandbox_migrations(name text primary key,applied_at timestamptz default now())');
  const alreadyApplied=found.rows[0].present?migrations.filter(f=>f<='202608310004_atomic_operations.sql'):migrations;
  for(const name of alreadyApplied)await db.query('insert into auth.sandbox_migrations(name) values($1)',[name]);
 }
 const applied=await db.query<{name:string}>('select name from auth.sandbox_migrations');
 for(const name of migrations.filter(n=>!applied.rows.some(a=>a.name===n))){await db.exec(await readFile(path.join(root,'supabase/migrations',name),'utf8'));await db.query('insert into auth.sandbox_migrations(name) values($1)',[name]);}
 return db;
}

