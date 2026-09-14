import {expect,test} from 'vitest';
import {DE_FIELDS} from '../../packages/formation-packet/delaware-catalog';
import {DELAWARE_EVALUATION_SCENARIOS,assessPatch,deterministicClientMessage,syntheticDelawarePersona} from '../../packages/agent-evaluation/delaware';

test('Delaware evaluator has four bounded scenarios and exact synthetic facts',()=>{
 const facts=syntheticDelawarePersona();const message=deterministicClientMessage('companyName',facts);expect(message).toBe(`${DE_FIELDS[0].label}: ${facts.companyName}`);expect(DELAWARE_EVALUATION_SCENARIOS.map(item=>item.id)).toEqual(['complete','correction-and-resume','adversarial','incomplete']);expect(assessPatch(facts,['companyName'],{companyName:facts.companyName})).toMatchObject({accept:true,correctFields:['companyName']});expect(assessPatch(facts,['companyName'],{registeredAgentName:'invented'})).toMatchObject({accept:false,unexpectedFields:['registeredAgentName']});
});
