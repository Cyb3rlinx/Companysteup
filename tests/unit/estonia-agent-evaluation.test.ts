import {expect,test} from 'vitest';
import {EE_FIELDS} from '../../packages/formation-packet/estonia-catalog';
import {ESTONIA_EVALUATION_SCENARIOS,assessPatch,canAcceptExactProgress,deterministicClientMessage,openAISyntheticClientMessage,syntheticEstoniaPersona} from '../../packages/agent-evaluation/estonia';

test('Estonia evaluator has four bounded scenarios and exact synthetic facts',()=>{
 const facts=syntheticEstoniaPersona();const message=deterministicClientMessage('companyName',facts);expect(message).toBe(`${EE_FIELDS.find(field=>field.key==='companyName')!.label}: ${facts.companyName}`);expect(ESTONIA_EVALUATION_SCENARIOS.map(item=>item.id)).toEqual(['complete','correction-and-resume','adversarial','incomplete']);expect(assessPatch(facts,['companyName'],{companyName:facts.companyName})).toMatchObject({accept:true,correctFields:['companyName']});expect(assessPatch(facts,['companyName'],{contactPersonName:'invented'})).toMatchObject({accept:false,unexpectedFields:['contactPersonName']});
 const partial=assessPatch(facts,['principalActivity','financialYear','companyName'],{principalActivity:facts.principalActivity,companyName:facts.companyName});expect(partial).toMatchObject({accept:false,correctFields:['principalActivity','companyName'],missingFields:['financialYear']});expect(canAcceptExactProgress(partial)).toBe(true);expect(canAcceptExactProgress(assessPatch(facts,['companyName'],{companyName:'Invented OÜ'}))).toBe(false);expect(canAcceptExactProgress(assessPatch(facts,['companyName'],{}))).toBe(false);
});

test('Estonia connected client reports invalid structured arguments as a safe model error',async()=>{
 const facts=syntheticEstoniaPersona();const malformed=async()=>new Response(JSON.stringify({output:[{type:'function_call',name:'reply_as_synthetic_customer',arguments:JSON.stringify({message:`Nombre propuesto: ${facts.companyName}`,disclosedFields:[]})}]}),{status:200,headers:{'Content-Type':'application/json'}});
 await expect(openAISyntheticClientMessage(['companyName'],facts,{key:'test-key',model:'test-model'},malformed as typeof fetch)).rejects.toMatchObject({code:'MODEL_SCHEMA',message:expect.not.stringContaining(facts.companyName)});
});
