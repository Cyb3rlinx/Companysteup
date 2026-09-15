import {createHash} from 'node:crypto';
import {DomainError} from '../domain';
import {UK_FIELDS,UK_OBSERVED_AT,UK_PACKET_VERSION,UK_RECHECK_AFTER,UK_SOURCES,ukIntakeSchema,type UkFieldId} from './uk-catalog';
import type {PacketBinding} from './wyoming';

type Issue={code:string;field:UkFieldId|null;message:string;owner:string};
/** Preparation only. No authority to identify, sign, charge, act as ACSP or file. */
export function prepareUkPacket(input:unknown,binding:PacketBinding=null,now=new Date()){
 const intake=ukIntakeSchema.parse(input);const issues:Issue[]=[];
 const add=(code:string,field:UkFieldId|null,message:string,owner='Usuario / revisor')=>issues.push({code,field,message,owner});
 for(const field of UK_FIELDS)if(!intake[field.key])add('DATA_MISSING',field.key,`Completar: ${field.label}`,field.owner);
 if(intake.companyName&&!/(?:\bLtd\.?|\bLimited)$/iu.test(intake.companyName))add('NAME_FORM_REVIEW','companyName','Revisar que el nombre use una terminación admitida para la ruta Ltd; no certifica disponibilidad.');
 if(intake.nameSearch!=='yes')add('NAME_SEARCH_PENDING','nameSearch','Falta documentar la consulta informativa del registro y de marcas.');
 if(intake.registeredEmail&&!/^[^\s@]+@[^\s@]+\.test$/i.test(intake.registeredEmail))add('SYNTHETIC_EMAIL_REQUIRED','registeredEmail','Usar un correo ficticio con dominio .test; no se enviará ningún mensaje.');
 if(intake.registeredNation&&!/^(?:England and Wales|Wales|Scotland|Northern Ireland)$/i.test(intake.registeredNation))add('REGISTERED_NATION_REVIEW','registeredNation','La nación propuesta no coincide con una opción de esta ruta; requiere revisión.');
 if(intake.registeredOfficeAppropriate!=='yes')add('REGISTERED_OFFICE_REVIEW','registeredOfficeAppropriate','Confirmar un domicilio apropiado, autorizado y en la nación de registro.','Usuario / proveedor');
 const directors=Number(intake.directorCount);if(intake.directorCount&&(!Number.isInteger(directors)||directors<1))add('DIRECTOR_COUNT_INVALID','directorCount','La cantidad de directores debe ser un entero positivo.');
 if(intake.directorsEligible!=='yes')add('DIRECTOR_ELIGIBILITY_REVIEW','directorsEligible','La elegibilidad declarada de cada director requiere revisión.','Cada director / revisor');
 if(intake.directorsIdentityVerified!=='yes')add('DIRECTOR_IDENTITY_PENDING','directorsIdentityVerified','Cada director debe completar la ruta oficial de identidad aplicable.','Cada director / Companies House o ACSP');
 const shareholders=Number(intake.shareholderCount);if(intake.shareholderCount&&(!Number.isInteger(shareholders)||shareholders<1))add('SHAREHOLDER_COUNT_INVALID','shareholderCount','La cantidad de accionistas debe ser un entero positivo.');
 if(intake.pscIdentityLinked!=='yes')add('PSC_ROLE_LINK_PENDING','pscIdentityLinked','La verificación y vinculación del rol PSC se controla por separado.','Cada PSC / Companies House o ACSP');
 if(/custom|personalizad/i.test(intake.articlesChoice))add('CUSTOM_ARTICLES_REVIEW','articlesChoice','Los estatutos personalizados requieren revisión profesional antes de cualquier firma.','Accionistas / revisor profesional');
 if(intake.memorandumReadiness!=='yes')add('MEMORANDUM_PENDING','memorandumReadiness','Revisar cómo se generará o preparará el memorandum en la ruta elegida.');
 if(intake.lawfulPurposeConfirmed!=='yes')add('LAWFUL_PURPOSE_DECLARATION_PENDING','lawfulPurposeConfirmed','La declaración sobre propósito lícito permanece pendiente del solicitante.');
 if(intake.feeReadiness!=='yes')add('FEE_READINESS_PENDING','feeReadiness','La tasa y su pago permanecen pendientes fuera de la plataforma.');
 const fresh=Number.isFinite(now.getTime())&&now>=new Date(UK_OBSERVED_AT)&&now<new Date(UK_RECHECK_AFTER);
 const filingRoute=!fresh?'RECHECK_REQUIRED':/\b(?:acsp|agent|agente|proveedor)\b/i.test(intake.filingRoute)?'ACSP_ROUTE_REVIEW':/\b(?:self|auto|usuario|official|oficial)\b/i.test(intake.filingRoute)?'CUSTOMER_SELF_FILING_REVIEW':'FILING_ROUTE_REVIEW';
 const blockers:Issue[]=[...issues,
  {code:'HUMAN_REVIEW_PENDING',field:null,message:'Fuentes, nombre, SIC, estructura, PSC, documentos y declaraciones requieren revisión humana.',owner:'Revisor profesional'},
  {code:'IDENTITY_VERIFICATION_EXTERNAL',field:null,message:'La plataforma no recopila ni verifica documentos, biometría o códigos personales de Companies House.',owner:'Cada director o PSC / Companies House o ACSP'},
  {code:'REGISTERED_OFFICE_EVIDENCE_PENDING',field:null,message:'No se verificaron permiso, servicio, entrega postal ni coincidencia de nación del domicilio.',owner:'Usuario / proveedor'},
  {code:'SIGNATURE_AND_DECLARATIONS_UNVERIFIED',field:null,message:'Memorandum, estatutos, consentimientos y declaraciones permanecen bajo control de los firmantes.',owner:'Solicitantes / firmantes'},
  {code:'PAYMENT_UNVERIFIED',field:null,message:'No se calculó, cobró ni acreditó la tasa de Companies House.',owner:'Usuario / autoridad'},
  {code:'EXTERNAL_FILING_DISABLED',field:null,message:'No existe una integración autorizada para presentar ni consultar una decisión de Companies House.',owner:'Operaciones / autoridad'},
  {code:'ACSP_AUTHORIZATION_UNVERIFIED',field:null,message:'La plataforma no está habilitada como ACSP y no puede verificar identidades ni actuar con facultades reguladas.',owner:'Operaciones / proveedor autorizado'},
 ];
 if(!fresh)blockers.push({code:'SOURCE_RECHECK_REQUIRED',field:null,message:'Reconsultar las fuentes antes de usar esta preparación; la ventana interna venció o el reloj es inválido.',owner:'Revisor profesional'});
 const sources=UK_SOURCES.map(source=>({...source,observedAt:UK_OBSERVED_AT,recheckAfter:UK_RECHECK_AFTER,effectiveAt:null,approval:'PENDING_REVIEW' as const,observation:fresh?'PUBLIC_OBSERVATION_ONLY' as const:'RECHECK_REQUIRED' as const}));
 const packetHash=createHash('sha256').update(JSON.stringify({version:UK_PACKET_VERSION,intake,binding,sources})).digest('hex');
 return{schemaVersion:1,version:UK_PACKET_VERSION,jurisdiction:'GB' as const,mode:'SANDBOX' as const,synthetic:true as const,status:'DRAFT_NOT_FOR_FILING' as const,publication:'PENDING_REVIEW' as const,evaluatedAt:Number.isFinite(now.getTime())?now.toISOString():'INVALID_CLOCK',binding,association:'AUDIT_ONLY_SYNTHETIC_INPUT' as const,packetHash,inputStatus:issues.length?'NEEDS_INFORMATION' as const:'COMPLETE_FOR_INTERNAL_REVIEW' as const,fields:UK_FIELDS.map(field=>({...field,value:intake[field.key],valueStatus:'DECLARED_NOT_VERIFIED' as const})),sources,blockers,routing:{formation:filingRoute,identity:'COMPANIES_HOUSE_OR_VERIFIED_ACSP_REQUIRED',registeredOffice:'PROVIDER_EVIDENCE_REVIEW',eligibilityConfirmed:false},reservedActions:['Revisión humana de nombre, SIC, estructura accionaria, PSC y documentos','Verificación de identidad de cada director y PSC por una ruta oficial','Custodia y uso de códigos personales exclusivamente en el servicio autorizado','Validación contractual y operativa del domicilio registrado','Consentimientos, memorandum, estatutos, declaraciones y firmas','Cálculo y pago de la tasa ante Companies House','Presentación por el usuario o un agente autorizado y decisión del registrador'],partnerChecklist:['Comprobar el estado ACSP y la supervisión AML antes de delegar una función regulada','Confirmar el alcance contractual: domicilio, identidad, preparación o presentación son servicios distintos','Usar un canal seguro para identidad, fechas de nacimiento, domicilios residenciales, códigos y credenciales','Revisar por separado cada vínculo de director y PSC','Conciliar pago, acuse y certificado de incorporación con evidencia oficial'],filingAdapter:'EXTERNAL_BLOCKED' as const,identityAdapter:'EXTERNAL_BLOCKED' as const,externalWrites:0,registered:false as const,disclaimer:'Paquete sintético para revisión interna. No es presentación, verificación de identidad, firma, asesoría legal o fiscal, pago, aprobación ni certificado. No ingresar datos personales reales, códigos de Companies House, credenciales ni datos bancarios.'};
}
export type UkPacket=ReturnType<typeof prepareUkPacket>;
export function simulateUkPacketReceipt(packet:UkPacket){
 if(packet.schemaVersion!==1||packet.mode!=='SANDBOX'||packet.synthetic!==true||packet.status!=='DRAFT_NOT_FOR_FILING'||packet.registered!==false||packet.filingAdapter!=='EXTERNAL_BLOCKED'||packet.identityAdapter!=='EXTERNAL_BLOCKED'||packet.externalWrites!==0||!/^[a-f0-9]{64}$/.test(packet.packetHash))throw new DomainError('INVALID_SANDBOX_ENVELOPE','El sobre no es un paquete UK sintético de preparación válido');
 return{adapter:'SANDBOX' as const,operation:'VALIDATE_ENVELOPE_ONLY' as const,receiptId:`MOCK-UK-RECEIPT-${packet.packetHash}`,inputStatus:packet.inputStatus,providerAccepted:false,externalWrites:0,registered:false,filingAdapter:'EXTERNAL_BLOCKED' as const,identityAdapter:'EXTERNAL_BLOCKED' as const};
}
