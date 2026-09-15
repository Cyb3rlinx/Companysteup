import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {hostedGoogleReadiness} from '../packages/authentication/hosted-readiness';

type Target = {environment?:unknown;dataPolicy?:unknown;projectRef?:unknown};
type Credentials = {projectRef?:unknown;url?:unknown;publishableKey?:unknown};
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const requireReady=args.includes('--require-ready');
const readJson=async<T>(relative:string)=>JSON.parse(await readFile(path.join(root,relative),'utf8')) as T;

async function main(){try{
 if(args.some(arg=>arg!=='--require-ready'))throw new Error('Unsupported argument');
 const target=await readJson<Target>('supabase/environments/staging.json');
 const credentials=await readJson<Credentials>('.local/staging/credentials.json');
 if(target.environment!=='staging'||target.dataPolicy!=='synthetic-only'||typeof target.projectRef!=='string'||
    credentials.projectRef!==target.projectRef||typeof credentials.url!=='string'||
    credentials.url!==`https://${target.projectRef}.supabase.co`||typeof credentials.publishableKey!=='string'||credentials.publishableKey.length<20)throw new Error('STAGING_TARGET_MISMATCH');
 const endpoint=new URL('/auth/v1/settings',credentials.url);
 const response=await fetch(endpoint,{headers:{apikey:credentials.publishableKey},redirect:'error',signal:AbortSignal.timeout(15_000)});
 const body=await response.text();
 if(!response.ok||body.length>65_536)throw new Error('AUTH_SETTINGS_UNAVAILABLE');
 const readiness=hostedGoogleReadiness(JSON.parse(body));
 const result={
  checkedAt:new Date().toISOString(),
  projectRef:target.projectRef,
  environment:'staging',
  dataPolicy:'synthetic-only',
  ...readiness,
  googleRedirectUri:`https://${target.projectRef}.supabase.co/auth/v1/callback`,
 };
 const reportDirectory=path.join(root,'.local','qa');
 await mkdir(reportDirectory,{recursive:true});
 await writeFile(path.join(reportDirectory,'google-auth-readiness.json'),`${JSON.stringify(result,null,2)}\n`,'utf8');
 console.log(JSON.stringify(result,null,2));
 if(requireReady&&readiness.status!=='READY_FOR_FLOW_TEST'){
  console.error('EXTERNAL_BLOCKED: Habilita Google y conserva el registro disponible antes de probar el flujo.');
  process.exitCode=1;
 }
}catch(error){
 const code=error instanceof Error&&['STAGING_TARGET_MISMATCH','AUTH_SETTINGS_UNAVAILABLE','Unsupported argument'].includes(error.message)?error.message:'GOOGLE_AUTH_STATUS_UNAVAILABLE';
 console.error(`GOOGLE_AUTH_READINESS_FAILED: ${code}`);
 process.exitCode=1;
}}
void main();
