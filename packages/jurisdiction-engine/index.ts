import { PRODUCTS } from './catalog';
export { PRODUCTS } from './catalog';
import { type Jurisdiction, type Questionnaire } from '../domain';
import { factsFor,selectRule,type Fact,type Registry } from '../regulatory-engine';
export type Recommendation={jurisdiction:Jurisdiction;eligibility:'eligible'|'possible'|'review_required'|'unsupported';score:number;reasons_for:string[];reasons_against:string[];prerequisites:string[];formation_steps:typeof PRODUCTS["US-DE"]["workflow"];government_fees:{title:string;amountMinor:number|null;currency:string;verified:boolean}[];mandatory_partner_services:string[];annual_obligations:string[];warnings:string[];sources:Fact[]};
export function estoniaContactRequirement(q:Pick<Questionnaire,'boardInEstonia'|'legalAddressInEstonia'>) { return !q.boardInEstonia && !q.legalAddressInEstonia; }
export function recommend(q:Questionnaire,registry:Registry,at=new Date()):Recommendation[] {
 return (Object.keys(PRODUCTS) as Jurisdiction[]).map(j=>{
  const p=PRODUCTS[j];let score=60;const forReasons:string[]=[];const against:string[]=[];const warnings=['La aprobación del registro, KYC, banco o Stripe depende de terceros.'];const prerequisites=['Identidad y titularidad documentadas','Revisión de actividad y jurisdicciones de operación'];
  let eligibility:Recommendation['eligibility']='possible';
  if(q.regulated || q.crypto){eligibility='review_required';against.push('Actividad regulada o exposición cripto: revisión especializada');score-=25;}
  if(q.hasEmployees || q.physicalOffice || q.inventory){warnings.push('Empleados, inventario o presencia física pueden activar obligaciones locales.');score-=5;}
  if(j.startsWith('US') && q.requiresUsd){score+=15;forReasons.push('Tu operación necesita servicios en USD');}
  if(j==='EE' && q.requiresEur){score+=15;forReasons.push('Tu operación necesita servicios en EUR');}
  if(q.customerCountries.includes(j==='GB'?'GB':j==='EE'?'EE':'US')){score+=5;forReasons.push('Coincide con parte de la geografía de tus clientes');}
  if(j==='US-DE' && q.plansFundraising){warnings.push('Si buscas inversión institucional, revisar si una LLC es apropiada; una corporación no está incluida en este MVP.');score-=10;}
  if(j==='EE' && !q.eResident){prerequisites.push('Obtener identidad digital compatible o coordinar otra ruta con un profesional');against.push('Sin e-Residency no prometemos constitución digital inmediata');score-=12;}
  if(j==='EE' && q.eResident){score+=10;forReasons.push('Ya cuentas con e-Residency declarada; falta validar credenciales y firmas');}
  if(j==='GB' && (!q.directorsVerified || !q.pscVerified))prerequisites.push('Verificar directores y revisar por separado las declaraciones de PSC');
  if(q.foreignOwnedDisregarded && j.startsWith('US'))warnings.push('Revisión fiscal de posible Form 5472 / Form 1120 pro forma.');
  const codes=[p.annualRule,...(p.formationFeeRule?[p.formationFeeRule]:[]),...(j.startsWith('US')?['US_BOI','US_EIN','US_FOREIGN_OWNED']:j==='GB'?['GB_IDENTITY','GB_CONFIRMATION_TIMING']:['EE_CONTACT','EE_TAX_WARNING'])];
  const rules=codes.map(c=>selectRule(registry,c,at));
  if(rules.some(r=>!r)){eligibility='review_required';warnings.push('Hay requisitos sin evidencia vigente. La recomendación no autoriza presentar ni cobrar tasas sin verificar.');}
  const fee=p.formationFeeRule?selectRule(registry,p.formationFeeRule,at):null;
  const annual=selectRule(registry,p.annualRule,at);
  return {jurisdiction:j,eligibility,score:Math.max(0,Math.min(100,score)),reasons_for:forReasons.length?forReasons:['Ruta disponible para evaluación de tu perfil'],reasons_against:against,prerequisites,formation_steps:p.workflow,government_fees:[{title:'Tasa de constitución',amountMinor:typeof fee?.outcome.amountMinor==='number'?fee.outcome.amountMinor:null,currency:p.currency,verified:!!fee}],mandatory_partner_services:j.startsWith('US')?['Agente registrado (cotización pendiente)']:j==='EE'?(estoniaContactRequirement(q)?['Persona de contacto con licencia (cotización pendiente)']:['Validar domicilio legal']):['Domicilio registrado / ACSP cuando corresponda'],annual_obligations:annual?[annual.explanation]:['Requisitos anuales pendientes de verificación'],warnings,sources:rules.filter(r=>r!==null).flatMap(r=>factsFor(r,registry))};
 }).sort((a,b)=>b.score-a.score);
}

