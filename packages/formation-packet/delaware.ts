import {createHash} from 'node:crypto';
import {DomainError} from '../domain';
import {DE_FIELDS,DE_OBSERVED_AT,DE_PACKET_VERSION,DE_RECHECK_AFTER,DE_SOURCES,delawareIntakeSchema,type DelawareFieldId} from './delaware-catalog';
import type {PacketBinding} from './wyoming';

type Issue={code:string;field:DelawareFieldId|null;message:string;owner:string};
/** Preparation only. No authority to sign, contact a provider, pay or file. */
export function prepareDelawarePacket(input:unknown,binding:PacketBinding=null,now=new Date()){
 const intake=delawareIntakeSchema.parse(input);const issues:Issue[]=[];
 const add=(code:string,field:DelawareFieldId|null,message:string,owner='Usuario / revisor')=>issues.push({code,field,message,owner});
 for(const field of DE_FIELDS)if(!intake[field.key])add('DATA_MISSING',field.key,`Completar: ${field.label}`,field.owner);
 if(intake.companyName&&!/\b(?:llc|l\.l\.c\.|limited liability company)$/i.test(intake.companyName))add('NAME_DESIGNATOR_REVIEW','companyName','Revisar el designador admitido para una LLC; este chequeo no certifica disponibilidad.');
 if(intake.nameSearch!=='yes')add('NAME_SEARCH_PENDING','nameSearch','Falta documentar una revisión separada del nombre.');
 if(/(?:^\s*p\.?\s*o\.?\s*box\b|post office box|drop\s*box)/i.test(intake.registeredOfficeStreet))add('AGENT_PHYSICAL_ADDRESS_REQUIRED','registeredOfficeStreet','Una casilla o drop box no acredita la oficina física requerida en Delaware.','Agente registrado / revisor');
 if(intake.registeredOfficePostalCode&&!/^\d{5}(?:-\d{4})?$/.test(intake.registeredOfficePostalCode))add('AGENT_POSTAL_FORMAT','registeredOfficePostalCode','Revisar el formato postal. Un formato correcto no verifica el domicilio.');
 if(intake.registeredAgentConsent!=='yes')add('AGENT_CONSENT_PENDING','registeredAgentConsent','El agente debe consentir antes de cualquier presentación.','Agente registrado / revisor');
 if(intake.authorizedPersonRoleReviewed!=='yes')add('AUTHORIZED_PERSON_REVIEW_PENDING','authorizedPersonRoleReviewed','Revisar la autoridad de la persona antes de una firma externa.','Persona autorizada / revisor');
 if(intake.submitterEmail&&!/^[^\s@]+@[^\s@]+\.test$/i.test(intake.submitterEmail))add('SYNTHETIC_EMAIL_REQUIRED','submitterEmail','Usar un correo ficticio con dominio .test; no se enviará ningún mensaje.');
 if(intake.expressReturnRequested==='yes')add('EXPRESS_ACCOUNT_EXTERNAL','expressReturnRequested','La cuenta de mensajería se gestiona solo en un canal autorizado; no se recopila aquí.','Remitente / operaciones');
 const fresh=Number.isFinite(now.getTime())&&now>=new Date(DE_OBSERVED_AT)&&now<new Date(DE_RECHECK_AFTER);
 const einRoute=!fresh?'RECHECK_REQUIRED':intake.einExistingRequest==='yes'?'EXISTING_REQUEST_REVIEW':intake.einExistingRequest!=='no'?'MISSING_INFORMATION':intake.einUsPresence==='no'?'INTERNATIONAL_CHANNEL_REVIEW':intake.einUsPresence!=='yes'||!['yes','no'].includes(intake.einTinAvailable)?'MISSING_INFORMATION':intake.einTinAvailable==='no'?'ALTERNATIVE_CHANNEL_REVIEW':'ONLINE_ELIGIBILITY_REVIEW';
 if(einRoute==='MISSING_INFORMATION')add('EIN_INFORMATION_PENDING','einUsPresence','Completar presencia pertinente, disponibilidad de identificador y solicitudes anteriores; no inferir elegibilidad.','Responsable fiscal / profesional');
 const blockers:Issue[]=[...issues,
  {code:'HUMAN_REVIEW_PENDING',field:null,message:'Fuentes, texto del certificado y expediente pendientes de revisión profesional.',owner:'Revisor profesional'},
  {code:'REGISTERED_AGENT_VERIFICATION_PENDING',field:null,message:'No se verificaron contratación, domicilio ni consentimiento del agente registrado.',owner:'Agente registrado / operaciones'},
  {code:'SIGNATURE_UNVERIFIED',field:null,message:'No se recopiló ni verificó la firma de la persona autorizada.',owner:'Persona autorizada / revisor'},
  {code:'FEE_AND_PAYMENT_REVIEW_PENDING',field:null,message:'El servicio estatal no calcula aquí las tasas y este producto no cobra tasas de presentación.',owner:'Operaciones'},
  {code:'EXTERNAL_FILING_DISABLED',field:null,message:'El portal oficial es un canal de envío; no hay integración ni permiso para presentar.',owner:'Operaciones'},
 ];
 if(!fresh)blockers.push({code:'SOURCE_RECHECK_REQUIRED',field:null,message:'Reconsultar las fuentes antes de usar esta preparación; la ventana interna venció o el reloj es inválido.',owner:'Revisor profesional'});
 if(intake.einExistingRequest==='yes')blockers.push({code:'EIN_DUPLICATE_REQUEST_RISK',field:'einExistingRequest',message:'Conciliar la solicitud o EIN anterior antes de iniciar otra gestión.',owner:'Responsable fiscal / profesional'});
 const sources=DE_SOURCES.map(source=>({...source,observedAt:DE_OBSERVED_AT,recheckAfter:DE_RECHECK_AFTER,effectiveAt:null,approval:'PENDING_REVIEW' as const,observation:fresh?'PUBLIC_OBSERVATION_ONLY' as const:'RECHECK_REQUIRED' as const}));
 const packetHash=createHash('sha256').update(JSON.stringify({version:DE_PACKET_VERSION,intake,binding,sources})).digest('hex');
 return{schemaVersion:1,version:DE_PACKET_VERSION,jurisdiction:'US-DE' as const,mode:'SANDBOX' as const,synthetic:true as const,status:'DRAFT_NOT_FOR_FILING' as const,publication:'PENDING_REVIEW' as const,evaluatedAt:Number.isFinite(now.getTime())?now.toISOString():'INVALID_CLOCK',binding,association:'AUDIT_ONLY_SYNTHETIC_INPUT' as const,packetHash,inputStatus:issues.length?'NEEDS_INFORMATION' as const:'COMPLETE_FOR_INTERNAL_REVIEW' as const,fields:DE_FIELDS.map(field=>({...field,value:intake[field.key],valueStatus:'DECLARED_NOT_VERIFIED' as const})),sources,blockers,routing:{filing:fresh?'DOCUMENT_UPLOAD_REVIEW_REQUIRED':'RECHECK_REQUIRED',ein:einRoute,eligibilityConfirmed:false},reservedActions:['Revisión profesional del Certificate of Formation y materias adicionales','Verificación y consentimiento del agente registrado','Firma de persona autorizada fuera de la plataforma','Cálculo de tasas y autorización de pago','Presentación por actor autorizado','Conciliación con evidencia oficial de aceptación'],partnerChecklist:['Validar identidad, alcance y contrato del agente registrado','Definir quién prepara, firma, presenta y recibe la devolución','Usar canal seguro para firmas, identificadores y cuentas de mensajería','Registrar acuse separado de la evidencia de constitución','Conciliar correcciones antes de reintentar'],filingAdapter:'EXTERNAL_BLOCKED' as const,externalWrites:0,registered:false as const,disclaimer:'Paquete sintético de preparación para revisión interna. No es formulario presentado, firma, asesoría legal, pago, aprobación ni certificado. No ingresar datos personales reales, credenciales, identificadores fiscales ni cuentas de mensajería.'};
}
export type DelawarePacket=ReturnType<typeof prepareDelawarePacket>;
export function simulateDelawarePacketReceipt(packet:DelawarePacket){
 if(packet.schemaVersion!==1||packet.mode!=='SANDBOX'||packet.synthetic!==true||packet.status!=='DRAFT_NOT_FOR_FILING'||packet.registered!==false||packet.filingAdapter!=='EXTERNAL_BLOCKED'||packet.externalWrites!==0||!/^[a-f0-9]{64}$/.test(packet.packetHash))throw new DomainError('INVALID_SANDBOX_ENVELOPE','El sobre no es un paquete sintético de preparación válido');
 return{adapter:'SANDBOX' as const,operation:'VALIDATE_ENVELOPE_ONLY' as const,receiptId:`MOCK-DE-RECEIPT-${packet.packetHash}`,inputStatus:packet.inputStatus,providerAccepted:false,externalWrites:0,registered:false,filingAdapter:'EXTERNAL_BLOCKED' as const};
}
