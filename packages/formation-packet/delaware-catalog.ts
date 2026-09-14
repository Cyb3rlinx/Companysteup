import {z} from 'zod';

export const DE_PACKET_VERSION='2026-09-14.1';
// Public observations, not effective dates or professional approval. No automatic renewal.
export const DE_OBSERVED_AT='2026-09-14T08:00:00Z';
export const DE_RECHECK_AFTER='2026-09-15T08:00:00Z';
export const DE_SOURCES=[
 {id:'de-certificate',title:'Delaware: Certificate of Formation (LLC)',url:'https://www.corp.delaware.gov/DE%20or%20Non-DE%20Corp%20to%20DE%20LLC09.pdf',location:'Certificate of Formation: First, Second, Third and execution block'},
 {id:'de-request',title:'Delaware: submitting a filing request',url:'https://corp.delaware.gov/regguide/',location:'Filing Requests'},
 {id:'de-cover',title:'Delaware: filing cover memo',url:'https://corp.delaware.gov/cvrmemo/',location:'Cover Memos and required contact information'},
 {id:'de-agent',title:'Delaware: registered-agent requirements',url:'https://corp.delaware.gov/agents/',location:'Disclaimer and consent requirement'},
 {id:'de-upload',title:'Delaware: Document Filing and Certificate Request',url:'https://corp.delaware.gov/document-upload-service-information/',location:'Submission-only service and fee processing'},
 {id:'irs-ss4',title:'IRS: Instructions for Form SS-4',url:'https://www.irs.gov/instructions/iss4',location:'Revision 12/2025; How To Apply for an EIN'},
] as const;

type Field={key:string;label:string;section:string;destination:string;owner:string;sourceId:typeof DE_SOURCES[number]['id']|null;sourceLocation:string;options?:readonly {value:string;label:string}[]};
const choices=[{value:'yes',label:'Sí, declarado en esta prueba'},{value:'no',label:'No'},{value:'unknown',label:'Por confirmar'}] as const;

export const DE_FIELDS=[
 {key:'companyName',label:'Nombre propuesto',section:'Certificate of Formation',destination:'Certificate, First; revisar designador y disponibilidad por separado',owner:'Usuario / revisor',sourceId:'de-certificate',sourceLocation:'First'},
 {key:'nameSearch',label:'Búsqueda de nombre realizada',section:'Certificate of Formation',destination:'Verificación separada; no certifica ni reserva disponibilidad',owner:'Usuario / revisor',sourceId:'de-request',sourceLocation:'Filing Requests',options:choices},
 {key:'activity',label:'Actividad ficticia',section:'Expediente interno',destination:'Clasificación y revisión interna; no es un campo básico del Certificate',owner:'Usuario / revisor',sourceId:null,sourceLocation:'Checklist interno de preparación'},
 {key:'ownershipSummary',label:'Titulares ficticios y participación',section:'Expediente interno',destination:'Revisión interna de estructura; sin documentos de identidad',owner:'Usuario / revisor',sourceId:null,sourceLocation:'Checklist interno; no certifica titularidad'},
 {key:'registeredAgentName',label:'Nombre del agente registrado ficticio',section:'Registered agent',destination:'Certificate, Second',owner:'Agente registrado / revisor',sourceId:'de-certificate',sourceLocation:'Second'},
 {key:'registeredOfficeStreet',label:'Dirección física del agente ficticio',section:'Registered agent',destination:'Certificate, Second; domicilio en Delaware sujeto a verificación',owner:'Agente registrado / revisor',sourceId:'de-agent',sourceLocation:'Street address and office in Delaware'},
 {key:'registeredOfficeCity',label:'Ciudad del agente ficticio',section:'Registered agent',destination:'Certificate, Second',owner:'Agente registrado / revisor',sourceId:'de-certificate',sourceLocation:'Second'},
 {key:'registeredOfficePostalCode',label:'Código postal del agente ficticio',section:'Registered agent',destination:'Certificate, Second',owner:'Agente registrado / revisor',sourceId:'de-certificate',sourceLocation:'Second'},
 {key:'registeredAgentConsent',label:'Consentimiento del agente declarado',section:'Registered agent',destination:'Confirmar directamente con el agente antes de cualquier presentación',owner:'Agente registrado / revisor',sourceId:'de-request',sourceLocation:'Filing Requests',options:choices},
 {key:'authorizedPersonName',label:'Persona autorizada ficticia',section:'Ejecución',destination:'Certificate, bloque de ejecución; no firma dentro de este producto',owner:'Persona autorizada / revisor',sourceId:'de-certificate',sourceLocation:'Execution block'},
 {key:'authorizedPersonRoleReviewed',label:'Autoridad del firmante revisada',section:'Ejecución',destination:'Revisión de autoridad antes de firma; la declaración no es una firma',owner:'Persona autorizada / revisor',sourceId:'de-certificate',sourceLocation:'Authorized Person(s)',options:choices},
 {key:'additionalMatters',label:'Materias adicionales',section:'Certificate of Formation',destination:'Certificate, Third; usar “none” si no se propone texto adicional',owner:'Usuario / asesor legal',sourceId:'de-certificate',sourceLocation:'Third'},
 {key:'submitterName',label:'Remitente ficticio',section:'Cover memo',destination:'Nombre de persona o firma que remite',owner:'Remitente / operaciones',sourceId:'de-cover',sourceLocation:'Required name'},
 {key:'submitterAddress',label:'Dirección ficticia del remitente',section:'Cover memo',destination:'Dirección postal completa para devolución',owner:'Remitente / operaciones',sourceId:'de-cover',sourceLocation:'Required address'},
 {key:'submitterEmail',label:'Correo ficticio del remitente (.test)',section:'Cover memo',destination:'Dato de contacto; no se enviará ningún mensaje',owner:'Remitente / operaciones',sourceId:'de-cover',sourceLocation:'Phone, fax or e-mail'},
 {key:'expressReturnRequested',label:'Devolución exprés solicitada',section:'Cover memo',destination:'Clasificar devolución; nunca ingresar una cuenta FedEx/UPS aquí',owner:'Remitente / operaciones',sourceId:'de-cover',sourceLocation:'Mail-out information',options:choices},
 {key:'expeditedServiceRequested',label:'Servicio expedito solicitado',section:'Solicitud',destination:'Clasificar para cotización y revisión separada; no cobra ni calcula tasas',owner:'Usuario / operaciones',sourceId:'de-request',sourceLocation:'Filing Requests and expedited service fees',options:choices},
 {key:'einUsPresence',label:'Presencia pertinente en EE. UU. o sus territorios',section:'EIN: clasificación preliminar',destination:'Clasificar posible canal del EIN; no inferirlo por el agente registrado',owner:'Usuario / profesional fiscal',sourceId:'irs-ss4',sourceLocation:'How To Apply for an EIN',options:choices},
 {key:'einTinAvailable',label:'Identificador fiscal admitido disponible',section:'EIN: clasificación preliminar',destination:'Declarar disponibilidad solamente; nunca ingresar SSN, ITIN o EIN aquí',owner:'Responsable fiscal / profesional',sourceId:'irs-ss4',sourceLocation:'Apply for an EIN online',options:choices},
 {key:'einExistingRequest',label:'EIN existente o solicitud previa',section:'EIN: clasificación preliminar',destination:'Conciliar una solicitud anterior antes de iniciar otra',owner:'Responsable fiscal / profesional',sourceId:'irs-ss4',sourceLocation:'Use only one application method',options:choices},
] as const satisfies readonly Field[];

export type DelawareFieldId=typeof DE_FIELDS[number]['key'];
export type DelawareIntake=Record<DelawareFieldId,string>;
const shape=Object.fromEntries(DE_FIELDS.map(field=>{
 const options:Field['options']='options' in field?field.options:undefined;
 return[field.key,z.string().trim().max(500).refine(value=>!/[\u0000-\u001f\u007f]/.test(value),'No se admiten caracteres de control').refine(value=>!options||value===''||options.some(option=>option.value===value),'Opción inválida')];
})) as Record<DelawareFieldId,z.ZodString>;
export const delawareIntakeSchema=z.object(shape).strict();
export function emptyDelawareIntake():DelawareIntake{return Object.fromEntries(DE_FIELDS.map(field=>[field.key,''])) as DelawareIntake;}
export function syntheticDelawareIntake():DelawareIntake{return{
 companyName:'Orbit Delaware QA LLC',nameSearch:'yes',activity:'Software ficticio para ensayo',ownershipSummary:'Fundador ficticio 1: 100%; pendiente de revisión',registeredAgentName:'Agente Delaware QA ficticio — sin contratar',registeredOfficeStreet:'123 Fictional Market Street, Suite QA',registeredOfficeCity:'Wilmington',registeredOfficePostalCode:'19801',registeredAgentConsent:'yes',authorizedPersonName:'Persona autorizada ficticia',authorizedPersonRoleReviewed:'yes',additionalMatters:'none',submitterName:'Remitente ficticio',submitterAddress:'Dirección postal ficticia en Bangkok, TH',submitterEmail:'qa-delaware@example.test',expressReturnRequested:'no',expeditedServiceRequested:'no',einUsPresence:'no',einTinAvailable:'no',einExistingRequest:'no'
};}
