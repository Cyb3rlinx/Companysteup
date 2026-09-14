import {createHash} from 'node:crypto';
import {DomainError} from '../domain';
import {EE_FIELDS,EE_OBSERVED_AT,EE_PACKET_VERSION,EE_RECHECK_AFTER,EE_SOURCES,estoniaIntakeSchema,type EstoniaFieldId} from './estonia-catalog';
import type {PacketBinding} from './wyoming';

type Issue={code:string;field:EstoniaFieldId|null;message:string;owner:string};
/** Preparation only. No authority to identify, sign, contact a provider, pay or file. */
export function prepareEstoniaPacket(input:unknown,binding:PacketBinding=null,now=new Date()){
 const intake=estoniaIntakeSchema.parse(input);const issues:Issue[]=[];
 const add=(code:string,field:EstoniaFieldId|null,message:string,owner='Usuario / revisor')=>issues.push({code,field,message,owner});
 for(const field of EE_FIELDS)if(!intake[field.key])add('DATA_MISSING',field.key,`Completar: ${field.label}`,field.owner);
 if(intake.companyName&&!/(?:\bOÜ|Osaühing)$/iu.test(intake.companyName))add('NAME_FORM_REVIEW','companyName','Revisar que el nombre incluya una forma OÜ admitida; este chequeo no certifica disponibilidad.');
 if(intake.nameSearch!=='yes')add('NAME_SEARCH_PENDING','nameSearch','Falta documentar la consulta informativa de nombres similares.');
 if(intake.companyEmail&&!/^[^\s@]+@[^\s@]+\.test$/i.test(intake.companyEmail))add('SYNTHETIC_EMAIL_REQUIRED','companyEmail','Usar un correo ficticio con dominio .test; no se enviará confirmación.');
 const founders=Number(intake.founderCount);if(intake.founderCount&&(!Number.isInteger(founders)||founders<1))add('FOUNDER_COUNT_INVALID','founderCount','La cantidad de fundadores debe ser un entero positivo.');
 const boardMembers=Number(intake.boardMemberCount);if(intake.boardMemberCount&&(!Number.isInteger(boardMembers)||boardMembers<1))add('BOARD_COUNT_INVALID','boardMemberCount','La cantidad de miembros del directorio debe ser un entero positivo.');
 if(intake.acceptedDigitalIdentity!=='yes')add('ESTONIAN_SIGNATURE_UNAVAILABLE','acceptedDigitalIdentity','Confirmar una identidad admitida para cada firmante o revisar una ruta alternativa.','Cada firmante / revisor');
 const estonianAddress=/^(?:estonia|ee|eesti)$/i.test(intake.legalAddressCountry.trim());
 if(!estonianAddress&&intake.contactPersonNeeded!=='yes')add('CONTACT_PERSON_ROUTE_REVIEW','contactPersonNeeded','Un domicilio extranjero exige revisar una persona de contacto autorizada.','Proveedor autorizado / revisor');
 if(intake.contactPersonNeeded==='yes'&&intake.contactPersonConsent!=='yes')add('CONTACT_PERSON_CONSENT_PENDING','contactPersonConsent','La persona de contacto debe consentir y firmar por el canal oficial.','Proveedor autorizado / revisor');
 if(intake.capitalContributionConfirmed!=='yes')add('CAPITAL_CONTRIBUTION_PENDING','capitalContributionConfirmed','Falta la declaración y evidencia externa del aporte de capital.','Fundadores / directorio');
 if(intake.articlesReviewed!=='yes')add('ARTICLES_REVIEW_PENDING','articlesReviewed','Las opciones de estatutos deben revisarse antes de cualquier firma.');
 if(intake.specialRights&&intake.specialRights.toLowerCase()!=='none')add('SPECIAL_RIGHTS_REVIEW','specialRights','Los derechos especiales propuestos requieren revisión profesional.','Fundadores / revisor profesional');
 const fresh=Number.isFinite(now.getTime())&&now>=new Date(EE_OBSERVED_AT)&&now<new Date(EE_RECHECK_AFTER);
 const corporateFounder=/\b(?:legal person|persona jur[ií]dica|corporat(?:e|ivo|iva)|company|empresa)\b/i.test(intake.founderTypeSummary);
 const digitalRoute=!fresh?'RECHECK_REQUIRED':corporateFounder?'NOTARY_ROUTE_REVIEW':intake.acceptedDigitalIdentity==='yes'?'PORTAL_HANDOFF_REVIEW':'IDENTITY_ROUTE_REVIEW';
 const blockers:Issue[]=[...issues,
  {code:'HUMAN_REVIEW_PENDING',field:null,message:'Fuentes, actividad, estructura, estatutos y expediente pendientes de revisión profesional.',owner:'Revisor profesional'},
  {code:'IDENTITY_VERIFICATION_EXTERNAL',field:null,message:'No se recopilaron ni verificaron códigos personales, tarjetas o credenciales de identidad.',owner:'Cada firmante / proveedor autorizado'},
  {code:'CONTACT_PERSON_VERIFICATION_PENDING',field:null,message:'No se verificaron licencia, contrato, domicilio, consentimiento ni firma de la persona de contacto.',owner:'Proveedor autorizado / operaciones'},
  {code:'SIGNATURE_UNVERIFIED',field:null,message:'Todas las firmas y el PIN2 permanecen bajo control de los firmantes en el portal oficial.',owner:'Cada firmante'},
  {code:'CAPITAL_AND_STATE_FEE_UNVERIFIED',field:null,message:'No se transfirió capital ni se calculó, cobró o acreditó una tasa estatal.',owner:'Fundadores / operaciones'},
  {code:'EXTERNAL_FILING_DISABLED',field:null,message:'No hay integración autorizada para presentar ni consultar una decisión registral.',owner:'Operaciones / autoridad'},
  {code:'RIK_API_UNVERIFIED',field:null,message:'La API de registro permanece bloqueada hasta habilitación, contrato y pruebas con RIK.',owner:'Operaciones / proveedor autorizado'},
 ];
 if(!fresh)blockers.push({code:'SOURCE_RECHECK_REQUIRED',field:null,message:'Reconsultar las fuentes antes de usar esta preparación; la ventana interna venció o el reloj es inválido.',owner:'Revisor profesional'});
 const sources=EE_SOURCES.map(source=>({...source,observedAt:EE_OBSERVED_AT,recheckAfter:EE_RECHECK_AFTER,effectiveAt:null,approval:'PENDING_REVIEW' as const,observation:fresh?'PUBLIC_OBSERVATION_ONLY' as const:'RECHECK_REQUIRED' as const}));
 const packetHash=createHash('sha256').update(JSON.stringify({version:EE_PACKET_VERSION,intake,binding,sources})).digest('hex');
 return{schemaVersion:1,version:EE_PACKET_VERSION,jurisdiction:'EE' as const,mode:'SANDBOX' as const,synthetic:true as const,status:'DRAFT_NOT_FOR_FILING' as const,publication:'PENDING_REVIEW' as const,evaluatedAt:Number.isFinite(now.getTime())?now.toISOString():'INVALID_CLOCK',binding,association:'AUDIT_ONLY_SYNTHETIC_INPUT' as const,packetHash,inputStatus:issues.length?'NEEDS_INFORMATION' as const:'COMPLETE_FOR_INTERNAL_REVIEW' as const,fields:EE_FIELDS.map(field=>({...field,value:intake[field.key],valueStatus:'DECLARED_NOT_VERIFIED' as const})),sources,blockers,routing:{formation:digitalRoute,address:estonianAddress?'ESTONIAN_ADDRESS_REVIEW':'FOREIGN_ADDRESS_CONTACT_PERSON_REVIEW',vat:intake.vatRegistrationRequested==='yes'?'PROFESSIONAL_TAX_REVIEW':'NOT_REQUESTED',eligibilityConfirmed:false},reservedActions:['Revisión profesional de actividad, estructura, estatutos y beneficiarios finales','Verificación de identidad de cada participante por canal autorizado','Validación y contratación de domicilio o persona de contacto','Consentimientos y firmas digitales en el portal oficial','Aporte de capital y evidencia financiera fuera de la plataforma','Cálculo y pago de tasa estatal','Presentación por cada actor autorizado y decisión del registrador'],partnerChecklist:['Validar licencia, alcance y contrato del proveedor de domicilio o contacto','Confirmar quién debe firmar y qué identidad digital admite el portal para cada persona','Revisar por separado fundadores jurídicos, estructuras múltiples y rutas notariales','Usar canal seguro para códigos personales, documentos, credenciales y firmas','Conciliar aporte, tasa y acuse del registro con evidencia oficial'],filingAdapter:'EXTERNAL_BLOCKED' as const,externalWrites:0,registered:false as const,disclaimer:'Paquete sintético de preparación para revisión interna. No es solicitud presentada, identificación, firma, asesoría legal o fiscal, pago, aprobación ni certificado. No ingresar datos personales reales, códigos, credenciales, PIN2 ni datos bancarios.'};
}
export type EstoniaPacket=ReturnType<typeof prepareEstoniaPacket>;
export function simulateEstoniaPacketReceipt(packet:EstoniaPacket){
 if(packet.schemaVersion!==1||packet.mode!=='SANDBOX'||packet.synthetic!==true||packet.status!=='DRAFT_NOT_FOR_FILING'||packet.registered!==false||packet.filingAdapter!=='EXTERNAL_BLOCKED'||packet.externalWrites!==0||!/^[a-f0-9]{64}$/.test(packet.packetHash))throw new DomainError('INVALID_SANDBOX_ENVELOPE','El sobre no es un paquete sintético de preparación válido');
 return{adapter:'SANDBOX' as const,operation:'VALIDATE_ENVELOPE_ONLY' as const,receiptId:`MOCK-EE-RECEIPT-${packet.packetHash}`,inputStatus:packet.inputStatus,providerAccepted:false,externalWrites:0,registered:false,filingAdapter:'EXTERNAL_BLOCKED' as const};
}
