import 'server-only';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {createHash} from 'node:crypto';
import { validateDocument,signDocument,verifyDocumentToken } from '../../../packages/document-engine';
import { DomainError } from '../../../packages/domain';
import { type Actor,type FormationRecord,owned } from '../../../packages/application';
import { repositoryRoot } from '../../../packages/persistence/local';
import { isSandbox,serverRepository,documentSecret } from './runtime';
function storageClient(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});}
export async function uploadDocument(actor:Actor,caseId:string,file:File){
 const repo=await serverRepository();const c=owned((await repo.list<FormationRecord>('formation_cases',{id:caseId}))[0],actor);const bytes=new Uint8Array(await file.arrayBuffer());const validated=validateDocument({name:file.name,type:file.type,bytes});const id=crypto.randomUUID();const storagePath=`${c.organization_id}/${c.id}/${id}`;
 if(isSandbox()){const dir=path.join(repositoryRoot(),'.local','documents',c.organization_id,c.id);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,id),bytes,{flag:'wx'});}
 else{const{error}=await storageClient().storage.from('customer-documents').upload(storagePath,bytes,{contentType:file.type,upsert:false});if(error)throw new DomainError('UPLOAD_FAILED','No se pudo almacenar el documento',502);}
 try{await repo.atomic([{kind:'insert',table:'case_documents',data:{id,organization_id:c.organization_id,case_id:c.id,document_type:'founder_upload',storage_bucket:'customer-documents',storage_path:storagePath,original_filename:validated.filename,mime_type:validated.mimeType,size_bytes:validated.size,sha256:validated.sha256,status:validated.status,uploaded_by:actor.id,metadata:{untrusted:true,sandbox:isSandbox(),malware_scan:'PENDING_MANUAL_REVIEW'}}}]);}catch(error){if(!isSandbox())await storageClient().storage.from('customer-documents').remove([storagePath]);throw error;}
 return{id,status:'quarantined'};
}
export async function signedDocument(actor:Actor,id:string){const doc=owned((await(await serverRepository()).list('case_documents',{id}))[0] as (Record<string,unknown>&{organization_id:string})|undefined,actor);if(doc.status!=='approved' && actor.role==='customer')throw new DomainError('QUARANTINED','El documento está pendiente de revisión',409);
 const token=signDocument(id,actor.organizationId,await documentSecret());return{url:`/api/document-download?token=${encodeURIComponent(token)}`};
}
export async function downloadDocument(actor:Actor,token:string){const id=verifyDocumentToken(token,await documentSecret(),actor.organizationId);const doc=owned((await(await serverRepository()).list('case_documents',{id}))[0] as (Record<string,unknown>&{organization_id:string})|undefined,actor);if(doc.status!=='approved'&&actor.role==='customer')throw new DomainError('QUARANTINED','Documento no disponible',409);let bytes:Uint8Array;
 if(isSandbox()){const base=path.resolve(repositoryRoot(),'.local','documents');const file=path.resolve(base,String(doc.storage_path));if(!file.startsWith(base+path.sep))throw new DomainError('INVALID_PATH','Ruta no autorizada',403);bytes=await readFile(file);}
 else{const{data,error}=await storageClient().storage.from('customer-documents').download(String(doc.storage_path));if(error)throw new DomainError('DOWNLOAD_FAILED','Archivo no disponible',502);bytes=new Uint8Array(await data.arrayBuffer());}
 if(createHash('sha256').update(bytes).digest('hex')!==doc.sha256)throw new DomainError('INTEGRITY_FAILED','El archivo requiere revisión de integridad',409);
 return new Response(new Uint8Array(bytes),{headers:{'Content-Type':String(doc.mime_type),'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(String(doc.original_filename))}`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
