import {expect,test} from 'vitest';
import {UK_FIELDS} from '../../packages/formation-packet/uk-catalog';
import {UK_EVALUATION_SCENARIOS,assessPatch,canAcceptExactProgress,deterministicClientMessage,openAISyntheticClientMessage,syntheticUkPersona} from '../../packages/agent-evaluation/uk';

test('UK evaluator has four bounded scenarios and exact synthetic facts',()=>{
 const facts=syntheticUkPersona();const message=deterministicClientMessage('companyName',facts);expect(message).toBe(`${UK_FIELDS.find(field=>field.key==='companyName')!.label}: ${facts.companyName}`);expect(UK_EVALUATION_SCENARIOS.map(item=>item.id)).toEqual(['complete','correction-and-resume','adversarial','incomplete']);expect(assessPatch(facts,['companyName'],{companyName:facts.companyName})).toMatchObject({accept:true,correctFields:['companyName']});expect(assessPatch(facts,['companyName'],{pscSummary:'invented'})).toMatchObject({accept:false,unexpectedFields:['pscSummary']});
 const partial=assessPatch(facts,['principalActivity','sicCode','companyName'],{principalActivity:facts.principalActivity,companyName:facts.companyName});expect(partial).toMatchObject({accept:false,correctFields:['principalActivity','companyName'],missingFields:['sicCode']});expect(canAcceptExactProgress(partial)).toBe(true);expect(canAcceptExactProgress(assessPatch(facts,['companyName'],{companyName:'Invented Ltd'}))).toBe(false);expect(canAcceptExactProgress(assessPatch(facts,['companyName'],{}))).toBe(false);
});

test('UK connected client reports invalid structured arguments as a safe model error',async()=>{
 const facts=syntheticUkPersona();const malformed=async()=>new Response(JSON.stringify({output:[{type:'function_call',name:'reply_as_synthetic_customer',arguments:JSON.stringify({message:`Nombre propuesto: ${facts.companyName}`,disclosedFields:[]})}]}),{status:200,headers:{'Content-Type':'application/json'}});
 await expect(openAISyntheticClientMessage(['companyName'],facts,{key:'test-key',model:'test-model'},malformed as typeof fetch)).rejects.toMatchObject({code:'MODEL_SCHEMA',message:expect.not.stringContaining(facts.companyName)});
});
