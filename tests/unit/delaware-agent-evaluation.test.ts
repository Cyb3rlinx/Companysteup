import {expect,test} from 'vitest';
import {DE_FIELDS} from '../../packages/formation-packet/delaware-catalog';
import {DELAWARE_EVALUATION_SCENARIOS,assessPatch,deterministicClientMessage,openAISyntheticClientMessage,syntheticDelawarePersona} from '../../packages/agent-evaluation/delaware';

test('Delaware evaluator has four bounded scenarios and exact synthetic facts',()=>{
 const facts=syntheticDelawarePersona();const message=deterministicClientMessage('companyName',facts);expect(message).toBe(`${DE_FIELDS[0].label}: ${facts.companyName}`);expect(DELAWARE_EVALUATION_SCENARIOS.map(item=>item.id)).toEqual(['complete','correction-and-resume','adversarial','incomplete']);expect(assessPatch(facts,['companyName'],{companyName:facts.companyName})).toMatchObject({accept:true,correctFields:['companyName']});expect(assessPatch(facts,['companyName'],{registeredAgentName:'invented'})).toMatchObject({accept:false,unexpectedFields:['registeredAgentName']});
});

test('Delaware connected client reports invalid structured arguments as a safe model error',async()=>{
 const facts=syntheticDelawarePersona();const malformed=async()=>new Response(JSON.stringify({output:[{type:'function_call',name:'reply_as_synthetic_customer',arguments:JSON.stringify({message:`Nombre propuesto: ${facts.companyName}`,disclosedFields:[]})}]}),{status:200,headers:{'Content-Type':'application/json'}});
 await expect(openAISyntheticClientMessage(['companyName'],facts,{key:'test-key',model:'test-model'},malformed as typeof fetch)).rejects.toMatchObject({code:'MODEL_SCHEMA',message:expect.not.stringContaining(facts.companyName)});
});
