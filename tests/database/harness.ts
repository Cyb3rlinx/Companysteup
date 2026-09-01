import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
export const bootstrapSql = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create schema storage;
create table auth.users(id uuid primary key default gen_random_uuid(), email text unique, raw_user_meta_data jsonb default '{}', encrypted_password text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth,public,storage to anon,authenticated,service_role;
grant execute on function auth.uid() to anon,authenticated,service_role;
create table storage.buckets(id text primary key,name text,public boolean default false,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
alter table storage.objects enable row level security;
grant select on storage.objects to anon,authenticated;
grant all on storage.objects,storage.buckets to service_role;
`;
export async function testDatabase() {
 const db=new PGlite();await db.exec(bootstrapSql);
 const migrations=await readdir('supabase/migrations');
 for(const file of migrations.filter(f=>f.endsWith('.sql')).sort()) await db.exec(await readFile(path.join('supabase/migrations',file),'utf8'));
 return db;
}
export async function asUser<T>(db:PGlite,id:string,fn:(tx:Pick<PGlite,'query'|'exec'>)=>Promise<T>) {
 return db.transaction(async tx=>{await tx.exec('set local role authenticated');await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[id]);return fn(tx);});
}
