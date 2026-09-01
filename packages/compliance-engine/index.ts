import type { Jurisdiction } from '../domain';
import { selectRule,factsFor,type Registry,type Fact } from '../regulatory-engine';
export type CompanyInput={id:string;jurisdiction:Jurisdiction;incorporationDate:string;periodStart?:string;financialYearEnd:string;wyomingAssetsMinor:number;foreignOwnedDisregarded:boolean;lastConfirmationDate?:string;taxPeriodEnd?:string};
export type Obligation={code:string;title:string;periodStart:string;periodEnd:string;dueDate:string|null;amountMinor:number|null;currency:string;status:'pending'|'review_required';ruleVersionId:string|null;evidence:Fact[];notes:string};
export function addMonths(date:string,months:number) {
 const d=new Date(`${date}T12:00:00Z`);const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);
}
export function addDays(date:string,days:number) {const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function wyomingTax(assetsMinor:number,minimumMinor:number,rate:number) {if(!Number.isSafeInteger(assetsMinor)||assetsMinor<0)throw new Error('Activos inválidos');return Math.max(minimumMinor,Math.ceil(assetsMinor*rate));}
export function generateObligations(company:CompanyInput,registry:Registry,at=new Date()):Obligation[] {
 const list:Obligation[]=[];const year=Number(company.financialYearEnd.slice(0,4));
 const make=(code:string,title:string,ruleCode:string,calc:(o:Record<string,unknown>)=>{date:string|null;amount?:number|null;notes?:string})=>{
  const rule=selectRule(registry,ruleCode,at);const result=rule?calc(rule.outcome):{date:null};
  list.push({code,title,periodStart:company.incorporationDate,periodEnd:company.financialYearEnd,dueDate:result.date,amountMinor:result.amount??null,currency:company.jurisdiction==='GB'?'GBP':company.jurisdiction==='EE'?'EUR':'USD',status:!rule || result.date===null?'review_required':'pending',ruleVersionId:rule?.id??null,evidence:rule?factsFor(rule,registry):[],notes:result.notes??(rule?rule.explanation:'Sin regla verificada vigente. Se requiere revisión; no se inventa un vencimiento.')});
 };
 if(company.jurisdiction==='US-DE')make('DE_ANNUAL_TAX','Impuesto anual de Delaware','DE_ANNUAL_TAX',o=>({date:`${year+1}-${String(o.month).padStart(2,'0')}-${String(o.day).padStart(2,'0')}`,amount:Number(o.amountMinor)}));
 if(company.jurisdiction==='US-WY')make('WY_ANNUAL_REPORT','Informe anual de Wyoming','WY_ANNUAL_REPORT',o=>({date:`${Math.max(year+1,Number(company.incorporationDate.slice(0,4))+1)}-${company.incorporationDate.slice(5,7)}-${String(o.anniversaryMonthDay).padStart(2,'0')}`,amount:wyomingTax(company.wyomingAssetsMinor,Number(o.minimumMinor),Number(o.assetRate))}));
 if(company.jurisdiction==='EE')make('EE_ANNUAL_REPORT','Informe anual de Estonia','EE_ANNUAL_REPORT',o=>({date:addMonths(company.financialYearEnd,Number(o.monthsAfterYearEnd))}));
 if(company.jurisdiction==='GB') {
  make('GB_CONFIRMATION','Confirmation statement','GB_CONFIRMATION_TIMING',o=>{
   if(company.periodStart&&company.periodStart>company.incorporationDate&&!company.lastConfirmationDate)return {date:null,notes:'Confirma la fecha de la última confirmation statement para calcular el siguiente período.'};
   const reviewEnd=addDays(addMonths(company.lastConfirmationDate??company.incorporationDate,Number(o.reviewMonths)),-1);
   const fee=selectRule(registry,'GB_CONFIRMATION',at);
   return {date:addDays(reviewEnd,Number(o.filingWindowDays)),amount:typeof fee?.outcome.amountMinor==='number'?fee.outcome.amountMinor:null,notes:`Fin del período de revisión: ${reviewEnd}. La tasa depende del período de pago y la regla vigente.`};
  });
  const feeRule=selectRule(registry,'GB_CONFIRMATION',at);if(feeRule)list[list.length-1].evidence.push(...factsFor(feeRule,registry));
  const first=!company.periodStart||company.periodStart===company.incorporationDate;
  make('GB_ACCOUNTS',first?'Primeras cuentas anuales':'Cuentas anuales','GB_ACCOUNTS',o=>({date:first?addMonths(company.incorporationDate,Number(o.firstAccountsMonths)):addMonths(company.financialYearEnd,Number(o.subsequentAccountsMonths)),notes:'Reconfirmar período contable y excepciones antes de presentar.'}));
  make('GB_TAX_PAYMENT','Corporation Tax: pago','GB_ACCOUNTS',o=>({date:company.taxPeriodEnd?addDays(addMonths(company.taxPeriodEnd,Number(o.corporationTaxMonths)),Number(o.corporationTaxDays)):null,notes:'Se requiere período fiscal confirmado; el primer período puede dividirse. No equivale a las cuentas anuales.'}));
  make('GB_TAX_RETURN','Company Tax Return','GB_ACCOUNTS',o=>({date:company.taxPeriodEnd?addMonths(company.taxPeriodEnd,Number(o.taxReturnMonths)):null,notes:'Validar período fiscal y obligación con un profesional.'}));
 }
 if(company.jurisdiction.startsWith('US')&&company.foreignOwnedDisregarded)make('US_FOREIGN_OWNED','Revisión de Form 5472 / 1120 pro forma','US_FOREIGN_OWNED',()=>({date:null,notes:'HIGH: confirmar clasificación, operaciones reportables y período fiscal. No se calcula un vencimiento sin esos datos.'}));
 if(company.jurisdiction==='EE')make('EE_TAX_REVIEW','Revisión fiscal internacional','EE_TAX_WARNING',()=>({date:null}));
 return list;
}
export function remindersDue(obligations:(Obligation & {id:string})[],today:string) {
 return obligations.flatMap(o=>{if(!o.dueDate||o.status!=='pending')return[];const days=Math.round((Date.parse(o.dueDate)-Date.parse(today))/86400000);return [30,7,1,0].includes(days)?[{obligationId:o.id,key:`${o.id}:${o.dueDate}:${days}`,title:days===0?'Vence hoy':`Vence en ${days} días`,message:o.title}]:[];});
}
export function calendarIcs(obligations:(Obligation & {id:string})[]) {
 const escape=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const events=obligations.filter(o=>o.dueDate).map(o=>['BEGIN:VEVENT',`UID:${o.id}@company-setup-os`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${o.dueDate!.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${addDays(o.dueDate!,1).replace(/-/g,'')}`,`SUMMARY:${escape(o.title)}`,`DESCRIPTION:${escape(o.notes)}`,'END:VEVENT'].join('\r\n'));
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CompanySetupOS//ES','CALSCALE:GREGORIAN',...events,'END:VCALENDAR'].join('\r\n');
}
