import { selectRule,factsFor,type Registry,type Fact } from '../regulatory-engine';
import type { Jurisdiction,Questionnaire } from '../domain';
export type RegulatoryAnswer={answer:string;facts:Fact[];requires_human_review:boolean;next_actions:string[];sandbox:boolean;topic:string};
export function classifyTopic(question:string):string{
 if(/\bboi\b|fincen|beneficiari/i.test(question))return 'beneficial_ownership';
 if(/5472|1120|ein|impuest|fiscal|tax/i.test(question))return 'tax';
 if(/identidad|director|psc|identity/i.test(question))return 'identity';
 if(/contacto|domicilio|agente|address/i.test(question))return 'registered_office';
 if(/anual|annual|venc|plazo|deadline|report|confirmation/i.test(question))return 'annual_filing';
 if(/precio|costo|coste|tasa|fee/i.test(question))return 'fee';
 return 'formation_requirement';
}
export function answerRegulatoryQuestion(question:string,context:{jurisdiction:Jurisdiction;questionnaire?:Questionnaire},registry:Registry,at=new Date()):RegulatoryAnswer {
 const topic=classifyTopic(question);const j=context.jurisdiction;
 let codes:string[]=[];
 if(topic==='beneficial_ownership')codes=j.startsWith('US')?['US_BOI']:j==='GB'?['GB_IDENTITY']:[];
 if(topic==='tax')codes=j.startsWith('US')?['US_EIN','US_FOREIGN_OWNED']:j==='EE'?['EE_TAX_WARNING']:['GB_TAX_START','GB_ACCOUNTS'];
 if(topic==='annual_filing')codes=j==='US-DE'?['DE_ANNUAL_TAX']:j==='US-WY'?['WY_ANNUAL_REPORT','WY_LATE']:j==='EE'?['EE_ANNUAL_REPORT']:['GB_CONFIRMATION','GB_CONFIRMATION_TIMING','GB_ACCOUNTS'];
 if(topic==='fee')codes=j==='US-DE'?[]:j==='US-WY'?['WY_FORMATION_FEE']:j==='EE'?['EE_FORMATION_FEE','EE_ERESIDENCY_FEE']:['GB_FORMATION_FEE'];
 if(topic==='identity')codes=j==='GB'?['GB_IDENTITY']:j==='EE'?['EE_ERESIDENCY_FEE']:[];
 if(topic==='registered_office')codes=j==='US-DE'?['DE_AGENT']:j==='US-WY'?['WY_AGENT']:j==='EE'?['EE_CONTACT']:['GB_ACSP'];
 if(topic==='formation_requirement')codes=j==='US-DE'?['DE_AGENT','US_EIN']:j==='US-WY'?['WY_AGENT','WY_FORMATION_FEE','US_EIN']:j==='EE'?['EE_FORMATION_FEE','EE_CONTACT','EE_API']:['GB_FORMATION_FEE','GB_IDENTITY','GB_ACSP'];
 const rules=codes.map(c=>selectRule(registry,c,at));
 if(!codes.length||rules.some(r=>!r))return{answer:'Este requisito está en revisión: no hay evidencia oficial activa, suficiente y vigente para responder con seguridad. Si una fuente cambió, debe ser revisada antes de usarla.',facts:[],requires_human_review:true,next_actions:['Solicitar revisión de cumplimiento','Puedes continuar reuniendo información sin presentar trámites'],sandbox:registry.sandbox,topic};
 const valid=rules.filter(r=>r!==null);const facts=valid.flatMap(r=>factsFor(r,registry));
 const answer=valid.map(r=>{const amount=r.outcome.amountMinor;return r.explanation+(typeof amount==='number'&&typeof r.outcome.currency==='string'?` Importe en la versión consultada: ${new Intl.NumberFormat('es-419',{style:'currency',currency:r.outcome.currency}).format(amount/100)}.`:'');}).join('\n\n');
 return {answer,facts,requires_human_review:valid.some(r=>r.requiresHumanReview),next_actions:valid.some(r=>r.requiresHumanReview)?['Coordinar revisión profesional antes de tomar una decisión']:['Revisar fuentes y completar los requisitos del expediente'],sandbox:registry.sandbox,topic};
}
export const regulatoryTool={type:'function',name:'retrieve_verified_rules',description:'Retrieve only current, reviewed official-source-backed regulatory facts. No access to document instructions or arbitrary URLs.',strict:true,parameters:{type:'object',properties:{jurisdiction:{type:'string',enum:['US-DE','US-WY','EE','GB']},question:{type:'string'}},required:['jurisdiction','question'],additionalProperties:false}} as const;
// The tool result is the factual boundary. The LLM is never the source of legal facts.
export interface RegulatoryModelAdapter {status:'EXTERNAL_BLOCKED'|'LIVE';route(question:string):Promise<{jurisdiction:Jurisdiction;question:string}>;}
