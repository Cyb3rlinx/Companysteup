import {z} from 'zod';

export const UK_PACKET_VERSION='2026-09-15.1';
// Public observations only. These timestamps are an internal recheck window, not legal effective dates.
export const UK_OBSERVED_AT='2026-09-15T07:40:00Z';
export const UK_RECHECK_AFTER='2026-09-16T07:40:00Z';
export const UK_SOURCES=[
 {id:'uk-register',title:'GOV.UK: register a private limited company',url:'https://www.gov.uk/limited-company-formation/register-your-company',location:'Registration route, PSC confirmation, identity codes, fee, certificate and SIC'},
 {id:'uk-name',title:'GOV.UK: choose a company name',url:'https://www.gov.uk/limited-company-formation/choose-company-name',location:'Name rules and separate availability and trade mark checks'},
 {id:'uk-address',title:'GOV.UK: registered office and email',url:'https://www.gov.uk/limited-company-formation/company-address',location:'Appropriate UK address, nation match, public address and private registered email'},
 {id:'uk-directors',title:'GOV.UK: appoint directors and a company secretary',url:'https://www.gov.uk/limited-company-formation/appoint-directors-and-company-secretaries',location:'Director count, age, residence, service address and secretary'},
 {id:'uk-shareholders',title:'GOV.UK: shareholders and shares',url:'https://www.gov.uk/limited-company-formation/shareholders',location:'Shareholders, share capital, classes, values and PSC threshold example'},
 {id:'uk-documents',title:'GOV.UK: memorandum, articles and statement of capital',url:'https://www.gov.uk/limited-company-formation/documents',location:'Constitutional documents, subscribers and prescribed particulars'},
 {id:'uk-identity',title:'Companies House: identity verification',url:'https://www.gov.uk/guidance/verifying-your-identity-for-companies-house',location:'Directors, PSCs, personal codes and approved verification routes'},
 {id:'uk-psc',title:'Companies House: people with significant control',url:'https://www.gov.uk/guidance/people-with-significant-control-pscs',location:'PSC identification, nature of control and separate role linkage'},
 {id:'uk-acsp',title:'Companies House: authorised corporate service providers',url:'https://www.gov.uk/guidance/being-an-authorised-corporate-service-provider',location:'AML supervision, authorised-agent status and phased filing capability'},
] as const;

type Field={key:string;label:string;section:string;destination:string;owner:string;sourceId:typeof UK_SOURCES[number]['id'];sourceLocation:string;options?:readonly {value:string;label:string}[]};
const choices=[{value:'yes',label:'Sí, declarado en esta prueba'},{value:'no',label:'No'},{value:'unknown',label:'Por confirmar'}] as const;

export const UK_FIELDS=[
 {key:'principalActivity',label:'Actividad principal propuesta',section:'Company',destination:'Descripción interna para revisar el código SIC; no sustituye el SIC declarado',owner:'Usuario / revisor',sourceId:'uk-register',sourceLocation:'SIC code'},
 {key:'sicCode',label:'Código SIC propuesto',section:'Company',destination:'Código de actividad para la solicitud; requiere contraste con la lista oficial vigente',owner:'Usuario / revisor',sourceId:'uk-register',sourceLocation:'SIC code'},
 {key:'companyName',label:'Nombre propuesto',section:'Name',destination:'Nombre de la Ltd; la aceptación corresponde a Companies House',owner:'Usuario / revisor',sourceId:'uk-name',sourceLocation:'Name rules'},
 {key:'nameSearch',label:'Búsqueda informativa de nombre realizada',section:'Name',destination:'Consulta de registro y marcas; no certifica disponibilidad',owner:'Usuario / revisor',sourceId:'uk-name',sourceLocation:'Availability and trade mark checks',options:choices},
 {key:'registeredNation',label:'Nación de registro propuesta',section:'Address',destination:'England and Wales, Wales, Scotland o Northern Ireland para validar la nación del domicilio',owner:'Usuario / proveedor',sourceId:'uk-address',sourceLocation:'Same-country rule'},
 {key:'registeredOfficeAddress',label:'Domicilio registrado ficticio propuesto',section:'Address',destination:'Domicilio público apropiado en la nación de registro; no verifica permiso ni servicio',owner:'Usuario / proveedor',sourceId:'uk-address',sourceLocation:'Registered office address'},
 {key:'registeredOfficeAppropriate',label:'Domicilio declarado como apropiado y autorizado',section:'Address',destination:'Declaración preliminar sobre entrega y confirmación de correo; requiere evidencia del proveedor',owner:'Usuario / proveedor',sourceId:'uk-address',sourceLocation:'Appropriate address',options:choices},
 {key:'registeredEmail',label:'Correo registrado ficticio de la compañía (.test)',section:'Contacts',destination:'Correo no público para Companies House; la plataforma no envía ni verifica mensajes',owner:'Usuario',sourceId:'uk-address',sourceLocation:'Registered email'},
 {key:'directorCount',label:'Cantidad de directores',section:'Directors',destination:'Cantidad declarada; una compañía privada necesita al menos un director',owner:'Usuario / revisor',sourceId:'uk-directors',sourceLocation:'Director requirement'},
 {key:'directorSummary',label:'Directores ficticios y domicilios de servicio',section:'Directors',destination:'Resumen sintético sin domicilios residenciales, fechas de nacimiento ni documentos',owner:'Usuario / revisor',sourceId:'uk-directors',sourceLocation:'Directors and service addresses'},
 {key:'directorsEligible',label:'Elegibilidad de directores declarada',section:'Directors',destination:'Declaración sobre edad y restricciones; no constituye una comprobación',owner:'Cada director / revisor',sourceId:'uk-directors',sourceLocation:'Age and restrictions',options:choices},
 {key:'directorsIdentityVerified',label:'Identidad de todos los directores declarada como verificada',section:'Identity',destination:'Estado declarado solamente; no recopila documentos ni códigos personales',owner:'Cada director / Companies House o ACSP',sourceId:'uk-identity',sourceLocation:'Directors and personal codes',options:choices},
 {key:'shareholderCount',label:'Cantidad de accionistas iniciales',section:'Shares',destination:'Cantidad declarada para la lista de suscriptores',owner:'Usuario / revisor',sourceId:'uk-shareholders',sourceLocation:'Shareholders'},
 {key:'shareholderSummary',label:'Accionistas ficticios',section:'Shares',destination:'Resumen sintético de suscriptores sin identidad real ni domicilios personales',owner:'Usuario / revisor',sourceId:'uk-documents',sourceLocation:'Subscribers'},
 {key:'shareStructure',label:'Estructura de acciones propuesta',section:'Shares',destination:'Clase, cantidad, valor nominal y derechos para el statement of capital',owner:'Accionistas / revisor',sourceId:'uk-documents',sourceLocation:'Statement of capital and prescribed particulars'},
 {key:'pscSummary',label:'PSC ficticios y naturaleza de control',section:'PSC',destination:'Resumen sintético por rol y naturaleza de control; requiere revisión separada',owner:'Usuario / revisor',sourceId:'uk-psc',sourceLocation:'PSC identification and nature of control'},
 {key:'pscIdentityLinked',label:'Identidad PSC declarada como verificada y vinculada por rol',section:'Identity',destination:'Estado declarado; el código personal queda exclusivamente en el servicio autorizado',owner:'Cada PSC / Companies House o ACSP',sourceId:'uk-identity',sourceLocation:'PSC role linkage',options:choices},
 {key:'articlesChoice',label:'Opción de estatutos propuesta',section:'Documents',destination:'Model articles o estatutos personalizados; los personalizados requieren revisión',owner:'Accionistas / revisor',sourceId:'uk-documents',sourceLocation:'Articles of association'},
 {key:'memorandumReadiness',label:'Memorandum declarado como preparado por la ruta elegida',section:'Documents',destination:'Preparación o generación en línea; no es firma ni presentación',owner:'Suscriptores / revisor',sourceId:'uk-documents',sourceLocation:'Memorandum of association',options:choices},
 {key:'lawfulPurposeConfirmed',label:'Propósito lícito declarado para las actividades futuras',section:'Declarations',destination:'Declaración del solicitante pendiente de revisión; la plataforma no la presenta',owner:'Usuario / revisor',sourceId:'uk-register',sourceLocation:'Registration declarations',options:choices},
 {key:'filingRoute',label:'Ruta de presentación propuesta',section:'Handoff',destination:'Autopresentación del usuario o agente autorizado; no concede autoridad a la plataforma',owner:'Usuario / operaciones',sourceId:'uk-acsp',sourceLocation:'Authorised agent scope'},
 {key:'feeReadiness',label:'Preparación para la tasa declarada',section:'Payment readiness',destination:'Preparación solamente; no calcula, cobra ni acredita la tasa',owner:'Usuario / operaciones',sourceId:'uk-register',sourceLocation:'Registration fee and payment',options:choices},
] as const satisfies readonly Field[];

export type UkFieldId=typeof UK_FIELDS[number]['key'];
export type UkIntake=Record<UkFieldId,string>;
const shape=Object.fromEntries(UK_FIELDS.map(field=>{
 const options:Field['options']='options' in field?field.options:undefined;
 return[field.key,z.string().trim().max(500).refine(value=>!/[\u0000-\u001f\u007f]/.test(value),'No se admiten caracteres de control').refine(value=>!options||value===''||options.some(option=>option.value===value),'Opción inválida')];
})) as Record<UkFieldId,z.ZodString>;
export const ukIntakeSchema=z.object(shape).strict();
export function emptyUkIntake():UkIntake{return Object.fromEntries(UK_FIELDS.map(field=>[field.key,''])) as UkIntake;}
export function syntheticUkIntake():UkIntake{return{
 principalActivity:'Desarrollo de software ficticio',sicCode:'62012',companyName:'Orbit United Kingdom QA Ltd',nameSearch:'yes',registeredNation:'England and Wales',registeredOfficeAddress:'123 Fictional Test Street, London, SW1A 1AA',registeredOfficeAppropriate:'yes',registeredEmail:'qa-uk@example.test',directorCount:'1',directorSummary:'Directora ficticia A; domicilio de servicio ficticio',directorsEligible:'yes',directorsIdentityVerified:'yes',shareholderCount:'1',shareholderSummary:'Accionista ficticia A',shareStructure:'100 ordinary shares de GBP 1; un voto y derechos iguales por acción',pscSummary:'PSC ficticia A: más de 75% de acciones y votos',pscIdentityLinked:'yes',articlesChoice:'Model articles para private company limited by shares',memorandumReadiness:'yes',lawfulPurposeConfirmed:'yes',filingRoute:'Autopresentación del usuario en el servicio oficial',feeReadiness:'yes'
};}
