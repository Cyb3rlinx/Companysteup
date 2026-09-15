import type {Jurisdiction} from '../domain';
import {WYOMING_AGENT_EVALUATION_VERSION} from '../agent-evaluation';
import {DELAWARE_AGENT_EVALUATION_VERSION} from '../agent-evaluation/delaware';
import {ESTONIA_AGENT_EVALUATION_VERSION} from '../agent-evaluation/estonia';
import {UK_AGENT_EVALUATION_VERSION} from '../agent-evaluation/uk';
import {WY_FIELDS} from '../formation-packet/catalog';
import {DE_FIELDS} from '../formation-packet/delaware-catalog';
import {EE_FIELDS} from '../formation-packet/estonia-catalog';
import {UK_FIELDS} from '../formation-packet/uk-catalog';

export const AGENT_REGRESSION_VERSION='2026-09-15.1';
type ConnectedEvidence={jurisdiction:Jurisdiction;label:string;connectedEvidenceVersion:string;currentEvaluationVersion:string;evaluatedAt:string;requestCount:number;requestMaximum:number;totalTokens:number;passedScenarios:number;totalScenarios:number;externalWrites:number;fieldCount:number};

const evidence:readonly ConnectedEvidence[]=[
 {jurisdiction:'US-WY',label:'Wyoming LLC',connectedEvidenceVersion:'2026-09-14.5',currentEvaluationVersion:WYOMING_AGENT_EVALUATION_VERSION,evaluatedAt:'2026-09-15T15:07:06.935Z',requestCount:49,requestMaximum:60,totalTokens:26988,passedScenarios:4,totalScenarios:4,externalWrites:0,fieldCount:WY_FIELDS.length},
 {jurisdiction:'US-DE',label:'Delaware LLC',connectedEvidenceVersion:'2026-09-14.2',currentEvaluationVersion:DELAWARE_AGENT_EVALUATION_VERSION,evaluatedAt:'2026-09-14T16:11:08.611Z',requestCount:49,requestMaximum:60,totalTokens:26534,passedScenarios:4,totalScenarios:4,externalWrites:0,fieldCount:DE_FIELDS.length},
 {jurisdiction:'EE',label:'Estonia OÜ',connectedEvidenceVersion:'2026-09-15.1',currentEvaluationVersion:ESTONIA_AGENT_EVALUATION_VERSION,evaluatedAt:'2026-09-15T07:35:25.241Z',requestCount:59,requestMaximum:60,totalTokens:32408,passedScenarios:4,totalScenarios:4,externalWrites:0,fieldCount:EE_FIELDS.length},
 {jurisdiction:'GB',label:'UK Ltd',connectedEvidenceVersion:'2026-09-15.1',currentEvaluationVersion:UK_AGENT_EVALUATION_VERSION,evaluatedAt:'2026-09-15T09:56:24.622Z',requestCount:55,requestMaximum:60,totalTokens:30578,passedScenarios:4,totalScenarios:4,externalWrites:0,fieldCount:UK_FIELDS.length},
] as const;

export function agentQualityBaselines(){return evidence.map(item=>{
 const exactVersion=item.connectedEvidenceVersion===item.currentEvaluationVersion;
 const safePass=item.passedScenarios===item.totalScenarios&&item.externalWrites===0;
 return{...item,regressionVersion:AGENT_REGRESSION_VERSION,models:{onboarding:'gpt-5.6-terra',simulator:'gpt-5.6-luna'},evidenceStatus:safePass?'PASSED' as const:'FAILED' as const,operationalStatus:safePass&&exactVersion?'CONNECTED_PASSED_CURRENT' as const:'REVALIDATION_REQUIRED' as const,scope:'SYNTHETIC_EVALUATION_ONLY' as const,filingCapability:'EXTERNAL_BLOCKED' as const};
});}
export type AgentQualityBaseline=ReturnType<typeof agentQualityBaselines>[number];
