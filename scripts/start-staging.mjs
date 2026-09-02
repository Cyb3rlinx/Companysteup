// Local-only frontend connected to the explicitly authorized synthetic staging.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = async p => JSON.parse(await readFile(path.join(root,p),'utf8'));
const target = await read('supabase/environments/staging.json');
const keys = await read('.local/staging/credentials.json');
if (target.environment !== 'staging' || target.dataPolicy !== 'synthetic-only' ||
    target.projectRef !== 'keboldglfjonxcdnmyee' || keys.projectRef !== target.projectRef ||
    keys.url !== `https://${target.projectRef}.supabase.co`) throw new Error('Staging target mismatch');
await mkdir(path.join(root,'.local/staging'),{recursive:true});
const secretFile=path.join(root,'.local/staging/server.json');
let local;
try {local=JSON.parse(await readFile(secretFile,'utf8'));}
catch(e) {if(e.code!=='ENOENT')throw e;local={documentSigningSecret:randomBytes(32).toString('hex')};await writeFile(secretFile,JSON.stringify(local),{flag:'wx',mode:0o600});}
if(typeof local.documentSigningSecret!=='string'||local.documentSigningSecret.length<64)throw new Error('Invalid document signing secret');
const env={...process.env,APP_MODE:'supabase',APP_ORIGIN:'http://127.0.0.1:3100',
 NEXT_PUBLIC_SUPABASE_URL:keys.url,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:keys.publishableKey,
 SUPABASE_SERVICE_ROLE_KEY:keys.serviceRoleKey,DOCUMENT_SIGNING_SECRET:local.documentSigningSecret,
 STRIPE_SECRET_KEY:'',STRIPE_WEBHOOK_SECRET:'',STRIPE_COMPLIANCE_PRICE_ID:'',
 OPENAI_API_KEY:'',OPENAI_MODEL:'',SOURCE_MONITOR_SECRET:'',AUTOMATION_USER_ID:'',
 EMAIL_PROVIDER_API_KEY:'',KYC_PROVIDER_SECRET:'',COMPANIES_HOUSE_API_KEY:'',
 DELAWARE_PARTNER_API_KEY:'',WYOMING_PARTNER_API_KEY:'',ESTONIA_PARTNER_API_KEY:'',UK_ACSP_PARTNER_API_KEY:''};
const child=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start',path.join(root,'apps/web'),'--hostname','127.0.0.1','--port','3100'],{cwd:root,env,stdio:'inherit',windowsHide:true});
child.on('exit',code=>{process.exitCode=code??1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
