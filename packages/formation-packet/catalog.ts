import {z} from 'zod';

export const WY_PACKET_VERSION = '2026-09-03.1';
// Public observations, not effective dates or professional approval. No automatic renewal.
export const WY_OBSERVED_AT = '2026-09-03T08:07:30Z';
export const WY_RECHECK_AFTER = '2026-09-04T08:07:30Z';
export const WY_SOURCES = [
  {id:'wy-articles',title:'Wyoming: Articles y consentimiento',url:'https://sos.wyo.gov/Forms/Business/LLC/LLC-ArticlesOrganization.pdf',location:'PDF, páginas 2–3; formulario junio 2021, consentimiento diciembre 2021'},
  {id:'wy-portal',title:'Wyoming: instrucciones del portal',url:'https://wyobiz.wyo.gov/Business/RegistrationInstr.aspx',location:'Who Can File Here? / What you will need'},
  {id:'irs-ss4',title:'IRS: instrucciones SS-4',url:'https://www.irs.gov/instructions/iss4',location:'Revisión 12/2025; How To Apply for an EIN'},
] as const;
type Field = {key:string;label:string;section:string;destination:string;owner:string;sourceId:typeof WY_SOURCES[number]['id']|null;sourceLocation:string;options?:readonly {value:string;label:string}[]};
const choices = [{value:'yes',label:'Sí, declarado en esta prueba'},{value:'no',label:'No'},{value:'unknown',label:'Por confirmar'}];
export const WY_FIELDS = [
  {key:'companyName',label:'Nombre propuesto',section:'Compañía',destination:'Articles, apartado 1',owner:'Usuario / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 2, apartado 1'},
  {key:'entityVariant',label:'Modalidad de LLC',section:'Compañía',destination:'Selección de ruta y Articles, apartado 2',owner:'Revisor profesional',sourceId:'wy-articles',sourceLocation:'PDF p. 2, apartado 2',options:[{value:'ordinary',label:'LLC ordinaria (alcance de este ensayo)'},{value:'close',label:'Close LLC — revisión especializada'},{value:'series',label:'Series LLC — fuera de este ensayo'},{value:'dao',label:'DAO LLC — fuera de este ensayo'}]},
  {key:'nameSearch',label:'Búsqueda de nombre realizada',section:'Compañía',destination:'Verificar en el registro; no reservar ni certificar disponibilidad aquí',owner:'Usuario / revisor',sourceId:'wy-portal',sourceLocation:'What you will need',options:choices},
  {key:'activity',label:'Actividad ficticia',section:'Compañía',destination:'Expediente interno; no es un campo de los Articles',owner:'Usuario / revisor',sourceId:null,sourceLocation:'Checklist de preparación de la plataforma'},
  {key:'ownershipSummary',label:'Titulares ficticios y participación',section:'Compañía',destination:'Revisión interna de estructura; sin documentos de identidad',owner:'Usuario / revisor',sourceId:null,sourceLocation:'Checklist de preparación; no certifica titularidad'},
  {key:'agentName',label:'Nombre del agente registrado ficticio',section:'Agente registrado',destination:'Articles, apartado 3 y consentimiento separado',owner:'Agente registrado / revisor',sourceId:'wy-articles',sourceLocation:'PDF pp. 2–3'},
  {key:'agentStreet',label:'Dirección física del agente ficticio',section:'Agente registrado',destination:'Incluir unidad/suite cuando exista; no sustituir por casilla',owner:'Agente registrado / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 2, apartado 3'},
  {key:'agentCity',label:'Ciudad del agente ficticio',section:'Agente registrado',destination:'Articles, apartado 3',owner:'Agente registrado / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 2, apartado 3'},
  {key:'agentState',label:'Estado del agente (WY)',section:'Agente registrado',destination:'Domicilio del agente en Wyoming; sujeto a verificación',owner:'Agente registrado / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 2, apartado 3'},
  {key:'agentPostalCode',label:'Código postal del agente ficticio',section:'Agente registrado',destination:'Domicilio del agente; el formato no acredita una dirección válida',owner:'Agente registrado / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 3, registered office'},
  {key:'agentConsentCopy',label:'Copia del consentimiento declarada',section:'Agente registrado',destination:'Revisar documento y firma del agente en canal autorizado; no firmar aquí',owner:'Agente registrado / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 3, Consent to Appointment',options:choices},
  {key:'mailingAddress',label:'Domicilio postal ficticio de la LLC',section:'Contacto y domicilios',destination:'Articles, apartado 4',owner:'Usuario / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 2, apartado 4'},
  {key:'principalOfficeAddress',label:'Oficina principal ficticia de la LLC',section:'Contacto y domicilios',destination:'Articles, apartado 5; no copiar automáticamente el domicilio del agente',owner:'Usuario / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 2, apartado 5'},
  {key:'organizerName',label:'Organizador ficticio',section:'Contacto y domicilios',destination:'Bloque del organizador; firma y fecha solo por persona autorizada',owner:'Organizador / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 2, Signature / Print Name'},
  {key:'contactName',label:'Persona de contacto ficticia',section:'Contacto y domicilios',destination:'Bloque de contacto de Articles',owner:'Usuario / organizador',sourceId:'wy-articles',sourceLocation:'PDF p. 2, Contact Person'},
  {key:'contactPhone',label:'Teléfono ficticio de contacto',section:'Contacto y domicilios',destination:'Bloque de contacto; no se efectuará ninguna llamada',owner:'Usuario / organizador',sourceId:'wy-articles',sourceLocation:'PDF p. 2, Daytime Phone Number'},
  {key:'contactEmail',label:'Correo ficticio de contacto (.test)',section:'Contacto y domicilios',destination:'Revisar destinatario de avisos y certificación separada; no enviar mensajes',owner:'Usuario / organizador',sourceId:'wy-articles',sourceLocation:'PDF p. 2, Email / apartado 6'},
  {key:'certificationReviewed',label:'Declaraciones comprendidas en la prueba',section:'Contacto y domicilios',destination:'La comprensión declarada no otorga consentimiento ni firma',owner:'Organizador / revisor',sourceId:'wy-articles',sourceLocation:'PDF p. 2, apartado 6',options:choices},
  {key:'einUsPresence',label:'Presencia pertinente en EE. UU. o sus territorios',section:'EIN: clasificación preliminar',destination:'¿Existe residencia legal, establecimiento principal, oficina principal o agencia? No inferirlo solo del agente registrado',owner:'Usuario / profesional fiscal',sourceId:'irs-ss4',sourceLocation:'How To Apply for an EIN',options:choices},
  {key:'einTinAvailable',label:'Identificador fiscal admitido disponible',section:'EIN: clasificación preliminar',destination:'Solo declarar disponibilidad para revisar elegibilidad; nunca ingresar SSN, ITIN o EIN aquí',owner:'Responsable fiscal / profesional',sourceId:'irs-ss4',sourceLocation:'Apply for an EIN online',options:choices},
  {key:'einExistingRequest',label:'EIN existente o solicitud previa',section:'EIN: clasificación preliminar',destination:'Conciliar cualquier solicitud anterior antes de iniciar otra',owner:'Responsable fiscal / profesional',sourceId:'irs-ss4',sourceLocation:'How To Apply for an EIN: use only one method',options:choices},
] as const satisfies readonly Field[];
export type WyomingFieldId = typeof WY_FIELDS[number]['key'];
export type WyomingIntake = Record<WyomingFieldId,string>;
const shape = Object.fromEntries(WY_FIELDS.map(field=>{
  const options:Field['options']='options' in field?field.options:undefined;
  return [field.key,z.string().trim().max(500).refine(value=>!/[\u0000-\u001f\u007f]/.test(value),'No se admiten caracteres de control').refine(value=>!options||value===''||options.some(o=>o.value===value),'Opción inválida')];
})) as Record<WyomingFieldId,z.ZodString>;
export const wyomingIntakeSchema=z.object(shape).strict();
export const wyomingPacketRequest=z.object({synthetic:z.literal(true),intake:wyomingIntakeSchema,caseId:z.uuid().optional(),caseRevision:z.number().int().nonnegative().optional()}).strict().refine(v=>Boolean(v.caseId)===(v.caseRevision!==undefined),'Expediente y revisión deben enviarse juntos');
export function emptyWyomingIntake():WyomingIntake{return Object.fromEntries(WY_FIELDS.map(f=>[f.key,''])) as WyomingIntake;}
export function syntheticWyomingIntake():WyomingIntake{
  return {companyName:'Orbit QA LLC',entityVariant:'ordinary',nameSearch:'yes',activity:'Software ficticio para ensayo',ownershipSummary:'Fundador ficticio 1: 100%; pendiente de revisión',agentName:'Agente QA ficticio — sin contratar',agentStreet:'123 Fictional Test Street, Suite QA',agentCity:'Cheyenne',agentState:'WY',agentPostalCode:'82001',agentConsentCopy:'yes',mailingAddress:'Domicilio postal ficticio en Bangkok, TH',principalOfficeAddress:'Oficina principal ficticia en Bangkok, TH',organizerName:'Organizador ficticio',contactName:'Contacto ficticio',contactPhone:'+1 202-555-0100',contactEmail:'qa-founder@example.test',certificationReviewed:'yes',einUsPresence:'no',einTinAvailable:'no',einExistingRequest:'no'};
}
