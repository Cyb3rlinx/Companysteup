import { registrationAdapter } from '../../../packages/integrations';
export const wyomingAdapter=(sandbox:boolean)=>registrationAdapter('US-WY',sandbox);
export { wyomingTax } from '../../../packages/compliance-engine';
