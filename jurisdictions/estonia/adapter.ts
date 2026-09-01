import { registrationAdapter,requireRikPrerequisites } from '../../packages/integrations';
import type { Questionnaire } from '../../packages/domain';
export const estoniaAdapter=(sandbox:boolean)=>registrationAdapter('EE',sandbox);
export function estoniaRoute(q:Questionnaire){return q.eResident?'GUIDED_DIGITAL':'ONBOARDING_THEN_IDENTITY_OR_PARTNER';}
export { requireRikPrerequisites };
