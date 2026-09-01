import Stripe from 'stripe';
import { DomainError } from '../domain';
export interface CheckoutInput {orderId:string;organizationId:string;caseId:string;amountMinor:number;currency:string;origin:string;idempotencyKey:string}
export interface CheckoutAdapter {mode:'STRIPE_TEST'|'SANDBOX';create(input:CheckoutInput):Promise<{url:string;sessionId:string}>}
export class SandboxCheckout implements CheckoutAdapter {
 readonly mode='SANDBOX' as const;
 async create(input:CheckoutInput){return{url:`/checkout/${input.orderId}`,sessionId:`mock_${input.orderId}`};}
}
export class StripeTestCheckout implements CheckoutAdapter {
 readonly mode='STRIPE_TEST' as const;private stripe:Stripe;
 constructor(secret:string){if(!secret.startsWith('sk_test_'))throw new DomainError('LIVE_PAYMENT_DISABLED','El MVP solo admite Stripe test',503);this.stripe=new Stripe(secret);}
 async create(input:CheckoutInput){const s=await this.stripe.checkout.sessions.create({mode:'payment',line_items:[{price_data:{currency:input.currency.toLowerCase(),unit_amount:input.amountMinor,product_data:{name:'Preparación y coordinación de constitución',description:'Solo tarifa de plataforma. No incluye tasas de gobierno ni servicios de partners.'}},quantity:1}],client_reference_id:input.orderId,metadata:{order_id:input.orderId,organization_id:input.organizationId,case_id:input.caseId},success_url:`${input.origin}/casos/${input.caseId}?payment=processing`,cancel_url:`${input.origin}/casos/${input.caseId}?payment=cancelled`},{idempotencyKey:input.idempotencyKey});if(!s.url)throw new Error('Checkout URL unavailable');return{url:s.url,sessionId:s.id};}
 async subscription(input:{subscriptionId:string;organizationId:string;companyId:string;priceId:string;origin:string;idempotencyKey:string}){const session=await this.stripe.checkout.sessions.create({mode:'subscription',line_items:[{price:input.priceId,quantity:1}],subscription_data:{metadata:{local_subscription_id:input.subscriptionId,organization_id:input.organizationId,company_id:input.companyId}},metadata:{organization_id:input.organizationId,company_id:input.companyId},success_url:`${input.origin}/facturacion?subscription=processing`,cancel_url:`${input.origin}/facturacion`},{idempotencyKey:input.idempotencyKey});if(!session.url)throw new Error('Subscription URL unavailable');return {url:session.url,sessionId:session.id};}
}
export function verifyStripeEvent(raw:string,signature:string,secret:string,webhookSecret:string){if(!secret.startsWith('sk_test_'))throw new DomainError('LIVE_PAYMENT_DISABLED','Solo Stripe test',503);const event=new Stripe(secret).webhooks.constructEvent(raw,signature,webhookSecret);if(event.livemode)throw new DomainError('LIVE_PAYMENT_DISABLED','Evento live rechazado',400);return event;}
