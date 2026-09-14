import {z} from 'zod';

export const EE_PACKET_VERSION='2026-09-14.1';
// Public observations, not effective dates or professional approval. No automatic renewal.
export const EE_OBSERVED_AT='2026-09-14T16:30:00Z';
export const EE_RECHECK_AFTER='2026-09-15T16:30:00Z';
export const EE_SOURCES=[
 {id:'ee-rik-establishment',title:'RIK: establishment of a private limited company',url:'https://abiinfo.rik.ee/en/applications-and-dashboard/establishment-new-legal-person/establishment-private-limited-company',location:'Activity, name, address, contacts, persons, capital, articles, beneficial owners, confirmation, signature, payment and submission'},
 {id:'ee-rik-forms',title:'e-Business Register: establishment and legal forms',url:'https://ariregister.rik.ee/eng/application/start',location:'Private limited company: capital, founders, articles, management board and annual report'},
 {id:'ee-online-steps',title:'e-Residency: five steps to register online',url:'https://learn.e-resident.gov.ee/hc/en-gb/articles/360000624838-5-steps-to-register-a-company-online',location:'Name, activity, address/contact person, signing, state fee and submission'},
 {id:'ee-address',title:'e-Residency: contact person and legal address',url:'https://learn.e-resident.gov.ee/hc/en-gb/articles/360000624858-Contact-person-legal-address',location:'Legal-address options and licensed contact-person role'},
 {id:'ee-ou',title:'e-Residency: private limited company (OÜ)',url:'https://learn.e-resident.gov.ee/hc/en-gb/articles/360000633557-Private-limited-company-O%C3%9C',location:'Management board, digital ID, share capital, EMTAK and registration route'},
 {id:'ee-multiple',title:'e-Residency: single vs multi-shareholder company',url:'https://learn.e-resident.gov.ee/hc/en-gb/articles/360000866837-Single-vs-multi-shareholder-company',location:'Management board and corporate-founder route limitation'},
 {id:'ee-capital',title:'e-Residency: share capital contribution',url:'https://learn.e-resident.gov.ee/hc/en-gb/articles/360000798017-Share-capital-contribution',location:'Contribution declarations and separate payment evidence'},
] as const;

type Field={key:string;label:string;section:string;destination:string;owner:string;sourceId:typeof EE_SOURCES[number]['id'];sourceLocation:string;options?:readonly {value:string;label:string}[]};
const choices=[{value:'yes',label:'Sí, declarado en esta prueba'},{value:'no',label:'No'},{value:'unknown',label:'Por confirmar'}] as const;

export const EE_FIELDS=[
 {key:'principalActivity',label:'Actividad principal EMTAK propuesta',section:'Activity',destination:'Actividad principal planificada; código y encaje sujetos a revisión',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Activity view'},
 {key:'financialYear',label:'Ejercicio financiero propuesto',section:'Activity',destination:'Período financiero; el año calendario aparece como opción predeterminada',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Financial year'},
 {key:'companyName',label:'Nombre propuesto',section:'Name',destination:'Nombre OÜ; la decisión final de admisibilidad corresponde al registrador',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Name and OÜ/Osaühing form'},
 {key:'nameSearch',label:'Búsqueda informativa de nombre realizada',section:'Name',destination:'Consulta informativa; no certifica disponibilidad ni aprobación',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Similar entities and trademarks',options:choices},
 {key:'legalAddressCountry',label:'País del domicilio propuesto',section:'Address',destination:'Clasificar domicilio estonio o extranjero antes de revisar persona de contacto',owner:'Usuario / proveedor',sourceId:'ee-rik-establishment',sourceLocation:'Address'},
 {key:'legalAddress',label:'Domicilio ficticio propuesto',section:'Address',destination:'Dirección del expediente; no verifica un domicilio ni contrato real',owner:'Usuario / proveedor',sourceId:'ee-address',sourceLocation:'Legal-address options'},
 {key:'companyEmail',label:'Correo ficticio de la compañía (.test)',section:'Contacts',destination:'Medio de contacto obligatorio; la plataforma no envía confirmaciones',owner:'Usuario',sourceId:'ee-rik-establishment',sourceLocation:'Means of communication'},
 {key:'founderCount',label:'Cantidad de fundadores',section:'Persons',destination:'Cantidad declarada para preparar la lista de fundadores',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Founders'},
 {key:'founderTypeSummary',label:'Fundadores ficticios y tipo',section:'Persons',destination:'Resumen natural/jurídico sin códigos personales ni documentos',owner:'Usuario / revisor',sourceId:'ee-multiple',sourceLocation:'Corporate shareholders'},
 {key:'boardMemberCount',label:'Cantidad de miembros del directorio',section:'Persons',destination:'Cantidad declarada para preparar el directorio',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Management board members'},
 {key:'boardMemberSummary',label:'Directores ficticios',section:'Persons',destination:'Resumen de miembros sin códigos personales ni documentos',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Management board members'},
 {key:'representationRule',label:'Regla de representación propuesta',section:'Persons',destination:'Regla conjunta o especificación propuesta; requiere revisión',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Right of representation'},
 {key:'acceptedDigitalIdentity',label:'Todos los firmantes declaran identidad digital admitida',section:'Signature readiness',destination:'Clasificación preliminar; no recopila tarjeta, código personal, PIN ni firma',owner:'Cada firmante / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Permitted signing methods',options:choices},
 {key:'contactPersonNeeded',label:'Persona de contacto declarada como necesaria',section:'Contact person',destination:'Declaración para revisión según domicilio y ubicación del directorio',owner:'Usuario / proveedor',sourceId:'ee-address',sourceLocation:'Foreign management-board address rule',options:choices},
 {key:'contactPersonName',label:'Persona de contacto ficticia',section:'Contact person',destination:'Proveedor o persona ficticia; licencia y elegibilidad no verificadas',owner:'Proveedor autorizado / revisor',sourceId:'ee-address',sourceLocation:'Licensed contact person'},
 {key:'contactPersonConsent',label:'Consentimiento de persona de contacto declarado',section:'Contact person',destination:'Declaración solamente; consentimiento y firma se verifican fuera de la plataforma',owner:'Proveedor autorizado / revisor',sourceId:'ee-online-steps',sourceLocation:'Required signers',options:choices},
 {key:'shareCapitalAmount',label:'Capital social propuesto en EUR',section:'Capital',destination:'Capital declarado; conciliación y evidencia de aporte separadas',owner:'Fundadores / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Capital'},
 {key:'shareAllocationSummary',label:'Distribución ficticia del capital',section:'Capital',destination:'Aportes y participaciones por fundador, sin datos bancarios',owner:'Fundadores / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Founder contributions'},
 {key:'capitalContributionConfirmed',label:'Aporte de capital declarado como realizado',section:'Capital',destination:'Declaración para revisión; no acredita transferencia ni pago',owner:'Fundadores / directorio',sourceId:'ee-capital',sourceLocation:'Contribution confirmation',options:choices},
 {key:'specialRights',label:'Derechos especiales propuestos',section:'Capital',destination:'Usar “none” si no se proponen; cualquier derecho requiere revisión profesional',owner:'Fundadores / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Share classes and special rights'},
 {key:'articlesReviewed',label:'Opciones de estatutos revisadas',section:'Articles',destination:'Confirmación de lectura; no constituye aceptación ni firma',owner:'Fundadores / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Articles of association',options:choices},
 {key:'beneficialOwnersSummary',label:'Beneficiarios finales ficticios',section:'Beneficial owners',destination:'Resumen sintético para revisión; identidad real solo por canal autorizado',owner:'Usuario / revisor',sourceId:'ee-rik-establishment',sourceLocation:'Beneficial owners'},
 {key:'vatRegistrationRequested',label:'Registro voluntario de IVA solicitado',section:'Optional tax request',destination:'Preferencia declarada; requiere evaluación fiscal y datos adicionales',owner:'Usuario / profesional fiscal',sourceId:'ee-rik-establishment',sourceLocation:'Optional voluntary VAT registration',options:choices},
 {key:'stateFeeReadiness',label:'Preparación para tasa estatal declarada',section:'Payment readiness',destination:'Preparación solamente; no calcula, cobra ni acredita la tasa',owner:'Usuario / operaciones',sourceId:'ee-rik-establishment',sourceLocation:'State fee and submission',options:choices},
] as const satisfies readonly Field[];

export type EstoniaFieldId=typeof EE_FIELDS[number]['key'];
export type EstoniaIntake=Record<EstoniaFieldId,string>;
const shape=Object.fromEntries(EE_FIELDS.map(field=>{
 const options:Field['options']='options' in field?field.options:undefined;
 return[field.key,z.string().trim().max(500).refine(value=>!/[\u0000-\u001f\u007f]/.test(value),'No se admiten caracteres de control').refine(value=>!options||value===''||options.some(option=>option.value===value),'Opción inválida')];
})) as Record<EstoniaFieldId,z.ZodString>;
export const estoniaIntakeSchema=z.object(shape).strict();
export function emptyEstoniaIntake():EstoniaIntake{return Object.fromEntries(EE_FIELDS.map(field=>[field.key,''])) as EstoniaIntake;}
export function syntheticEstoniaIntake():EstoniaIntake{return{
 principalActivity:'Desarrollo de software ficticio; EMTAK por revisar',financialYear:'Año calendario',companyName:'Orbit Estonia QA OÜ',nameSearch:'yes',legalAddressCountry:'Estonia',legalAddress:'123 Fictional Test Street, Tallinn',companyEmail:'qa-estonia@example.test',founderCount:'1',founderTypeSummary:'Una persona natural ficticia',boardMemberCount:'1',boardMemberSummary:'Directora ficticia A',representationRule:'Representación individual propuesta',acceptedDigitalIdentity:'yes',contactPersonNeeded:'yes',contactPersonName:'Proveedor de contacto Estonia QA ficticio — sin contratar',contactPersonConsent:'yes',shareCapitalAmount:'1.00 EUR',shareAllocationSummary:'Fundador ficticio 1: 100%',capitalContributionConfirmed:'yes',specialRights:'none',articlesReviewed:'yes',beneficialOwnersSummary:'Beneficiario ficticio 1: control directo 100%',vatRegistrationRequested:'no',stateFeeReadiness:'yes'
};}
