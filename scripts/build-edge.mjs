import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
const names=['jurisdiction-recommend','case-create','case-advance','compliance-generate','regulatory-answer','source-monitor','source-ingest','checkout-create','stripe-webhook','notify'];
await mkdir('supabase/functions/_shared',{recursive:true});
await build({entryPoints:['packages/edge/handler.ts'],outfile:'supabase/functions/_shared/engine.js',bundle:true,platform:'node',format:'esm',target:'es2022',external:['@supabase/supabase-js','stripe','zod'],inject:['scripts/edge-globals.ts'],sourcemap:false,banner:{js:'// Generated from packages/edge/handler.ts. Run pnpm edge:build; do not edit.'}});
for(const name of names){await mkdir(`supabase/functions/${name}`,{recursive:true});await writeFile(`supabase/functions/${name}/index.ts`,`import {createEdgeHandler} from '../_shared/engine.js';\nconst handle=createEdgeHandler({env:Deno.env.toObject()});\nDeno.serve((request:Request)=>handle(request,'${name}'));\n`);}
console.log(`Bundled ${names.length} Edge Functions from the shared domain services.`);
