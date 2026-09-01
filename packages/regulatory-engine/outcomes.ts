import {z} from 'zod';
const money=z.number().int().nonnegative().max(1000000000);const months=z.number().int().min(1).max(36);
const schemas:Record<string,z.ZodType>={
 DE_ANNUAL_TAX:z.object({amountMinor:money,currency:z.literal('USD'),month:z.number().int().min(1).max(12),day:z.number().int().min(1).max(28),annualReportRequired:z.boolean(),latePenaltyMinor:money,monthlyInterestRate:z.number().min(0).max(1),interestBase:z.literal('tax_and_penalty')}).strict(),
 WY_ANNUAL_REPORT:z.object({minimumMinor:money,assetRate:z.number().min(0).max(1),currency:z.literal('USD'),anniversaryMonthDay:z.number().int().min(1).max(28)}).strict(),
 EE_ANNUAL_REPORT:z.object({monthsAfterYearEnd:months,currency:z.literal('EUR')}).strict(),
 GB_CONFIRMATION_TIMING:z.object({reviewMonths:months,filingWindowDays:z.number().int().min(1).max(90)}).strict(),
 GB_ACCOUNTS:z.object({firstAccountsMonths:months,subsequentAccountsMonths:months,corporationTaxMonths:months,corporationTaxDays:z.number().int().min(0).max(30),taxReturnMonths:months}).strict(),
};
for(const code of ['WY_FORMATION_FEE','EE_FORMATION_FEE','EE_ERESIDENCY_FEE','GB_FORMATION_FEE','GB_CONFIRMATION'])schemas[code]=z.object({amountMinor:money,currency:z.enum(['USD','EUR','GBP'])}).strict();
export function validateOutcome(code:string,value:unknown):Record<string,unknown>{return (schemas[code]??z.record(z.string(),z.unknown())).parse(value) as Record<string,unknown>;}
