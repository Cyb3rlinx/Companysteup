import { expect,test } from 'vitest';
import { existsSync,readFileSync,readdirSync } from 'node:fs';
import path from 'node:path';

test('Supabase vertical catalog covers every public table and Edge Function exactly as designed',()=>{
 const root=path.resolve(import.meta.dirname,'../..');
 const sql=readFileSync(path.join(root,'supabase','migrations','202608310001_foundation.sql'),'utf8');
 const migrationTables=[...sql.matchAll(/create table public\.([a-z_]+)/g)].map(match=>match[1]);
 const manifest=JSON.parse(readFileSync(path.join(root,'supabase','verticals.json'),'utf8')) as {environments:{code:string}[];verticals:{tables:string[];functions?:string[]}[]};
 const mappedTables=manifest.verticals.flatMap(vertical=>vertical.tables);
 expect(new Set(mappedTables).size).toBe(mappedTables.length);
 expect([...mappedTables].sort()).toEqual([...migrationTables].sort());
 expect(manifest.verticals).toHaveLength(13);
 expect(manifest.environments.map(environment=>environment.code)).toEqual(['local','staging','pilot','production']);
 const functionsRoot=path.join(root,'supabase','functions');
 const deployedFunctions=readdirSync(functionsRoot,{withFileTypes:true}).filter(entry=>entry.isDirectory()&&existsSync(path.join(functionsRoot,entry.name,'index.ts'))).map(entry=>entry.name).sort();
 const mappedFunctions=[...new Set(manifest.verticals.flatMap(vertical=>vertical.functions??[]))].sort();
 expect(mappedFunctions).toEqual(deployedFunctions);
});
