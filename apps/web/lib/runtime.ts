import 'server-only';
import { randomBytes } from 'node:crypto';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { LocalRepository,supabaseRepository,type Repository } from '../../../packages/persistence';
import { openLocalDatabase,repositoryRoot } from '../../../packages/persistence/local';
import { Application } from '../../../packages/application';
import { DomainError } from '../../../packages/domain';
export function isSandbox(){return process.env.APP_MODE==='sandbox'||(process.env.APP_MODE===undefined&&process.env.NODE_ENV==='development');}
export function appOrigin(){return process.env.APP_ORIGIN||'http://localhost:3000';}
const globalState=globalThis as typeof globalThis & {companyOsDb?:Promise<PGlite>};
export async function localDb(){if(!isSandbox())throw new Error('Local database disabled outside sandbox');return globalState.companyOsDb??=openLocalDatabase(process.env.SANDBOX_DATA_DIR);}
export async function serverRepository():Promise<Repository>{
 if(isSandbox())return new LocalRepository(await localDb());
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new DomainError('EXTERNAL_BLOCKED','Configura Supabase para operación fuera del sandbox',503);
 return supabaseRepository(url,key);
}
export async function application(){return new Application(await serverRepository(),isSandbox());}
export async function documentSecret(){
 if(!isSandbox()){if(!process.env.DOCUMENT_SIGNING_SECRET)throw new DomainError('EXTERNAL_BLOCKED','Falta configuración de enlaces privados',503);return process.env.DOCUMENT_SIGNING_SECRET;}
 const dir=path.join(repositoryRoot(),'.local');await mkdir(dir,{recursive:true});const file=path.join(dir,'document-signing.key');
 try{return await readFile(file,'utf8');}catch {const secret=randomBytes(32).toString('hex');try{await writeFile(file,secret,{flag:'wx'});return secret;}catch{return readFile(file,'utf8');}}
}
