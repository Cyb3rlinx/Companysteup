import { registrationAdapter } from '../../packages/integrations';
export const ukAdapter=(sandbox:boolean)=>registrationAdapter('GB',sandbox);
export function ukFilingRoute(acspVerified:boolean,agreementActive:boolean){return acspVerified&&agreementActive?'VERIFIED_ACSP':'CUSTOMER_SELF_FILING';}
