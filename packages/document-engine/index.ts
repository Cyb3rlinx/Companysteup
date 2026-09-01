import { createHmac,timingSafeEqual,createHash } from 'node:crypto';
import { DomainError,type Jurisdiction,type Questionnaire } from '../domain';
export const MAX_DOCUMENT_BYTES=10485760;
export function validateDocument(file:{name:string;type:string;bytes:Uint8Array}) {
 if(file.bytes.length===0||file.bytes.length>MAX_DOCUMENT_BYTES)throw new DomainError('FILE_SIZE','El documento debe pesar entre 1 byte y 10 MB');
 const name=file.name.replace(/[\x00-\x1f<>:"/\\|?*]/g,'_').slice(0,160);
 const b=file.bytes;let type:string|null=null;
 if(Buffer.from(b.slice(0,5)).toString()==='%PDF-')type='application/pdf';
 if(b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47&&b[4]===0x0d&&b[5]===0x0a&&b[6]===0x1a&&b[7]===0x0a)type='image/png';
 if(b[0]===0xff&&b[1]===0xd8&&b[2]===0xff)type='image/jpeg';
 if(!type||type!==file.type)throw new DomainError('FILE_TYPE','Solo PDF, PNG y JPEG con contenido y tipo coincidentes');
 if(type==='application/pdf'&&/\/JavaScript|\/JS\b|\/Launch|\/EmbeddedFile/i.test(Buffer.from(b).toString('latin1')))throw new DomainError('ACTIVE_CONTENT','El PDF contiene contenido activo o archivos adjuntos');
 return {filename:name,mimeType:type,sha256:createHash('sha256').update(b).digest('hex'),size:b.length,status:'quarantined' as const};
}
export function signDocument(documentId:string,organizationId:string,secret:string,expiresAt=Date.now()+60000){const payload=Buffer.from(JSON.stringify({documentId,organizationId,expiresAt})).toString('base64url');return `${payload}.${createHmac('sha256',secret).update(payload).digest('base64url')}`;}
export function verifyDocumentToken(token:string,secret:string,organizationId:string,at=Date.now()):string {
 const[payload,signature,...extra]=token.split('.');if(!payload||!signature||extra.length)throw new DomainError('INVALID_TOKEN','Enlace inválido',403);
 const expected=createHmac('sha256',secret).update(payload).digest();const got=Buffer.from(signature,'base64url');if(got.length!==expected.length||!timingSafeEqual(got,expected))throw new DomainError('INVALID_TOKEN','Enlace inválido',403);
 const decoded=JSON.parse(Buffer.from(payload,'base64url').toString()) as {documentId:string;organizationId:string;expiresAt:number};
 if(decoded.organizationId!==organizationId||decoded.expiresAt<=at||decoded.expiresAt>at+300000)throw new DomainError('EXPIRED_TOKEN','Enlace vencido o no autorizado',403);return decoded.documentId;
}
export function prepareFormationDocument(jurisdiction:Jurisdiction,q:Questionnaire) {
 return {schemaVersion:1,status:'DRAFT_NOT_FOR_FILING',jurisdiction,title:'Paquete de información para revisión',proposedName:q.proposedName,activity:q.activity,founderCount:q.founderCount,ownershipPercent:q.ownershipPercent,operatingCountries:q.operatingCountries,missing:['Domicilio legal verificado','Datos completos y consentimiento de todos los titulares','Firmas y revisión profesional','Confirmación de disponibilidad de nombre'],disclaimer:'Borrador de preparación. No es un certificado, solicitud presentada, asesoría legal ni aprobación gubernamental.'};
}
