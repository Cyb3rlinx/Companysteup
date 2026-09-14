import {z} from 'zod';
import {DomainError} from '../domain';
import {WY_FIELDS,emptyWyomingIntake,wyomingIntakeSchema,type WyomingFieldId} from '../formation-packet/catalog';
import {DE_FIELDS,emptyDelawareIntake,delawareIntakeSchema,type DelawareFieldId} from '../formation-packet/delaware-catalog';
import {EE_FIELDS,emptyEstoniaIntake,estoniaIntakeSchema,type EstoniaFieldId} from '../formation-packet/estonia-catalog';

export const ONBOARDING_AGENT_VERSION='2026-09-14.7';
export type ConversationJurisdiction='US-WY'|'US-DE'|'EE';
export type FormationFieldId=WyomingFieldId|DelawareFieldId|EstoniaFieldId;
export type ProposedUpdate={field:FormationFieldId;value:string;evidence:string};
export type ExtractionRejectionReason='duplicate_field'|'disallowed_field'|'nonliteral_value'|'nonliteral_evidence'|'unsupported_option_evidence';
export type ExtractionValidation={proposedUpdates:number;acceptedUpdates:number;rejections:{field:FormationFieldId;reason:ExtractionRejectionReason}[]};
export type Extraction={updates:ProposedUpdate[];modelStatus:'DETERMINISTIC_MOCK'|'OPENAI_STRUCTURED'|'EXTERNAL_BLOCKED';validation?:ExtractionValidation};
export type IntakeField={key:FormationFieldId;label:string;options?:readonly {value:string;label:string}[]};

export function fieldsForJurisdiction(jurisdiction:ConversationJurisdiction):readonly IntakeField[]{if(jurisdiction==='US-DE')return DE_FIELDS;if(jurisdiction==='EE')return EE_FIELDS;return WY_FIELDS;}
export function intakeSchemaFor(jurisdiction:ConversationJurisdiction):z.ZodType<Record<string,string>>{if(jurisdiction==='US-DE')return delawareIntakeSchema as z.ZodType<Record<string,string>>;if(jurisdiction==='EE')return estoniaIntakeSchema as z.ZodType<Record<string,string>>;return wyomingIntakeSchema as z.ZodType<Record<string,string>>;}
export function initialConversationState(jurisdiction:ConversationJurisdiction='US-WY'):Record<string,string>{if(jurisdiction==='US-DE')return emptyDelawareIntake();if(jurisdiction==='EE')return emptyEstoniaIntake();return emptyWyomingIntake();}
function updateSchemaFor(jurisdiction:ConversationJurisdiction){const fields=fieldsForJurisdiction(jurisdiction);const ids=fields.map(field=>field.key) as [FormationFieldId,...FormationFieldId[]];return z.object({updates:z.array(z.object({field:z.enum(ids),value:z.string().trim().min(1).max(500),evidence:z.string().trim().min(1).max(500)}).strict()).max(fields.length)}).strict();}
export const updateSchema=updateSchemaFor('US-WY');

export function safeSyntheticMessage(value:unknown){
 const message=z.string().trim().min(1).max(2000).parse(value);
 if(/\b(?:\d{3}-\d{2}-\d{4}|passport|pasaporte|personal identification code|c[oó]digo personal|isikukood|pin[- ]?2|smart-id\s+(?:pin|code|c[oó]digo)|id[- ]?card\s+(?:number|n[uú]mero)|api[_ -]?key|secret(?:o)?|contrase(?:ñ|n)a|fedex\s+account|ups\s+account)\b/i.test(message))throw new DomainError('SENSITIVE_DATA_REJECTED','No ingreses identificadores, pasaportes, PIN, cuentas de mensajería, credenciales ni secretos en el laboratorio.');
 for(const email of message.match(/[\w.+-]+@[\w.-]+/g)??[])if(!email.toLowerCase().endsWith('.test'))throw new DomainError('SYNTHETIC_EMAIL_REQUIRED','Usa únicamente correos ficticios con dominio .test.');
 return message;
}

const normalized=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const correctionIntent=/\b(?:corregir|corrijo|correccion|cambiar|cambio|actualizar|actualizo|nuevo|nueva|correct|change|replace|update)\b/;
const optionEvidence:Record<string,readonly string[]>={yes:['si','yes'],no:['no'],unknown:['unknown','por confirmar','no se'],ordinary:['ordinary','ordinaria'],close:['close'],series:['series'],dao:['dao']};
const supportsCanonicalOption=(value:string,evidence:string)=>optionEvidence[value]?.some(alias=>normalized(evidence)===alias||normalized(evidence).startsWith(`${alias} `))??false;

export function permittedFieldsForMessage(intake:unknown,message:string,batchSize=3,jurisdiction:ConversationJurisdiction='US-WY'):FormationFieldId[]{
 const fields=fieldsForJurisdiction(jurisdiction);const parsed=intakeSchemaFor(jurisdiction).parse(intake);const pending=fields.filter(field=>!parsed[field.key]).slice(0,batchSize).map(field=>field.key);const text=normalized(message);
 if(!correctionIntent.test(text))return pending;const confirmed=fields.filter(field=>Boolean(parsed[field.key])&&(text.includes(normalized(field.label))||text.includes(normalized(field.key)))).map(field=>field.key);return confirmed.length?confirmed:pending;
}
export function deterministicExtract(message:string,jurisdiction:ConversationJurisdiction='US-WY'):Extraction{
 const separator=message.indexOf(':');if(separator<1)return{updates:[],modelStatus:'EXTERNAL_BLOCKED'};const name=normalized(message.slice(0,separator));const field=fieldsForJurisdiction(jurisdiction).find(item=>normalized(item.key)===name||normalized(item.label)===name);const value=message.slice(separator+1).trim();if(!field||!value)return{updates:[],modelStatus:'EXTERNAL_BLOCKED'};return{updates:[{field:field.key,value,evidence:value}],modelStatus:'DETERMINISTIC_MOCK'};
}
export function verifyExtraction(message:string,input:unknown,modelStatus:Extraction['modelStatus'],allowedFields?:readonly FormationFieldId[],jurisdiction:ConversationJurisdiction='US-WY'):Extraction{
 const parsed=updateSchemaFor(jurisdiction).parse(input);const seen=new Set<string>();const allowed=allowedFields?new Set<string>(allowedFields):null;const updates:ProposedUpdate[]=[];const rejections:ExtractionValidation['rejections']=[];const fields=fieldsForJurisdiction(jurisdiction);
 for(const update of parsed.updates){const definition=fields.find(field=>field.key===update.field);const canonicalOption=Boolean(definition?.options?.some(option=>option.value===update.value));const literalValue=message.includes(update.value);let reason:ExtractionRejectionReason|undefined;if(seen.has(update.field))reason='duplicate_field';else if(allowed&&!allowed.has(update.field))reason='disallowed_field';else if(!literalValue&&!canonicalOption)reason='nonliteral_value';else if(!literalValue&&!message.includes(update.evidence))reason='nonliteral_evidence';else if(!literalValue&&canonicalOption&&!supportsCanonicalOption(update.value,update.evidence))reason='unsupported_option_evidence';seen.add(update.field);if(reason){rejections.push({field:update.field,reason});continue;}updates.push({...update,evidence:literalValue?update.value:update.evidence});}
 return{updates,modelStatus,validation:{proposedUpdates:parsed.updates.length,acceptedUpdates:updates.length,rejections}};
}
export function applyConfirmedPatch(current:unknown,updates:ProposedUpdate[],jurisdiction:ConversationJurisdiction='US-WY'):Record<string,string>{const schema=intakeSchemaFor(jurisdiction);const next={...schema.parse(current)};for(const update of updates)next[update.field]=update.value;return schema.parse(next);}
export function nextMissing(intake:unknown,jurisdiction:ConversationJurisdiction='US-WY'){const parsed=intakeSchemaFor(jurisdiction).parse(intake);return fieldsForJurisdiction(jurisdiction).find(field=>!parsed[field.key])??null;}
export function assistantFor(intake:unknown,updates:ProposedUpdate[],jurisdiction:ConversationJurisdiction='US-WY'){const fields=fieldsForJurisdiction(jurisdiction);if(updates.length){const summary=updates.map(update=>`${fields.find(field=>field.key===update.field)!.label}: ${update.value}`).join('; ');return`Entendí ${summary}. Confirma estos datos antes de guardarlos.`;}const next=nextMissing(intake,jurisdiction);return next?`No identifiqué un dato para guardar. Responde “${next.label}: valor”. En modo conectado también podrás expresarlo en lenguaje natural.`:'No identifiqué cambios. Los datos están completos para preparar una revisión interna.';}
