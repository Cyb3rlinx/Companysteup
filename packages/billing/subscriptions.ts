import type Stripe from 'stripe';
import {z} from 'zod';
import {DomainError} from '../domain';
import {owned,type Actor} from '../application';
import type {Repository,Row,Operation} from '../persistence';
export async function prepareSubscription(repo:Repository,actor:Actor,companyId:string){
 const company=owned((await repo.list('companies',{id:companyId}))[0] as Row&{organization_id:string},actor);
 const prior=(await repo.list('subscriptions',{company_id:companyId})).find(s=>!['canceled','incomplete_expired'].includes(String(s.status)));if(prior)return prior;
 const product=(await repo.list('billing_products',{code:'COMPLIANCE_ANNUAL',active:true}))[0];if(!product)throw new DomainError('PRICE_UNAVAILABLE','Producto de cumplimiento no disponible',409);
 const row={id:crypto.randomUUID(),organization_id:company.organization_id,company_id:companyId,billing_product_id:product.id,status:'pending'};await repo.atomic([{kind:'insert',table:'subscriptions',data:row}]);return row;
}
export async function activateSandboxSubscription(repo:Repository,actor:Actor,companyId:string,sandbox:boolean){
 if(!sandbox)throw new DomainError('MOCK_DENIED','Suscripción simulada deshabilitada',403);
 const sub=await prepareSubscription(repo,actor,companyId);if(sub.status==='sandbox_active')return{subscribed:true,duplicate:true};if(sub.status!=='pending')throw new DomainError('SUBSCRIPTION_STATE','La suscripción ya está en proceso',409);
 const end=new Date();end.setUTCFullYear(end.getUTCFullYear()+1);
 await repo.atomic([{kind:'update',table:'subscriptions',where:{id:sub.id,status:'pending'},data:{status:'sandbox_active',current_period_end:end.toISOString()}},{kind:'insert',table:'audit_logs',data:{organization_id:sub.organization_id,actor_user_id:actor.id,action:'SANDBOX_SUBSCRIPTION_ACTIVATED',resource_type:'subscriptions',resource_id:sub.id}}]);return{subscribed:true,duplicate:false};
}
export async function applySubscriptionEvent(repo:Repository,event:Stripe.Event,payloadHash:string,expectedPrice:string){
 if(!['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type))return{ignored:true};
 if(event.livemode)throw new DomainError('LIVE_PAYMENT_DISABLED','Solo Stripe test',400);
 if((await repo.list('webhook_events',{id:event.id})).length)return{duplicate:true};
 const subscription=event.data.object as Stripe.Subscription;const id=z.uuid().parse(subscription.metadata.local_subscription_id);
 const local=(await repo.list('subscriptions',{id}))[0];
 if(!local||local.organization_id!==subscription.metadata.organization_id||local.company_id!==subscription.metadata.company_id||(local.stripe_subscription_id&&local.stripe_subscription_id!==subscription.id))throw new DomainError('SUBSCRIPTION_MISMATCH','La suscripción no coincide con la organización',409);
 if(!expectedPrice||subscription.items.data.length!==1||subscription.items.data[0].price.id!==expectedPrice)throw new DomainError('PRICE_MISMATCH','El precio no coincide con el plan autorizado',409);
 const operations:Operation[]=[{kind:'insert',table:'webhook_events',data:{id:event.id,provider:'stripe',payload_hash:payloadHash}}];
 const older=Number(local.last_event_created??0)>event.created||(local.status==='canceled'&&event.type!=='customer.subscription.deleted');
 if(!older&&Number(local.last_event_created)>0&&Number(local.last_event_created)===event.created)throw new DomainError('SUBSCRIPTION_RECONCILIATION','Eventos del mismo segundo requieren reconciliación con Stripe',409);
 if(!older)operations.push({kind:'update',table:'subscriptions',where:{id,last_event_created:local.last_event_created},data:{stripe_subscription_id:subscription.id,stripe_customer_id:typeof subscription.customer==='string'?subscription.customer:subscription.customer.id,status:event.type==='customer.subscription.deleted'?'canceled':subscription.status,current_period_end:new Date(subscription.items.data[0].current_period_end*1000).toISOString(),last_event_created:event.created}});
 await repo.atomic(operations);return{updated:!older,ignored:older};
}
