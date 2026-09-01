import { DomainError,type IntegrationStatus,type Jurisdiction } from '../domain';
export interface RegistrationAdapter {status:IntegrationStatus; submit(input:{caseId:string;jurisdiction:Jurisdiction;name:string}):Promise<{reference:string;status:'submitted'|'registered';mock:boolean}>;}
export class MockRegistrationAdapter implements RegistrationAdapter {
 readonly status='SANDBOX' as const;
 async submit(input:{caseId:string;jurisdiction:Jurisdiction;name:string}) {return {reference:`MOCK-${input.jurisdiction}-${input.caseId.slice(0,8).toUpperCase()}`,status:'registered' as const,mock:true};}
}
export class BlockedRegistrationAdapter implements RegistrationAdapter {
 readonly status='EXTERNAL_BLOCKED' as const;
 constructor(private reason:string){}
 async submit():Promise<never>{throw new DomainError('EXTERNAL_BLOCKED',this.reason,503);}
}
export function requireRikPrerequisites(p:{xRoad:boolean;rikTesting:boolean;rikAgreement:boolean;businessServicesLicense:boolean}) {
 if(!Object.values(p).every(Boolean))throw new DomainError('EXTERNAL_BLOCKED','RIK requiere X-Road, pruebas, acuerdo y licencia',409);
}
export function registrationAdapter(j:Jurisdiction,sandbox:boolean):RegistrationAdapter {
 return sandbox?new MockRegistrationAdapter():new BlockedRegistrationAdapter(`${j}: requiere credenciales, contrato y autorización; usa ruta guiada`);
}
export interface IdentityAdapter {status:IntegrationStatus; verify(reference:string):Promise<{status:'review_required'|'verified';mock:boolean;reference:string}>;}
export const mockIdentity:IdentityAdapter={status:'SANDBOX',async verify(reference){return{status:'review_required',mock:true,reference:`MOCK-KYC-${reference}`};}};
export const integrationCatalog=[
 {code:'supabase',name:'Supabase Auth y Storage',environment:'NEXT_PUBLIC_SUPABASE_URL'},
 {code:'stripe',name:'Stripe Checkout y Billing',environment:'STRIPE_SECRET_KEY'},
 {code:'openai',name:'OpenAI (servidor)',environment:'OPENAI_API_KEY'},
 {code:'identity',name:'KYC y screening',environment:'KYC_PROVIDER_SECRET'},
 {code:'email',name:'Notificaciones por correo',environment:'EMAIL_PROVIDER_API_KEY'},
 {code:'delaware',name:'Partner Delaware',environment:'DELAWARE_PARTNER_API_KEY'},
 {code:'wyoming',name:'Partner Wyoming',environment:'WYOMING_PARTNER_API_KEY'},
 {code:'estonia',name:'RIK / partner Estonia',environment:'ESTONIA_PARTNER_API_KEY'},
 {code:'uk',name:'ACSP Reino Unido',environment:'UK_ACSP_PARTNER_API_KEY'},
] as const;
