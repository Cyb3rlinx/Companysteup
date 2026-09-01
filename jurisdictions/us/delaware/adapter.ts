import { registrationAdapter } from '../../../packages/integrations';
import type { Questionnaire } from '../../../packages/domain';
export const delawareAdapter=(sandbox:boolean)=>registrationAdapter('US-DE',sandbox);
export function einRoute(q:Questionnaire){return q.operatingCountries.includes('US')?'REVIEW_PRINCIPAL_PLACE':'SS4_INTERNATIONAL';}
