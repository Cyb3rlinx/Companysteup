import {z} from 'zod';
import {DomainError} from '../domain';
import {WY_FIELDS,emptyWyomingIntake,wyomingIntakeSchema,type WyomingFieldId,type WyomingIntake} from '../formation-packet/catalog';

export const ONBOARDING_AGENT_VERSION='2026-09-14.2';
export type ProposedUpdate={field:WyomingFieldId;value:string;evidence:string};
export type Extraction={updates:ProposedUpdate[];modelStatus:'DETERMINISTIC_MOCK'|'OPENAI_STRUCTURED'|'EXTERNAL_BLOCKED'};
const ids=WY_FIELDS.map(f=>f.key) as [WyomingFieldId,...WyomingFieldId[]];
export const updateSchema=z.object({updates:z.array(z.object({field:z.enum(ids),value:z.string().trim().min(1).max(500),evidence:z.string().trim().min(1).max(500)}).strict()).max(WY_FIELDS.length)}).strict();

export function safeSyntheticMessage(value:unknown){
 const message=z.string().trim().min(1).max(2000).parse(value);
 if(/\b(?:\d{3}-\d{2}-\d{4}|passport|pasaporte|api[_ -]?key|secret(?:o)?|contrase(?:ñ|n)a)\b/i.test(message))throw new DomainError('SENSITIVE_DATA_REJECTED','No ingreses identificadores, pasaportes, credenciales ni secretos en el laboratorio.');
 for(const email of message.match(/[\w.+-]+@[\w.-]+/g)??[])if(!email.toLowerCase().endsWith('.test'))throw new DomainError('SYNTHETIC_EMAIL_REQUIRED','Usa únicamente correos ficticios con dominio .test.');
 return message;
}

const normalized=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function deterministicExtract(message:string):Extraction{
 const separator=message.indexOf(':');if(separator<1)return{updates:[],modelStatus:'EXTERNAL_BLOCKED'};
 const name=normalized(message.slice(0,separator));const field=WY_FIELDS.find(f=>normalized(f.key)===name||normalized(f.label)===name);
 const value=message.slice(separator+1).trim();if(!field||!value)return{updates:[],modelStatus:'EXTERNAL_BLOCKED'};
 return{updates:[{field:field.key,value,evidence:value}],modelStatus:'DETERMINISTIC_MOCK'};
}

export function verifyExtraction(message:string,input:unknown,modelStatus:Extraction['modelStatus'],allowedFields?:readonly WyomingFieldId[]):Extraction{
 const parsed=updateSchema.parse(input);const seen=new Set<string>();const allowed=allowedFields?new Set<string>(allowedFields):null;
 const updates=parsed.updates.filter(update=>{
  const definition=WY_FIELDS.find(field=>field.key===update.field);const canonicalOption=Boolean(definition&&'options' in definition&&definition.options?.some(option=>option.value===update.value));
  if(seen.has(update.field)||allowed&&!allowed.has(update.field)||!message.includes(update.evidence)||!message.includes(update.value)&&!canonicalOption)return false;
  seen.add(update.field);return true;
 });
 return{updates,modelStatus};
}

export function applyConfirmedPatch(current:unknown,updates:ProposedUpdate[]):WyomingIntake{
 const base=wyomingIntakeSchema.parse(current);const next={...base};
 for(const update of updates)next[update.field]=update.value;
 return wyomingIntakeSchema.parse(next);
}

export function nextMissing(intake:unknown){const parsed=wyomingIntakeSchema.parse(intake);return WY_FIELDS.find(field=>!parsed[field.key])??null;}
export function initialConversationState(){return emptyWyomingIntake();}
export function assistantFor(intake:unknown,updates:ProposedUpdate[]){
 if(updates.length){const summary=updates.map(u=>`${WY_FIELDS.find(f=>f.key===u.field)!.label}: ${u.value}`).join('; ');return `Entendí ${summary}. Confirma estos datos antes de guardarlos.`;}
 const next=nextMissing(intake);return next?`No identifiqué un dato para guardar. Responde “${next.label}: valor”. En modo conectado también podrás expresarlo en lenguaje natural.`:'No identifiqué cambios. Los datos están completos para preparar una revisión interna.';
}
