import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PGlite } from '@electric-sql/pglite';
import { DomainError } from '../domain';
import tables from '../../docs/schema-catalog.json';
export type Row=Record<string,unknown>;
export type Operation={kind:'insert'|'update';table:string;data:Row;where?:Row};
export interface Repository {
 list<T extends Row=Row>(table:string,where?:Row):Promise<T[]>;
 atomic(operations:Operation[]):Promise<Row[]>;
 rateLimit(key:string,max:number,seconds:number):Promise<boolean>;
}
function tableName(table:string) {if(!tables.includes(table))throw new DomainError('INVALID_TABLE','Tabla no autorizada');return table;}
function identifier(value:string){if(!/^[a-z_][a-z0-9_]*$/.test(value))throw new Error('Invalid identifier');return `"${value}"`;}
export class LocalRepository implements Repository {
 constructor(public db:PGlite,private userId?:string){}
 async list<T extends Row=Row>(table:string,where:Row={}):Promise<T[]> {
  tableName(table);const keys=Object.keys(where);const query=`select * from public.${identifier(table)}${keys.length?' where '+keys.map((k,i)=>`${identifier(k)}=$${i+1}`).join(' and '):''} limit 1000`;
  const run=async(tx:Pick<PGlite,'query'|'exec'>):Promise<T[]>=>JSON.parse(JSON.stringify((await tx.query<T>(query,Object.values(where))).rows,(_key,value)=>typeof value==='bigint'?value.toString():value)) as T[];
  if(!this.userId)return run(this.db);
  return this.db.transaction(async tx=>{await tx.exec('set local role authenticated');await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[this.userId]);return run(tx);});
 }
 async atomic(ops:Operation[]) {
  if(this.userId)throw new DomainError('SERVER_ONLY','Las mutaciones requieren servicio autorizado',403);
  const r=await this.db.query<{result:Row[]}>('select public.apply_operations($1::jsonb) as result',[JSON.stringify(ops)]);return r.rows[0].result;
 }
 async rateLimit(key:string,max:number,seconds:number){const r=await this.db.query<{allowed:boolean}>('select public.take_rate_limit($1,$2,$3) as allowed',[key,max,seconds]);return r.rows[0].allowed;}
}
export class SupabaseRepository implements Repository {
 constructor(public client:SupabaseClient){}
 async list<T extends Row=Row>(table:string,where:Row={}):Promise<T[]>{let query=this.client.from(tableName(table)).select('*');for(const [k,v]of Object.entries(where))query=v===null?query.is(k,null):query.eq(k,v);const{data,error}=await query.limit(1000);if(error)throw new DomainError('DB_ERROR','No se pudo consultar el recurso',500);return data as T[];}
 async atomic(ops:Operation[]){const{data,error}=await this.client.rpc('apply_operations',{operations:ops});if(error)throw new DomainError(error.code==='40001'?'CONFLICT':'DB_ERROR',error.code==='40001'?'El recurso cambió; vuelve a cargar':'No se pudo guardar la operación',error.code==='40001'?409:500);return data as Row[];}
 async rateLimit(key:string,max:number,seconds:number){const{data,error}=await this.client.rpc('take_rate_limit',{bucket:key,max_requests:max,seconds});if(error)throw new Error('Rate limit unavailable');return data===true;}
}
export function supabaseRepository(url:string,key:string,token?:string){return new SupabaseRepository(createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:token?{headers:{Authorization:`Bearer ${token}`}}:undefined}));}
