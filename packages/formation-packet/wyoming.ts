import {createHash} from 'node:crypto';
import {DomainError} from '../domain';
import {WY_FIELDS,WY_PACKET_VERSION,WY_SOURCES,WY_OBSERVED_AT,WY_RECHECK_AFTER,wyomingIntakeSchema,type WyomingFieldId} from './catalog';

type Issue={code:string;field:WyomingFieldId|null;message:string;owner:string};
export type PacketBinding={caseId:string;revision:number}|null;
/** Preparation only. No authority to sign, contact a provider, pay or file. */
export function prepareWyomingPacket(input:unknown,binding:PacketBinding=null,now=new Date()){
  const intake=wyomingIntakeSchema.parse(input);
  const issues:Issue[]=[];
  const add=(code:string,field:WyomingFieldId|null,message:string,owner='Usuario / revisor')=>issues.push({code,field,message,owner});
  for(const field of WY_FIELDS)if(!intake[field.key])add('DATA_MISSING',field.key,`Completar: ${field.label}`,field.owner);
  if(intake.entityVariant&&intake.entityVariant!=='ordinary')add('SPECIALIZED_ROUTE_REQUIRED','entityVariant','Este paquete solo ensaya LLC ordinaria. La modalidad elegida requiere otro expediente y revisión especializada.','Revisor profesional');
  if(intake.companyName&&!/\b(?:llc|l\.l\.c\.|limited liability company|limited company|lc|l\.c\.|ltd\. liability company|ltd\. liability co\.|limited liability co\.)$/i.test(intake.companyName))add('NAME_DESIGNATOR_REVIEW','companyName','Revisar la denominación LLC admitida; el chequeo no certifica disponibilidad.');
  if(intake.nameSearch!=='yes')add('NAME_SEARCH_PENDING','nameSearch','Revisar búsqueda de nombre y resultado documentado.');
  if(intake.agentState&&intake.agentState.toUpperCase()!=='WY')add('AGENT_ADDRESS_OUTSIDE_WY','agentState','El domicilio declarado no está identificado como Wyoming.','Agente registrado / revisor');
  if(/(?:^\s*p\.?\s*o\.?\s*box\b|post office box|drop\s*box)/i.test(intake.agentStreet))add('AGENT_PHYSICAL_ADDRESS_REQUIRED','agentStreet','Revisar dirección física; una casilla o drop box no acredita el domicilio requerido.','Agente registrado / revisor');
  if(intake.agentPostalCode&&!/^\d{5}(?:-\d{4})?$/.test(intake.agentPostalCode))add('AGENT_POSTAL_FORMAT','agentPostalCode','Revisar formato postal. Un formato correcto tampoco verifica domicilio.');
  if(intake.agentConsentCopy!=='yes')add('AGENT_CONSENT_PENDING','agentConsentCopy','Falta declarar la copia a revisar del consentimiento separado.','Agente registrado / revisor');
  if(intake.contactEmail&&!/^[^\s@]+@[^\s@]+\.test$/i.test(intake.contactEmail))add('SYNTHETIC_EMAIL_REQUIRED','contactEmail','Usar un correo ficticio con dominio .test; no se enviará ningún mensaje.');
  if(intake.certificationReviewed!=='yes')add('DECLARATIONS_REVIEW_PENDING','certificationReviewed','Revisar declaraciones y rol del firmante; no aceptarlas desde este laboratorio.');
  const fresh=Number.isFinite(now.getTime())&&now>=new Date(WY_OBSERVED_AT)&&now<new Date(WY_RECHECK_AFTER);
  const hasA=/^a/i.test(intake.companyName.normalize('NFKC').trim());
  const filingRoute=!fresh?'RECHECK_REQUIRED':hasA?'PAPER_MANUAL_REVIEW':intake.entityVariant==='ordinary'?'CHANNEL_REVIEW_REQUIRED':'SPECIALIZED_REVIEW';
  const einRoute=!fresh?'RECHECK_REQUIRED':intake.einExistingRequest==='yes'?'EXISTING_REQUEST_REVIEW':intake.einExistingRequest!=='no'?'MISSING_INFORMATION':intake.einUsPresence==='no'?'INTERNATIONAL_CHANNEL_REVIEW':intake.einUsPresence!=='yes'||!['yes','no'].includes(intake.einTinAvailable)?'MISSING_INFORMATION':intake.einTinAvailable==='no'?'ALTERNATIVE_CHANNEL_REVIEW':'ONLINE_ELIGIBILITY_REVIEW';
  if(einRoute==='MISSING_INFORMATION')add('EIN_INFORMATION_PENDING','einUsPresence','Completar presencia pertinente, disponibilidad de identificador y solicitudes anteriores; no inferir elegibilidad.','Responsable fiscal / profesional');
  const blockers:Issue[]=[...issues,
    {code:'HUMAN_REVIEW_PENDING',field:null,message:'Fuentes y expediente pendientes de revisión profesional. Ninguna declaración del formulario los aprueba.',owner:'Revisor profesional'},
    {code:'PROVIDER_AUTHORIZATION_PENDING',field:null,message:'Sin proveedor contratado ni canal de entrega validado.',owner:'Operaciones'},
    {code:'SIGNATURES_AND_CONSENTS_UNVERIFIED',field:null,message:'No se comprobaron firmas, consentimiento del agente, titularidad ni disponibilidad de nombre.',owner:'Usuario / agente / revisor'},
    {code:'EXTERNAL_FILING_DISABLED',field:null,message:'No hay permiso ni integración para presentar o pagar.',owner:'Operaciones'},
  ];
  if(!fresh)blockers.push({code:'SOURCE_RECHECK_REQUIRED',field:null,message:'Reconsultar las fuentes: ventana interna vencida, reloj inválido o anterior a la observación. Las orientaciones de canal están suspendidas.',owner:'Revisor profesional'});
  if(fresh&&hasA)blockers.push({code:'WY_PAPER_MANUAL_REVIEW',field:'companyName',message:'El portal consultado deriva nombres que empiezan con A a revisión en papel. Confirmar el canal antes de preparar la presentación.',owner:'Organizador / revisor'});
  if(einRoute==='EXISTING_REQUEST_REVIEW')blockers.push({code:'EIN_DUPLICATE_REQUEST_RISK',field:'einExistingRequest',message:'Conciliar el EIN o solicitud previa; no iniciar otra desde este ensayo.',owner:'Responsable fiscal / profesional'});
  const sources=WY_SOURCES.map(source=>({...source,observedAt:WY_OBSERVED_AT,recheckAfter:WY_RECHECK_AFTER,effectiveAt:null,approval:'PENDING_REVIEW' as const,observation:fresh?'PUBLIC_OBSERVATION_ONLY' as const:'RECHECK_REQUIRED' as const}));
  // Hash binds normalized inputs and case revision. It is content identity, not a signature/approval.
  const packetHash=createHash('sha256').update(JSON.stringify({version:WY_PACKET_VERSION,intake,binding,sources})).digest('hex');
  return {schemaVersion:1,version:WY_PACKET_VERSION,jurisdiction:'US-WY' as const,mode:'SANDBOX' as const,synthetic:true as const,status:'DRAFT_NOT_FOR_FILING' as const,publication:'PENDING_REVIEW' as const,
    evaluatedAt:Number.isFinite(now.getTime())?now.toISOString():'INVALID_CLOCK',binding,association:'AUDIT_ONLY_SYNTHETIC_INPUT' as const,packetHash,
    inputStatus:issues.length?'NEEDS_INFORMATION' as const:'COMPLETE_FOR_INTERNAL_REVIEW' as const,
    fields:WY_FIELDS.map(field=>({...field,value:intake[field.key],valueStatus:'DECLARED_NOT_VERIFIED' as const})),sources,blockers,
    routing:{filing:filingRoute,ein:einRoute,eligibilityConfirmed:false},
    reservedActions:['Revisión profesional de fuentes y caso','Firma del organizador y certificación','Consentimiento firmado del agente','Identidad y autorización del responsable fiscal','Presentación y pago por actor autorizado','Recepción y verificación de evidencia oficial'],
    partnerChecklist:['Identificar contraparte, alcance y contrato','Validar quién recibe y quién presenta','Acordar canal seguro y minimización de datos','Acordar acuse, correcciones y responsable de incidencias','Definir identificador único y conciliación antes de reintentar','Revisar evidencia oficial separada del acuse de recepción'],
    filingAdapter:'EXTERNAL_BLOCKED' as const,externalWrites:0,registered:false as const,
    disclaimer:'Paquete sintético de preparación para revisión interna. No es formulario presentado, firma, asesoría legal, aprobación ni certificado. No ingresar datos personales reales, credenciales o identificadores fiscales.'};
}
export type WyomingPacket=ReturnType<typeof prepareWyomingPacket>;

/** Test contract only. Deliberately has no submit(), credentials, URL or networking. */
export function simulatePacketReceipt(packet:WyomingPacket){
  if(packet.schemaVersion!==1||packet.mode!=='SANDBOX'||packet.synthetic!==true||packet.status!=='DRAFT_NOT_FOR_FILING'||packet.registered!==false||packet.filingAdapter!=='EXTERNAL_BLOCKED'||packet.externalWrites!==0||!/^[a-f0-9]{64}$/.test(packet.packetHash))throw new DomainError('INVALID_SANDBOX_ENVELOPE','El sobre no es un paquete sintético de preparación válido');
  return {adapter:'SANDBOX' as const,operation:'VALIDATE_ENVELOPE_ONLY' as const,receiptId:`MOCK-RECEIPT-${packet.packetHash}`,inputStatus:packet.inputStatus,providerAccepted:false,externalWrites:0,registered:false,filingAdapter:'EXTERNAL_BLOCKED' as const};
}
