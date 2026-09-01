import 'server-only';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {SupabaseRepository} from '../../../packages/persistence';
import {repositoryRoot} from '../../../packages/persistence/local';
import type {SnapshotStorage} from '../../../packages/regulatory-engine/service';
import {isSandbox,serverRepository} from './runtime';
export async function snapshotStorage():Promise<SnapshotStorage>{
 const repo=await serverRepository();
 const safe=(key:string)=>{if(!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.json$/.test(key))throw new Error('Invalid snapshot path');return key;};
 if(isSandbox())return{async put(key,content){const file=path.join(repositoryRoot(),'.local','official-snapshots',safe(key));await mkdir(path.dirname(file),{recursive:true});await writeFile(file,content,{flag:'wx'});},async get(key){return readFile(path.join(repositoryRoot(),'.local','official-snapshots',safe(key)),'utf8');}};
 const bucket=(repo as SupabaseRepository).client.storage.from('regulatory-snapshots');return{async put(key,content){const{error}=await bucket.upload(safe(key),content,{contentType:'application/json',upsert:false});if(error)throw new Error('Snapshot storage failed');},async get(key){const{data,error}=await bucket.download(safe(key));if(error)throw new Error('Snapshot unavailable');return data.text();}};
}
