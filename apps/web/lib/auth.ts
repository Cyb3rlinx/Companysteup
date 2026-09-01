import 'server-only';
import { randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';
import { DomainError,type Role } from '../../../packages/domain';
import type { Actor } from '../../../packages/application';
import { LocalRepository,SupabaseRepository,type Repository } from '../../../packages/persistence';
import { SANDBOX_OPS_ID } from '../../../packages/persistence/local';
import { isSandbox,localDb,serverRepository,appOrigin } from './runtime';
const scrypt=promisify(scryptCallback);
const cookieName='company_os_session';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export const credentialsSchema=z.object({email:z.email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(12).max(128),displayName:z.string().trim().min(1).max(100).optional()});
export async function supabaseAuth(){const store=await cookies();const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new DomainError('EXTERNAL_BLOCKED','Configura Supabase Auth',503);return createServerClient(url,key,{cookieOptions:{httpOnly:true,secure:appOrigin().startsWith('https://'),sameSite:'lax'},cookies:{getAll:()=>store.getAll(),setAll:items=>{try{for(const item of items)store.set(item.name,item.value,item.options);}catch{/* Server Components cannot write cookies; proxy refreshes them. */}}}});}
export async function createSandboxSession(userId:string){
 const token=randomBytes(32).toString('base64url');const db=await localDb();const store=await cookies();const previous=store.get(cookieName)?.value;
 if(previous)await db.query('delete from auth.sandbox_sessions where id_hash=$1',[hash(previous)]);
 await db.query("insert into auth.sandbox_sessions(id_hash,user_id,expires_at) values($1,$2,now()+interval '8 hours')",[hash(token),userId]);
 store.set(cookieName,token,{httpOnly:true,sameSite:'strict',secure:false,path:'/',maxAge:28800});
}
export async function signup(input:unknown){const values=credentialsSchema.parse(input);
 if(!isSandbox()){const client=await supabaseAuth();const {data,error}=await client.auth.signUp({email:values.email,password:values.password,options:{emailRedirectTo:appOrigin()+'/auth/callback',data:{display_name:values.displayName||'Fundador'}}});if(error)throw new DomainError('SIGNUP_FAILED','No se pudo crear la cuenta. Revisa los datos o intenta iniciar sesión.');return {confirmationRequired:!data.session};}
 const db=await localDb();const salt=randomBytes(16).toString('hex');const derived=await scrypt(values.password,salt,64) as Buffer;const id=crypto.randomUUID();
 try{await db.query('insert into auth.users(id,email,encrypted_password,raw_user_meta_data) values($1,$2,$3,$4)',[id,values.email,`${salt}:${derived.toString('hex')}`,JSON.stringify({display_name:values.displayName||'Fundador'})]);}catch{throw new DomainError('SIGNUP_FAILED','No se pudo crear la cuenta. Revisa los datos o intenta iniciar sesión.');}
 await createSandboxSession(id);return {confirmationRequired:false};
}
export async function login(input:unknown){const values=credentialsSchema.parse(input);
 if(!isSandbox()){const{error}=await(await supabaseAuth()).auth.signInWithPassword({email:values.email,password:values.password});if(error)throw new DomainError('LOGIN_FAILED','Correo o contraseña incorrectos',401);return;}
 const db=await localDb();const r=await db.query<{id:string;encrypted_password:string}>('select id,encrypted_password from auth.users where email=$1',[values.email]);const row=r.rows[0];const[salt,stored]=row?.encrypted_password?.split(':')??['dummy-salt','0'.repeat(128)];const supplied=await scrypt(values.password,salt,64) as Buffer;const expected=Buffer.from(stored,'hex');if(!row||expected.length!==supplied.length||!timingSafeEqual(expected,supplied))throw new DomainError('LOGIN_FAILED','Correo o contraseña incorrectos',401);await createSandboxSession(row.id);
}
export async function getActor():Promise<Actor|null>{let id:string|undefined;
 if(isSandbox()){const token=(await cookies()).get(cookieName)?.value;if(!token)return null;const r=await(await localDb()).query<{user_id:string}>('select user_id from auth.sandbox_sessions where id_hash=$1 and expires_at>now()',[hash(token)]);id=r.rows[0]?.user_id;}
 else {const{data,error}=await(await supabaseAuth()).auth.getUser();if(error||!data.user)return null;id=data.user.id;}
 if(!id)return null;const repo=await serverRepository();const profile=(await repo.list('profiles',{id}))[0];const membership=(await repo.list('organization_members',{user_id:id,status:'active'}))[0];if(!profile||!membership)return null;return{id,organizationId:String(membership.organization_id),role:profile.app_role as Role,displayName:String(profile.display_name||'Fundador')};
}
export async function requireActor(){const actor=await getActor();if(!actor)throw new DomainError('UNAUTHORIZED','Inicia sesión para continuar',401);return actor;}
export async function userRepository(actor:Actor):Promise<Repository>{return isSandbox()?new LocalRepository(await localDb(),actor.id):new SupabaseRepository(await supabaseAuth());}
export async function logout(){if(isSandbox()){const token=(await cookies()).get(cookieName)?.value;if(token)await(await localDb()).query('delete from auth.sandbox_sessions where id_hash=$1',[hash(token)]);(await cookies()).delete(cookieName);}else await(await supabaseAuth()).auth.signOut();}
export async function sandboxOps(){if(!isSandbox())throw new DomainError('NOT_FOUND','No disponible',404);await localDb();await createSandboxSession(SANDBOX_OPS_ID);}
