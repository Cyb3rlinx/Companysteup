import {expect,test} from 'vitest';
import {WY_FIELDS} from '../../packages/formation-packet/catalog';
import {assessPatch,deterministicClientMessage,openAISyntheticClientMessage,syntheticWyomingPersona,WYOMING_EVALUATION_SCENARIOS} from '../../packages/agent-evaluation';

test('deterministic synthetic client discloses one exact known fact',()=>{
 const facts=syntheticWyomingPersona();const message=deterministicClientMessage('companyName',facts);
 expect(message).toContain(facts.companyName);expect(message).toContain(WY_FIELDS[0].label);
});

test('deterministic grader accepts only exact requested facts',()=>{
 const facts=syntheticWyomingPersona();
 expect(assessPatch(facts,['companyName'],{companyName:facts.companyName})).toMatchObject({accept:true,correctFields:['companyName']});
 expect(assessPatch(facts,['companyName','activity'],{companyName:facts.companyName})).toMatchObject({accept:false,correctFields:['companyName']});
 expect(assessPatch(facts,['companyName'],{companyName:'Invented LLC'})).toMatchObject({accept:false,incorrectFields:['companyName']});
 expect(assessPatch(facts,['companyName'],{agentState:'WY'})).toMatchObject({accept:false,unexpectedFields:['agentState']});
 expect(WYOMING_EVALUATION_SCENARIOS.map(item=>item.id)).toEqual(['complete','correction-and-resume','adversarial','incomplete']);
});

test('connected synthetic client uses one strict tool, store false and rejects altered facts',async()=>{
 const facts=syntheticWyomingPersona();let request:Record<string,unknown>|undefined;
 const fetcher=async(_url:string,init?:RequestInit)=>{request=JSON.parse(String(init?.body));return new Response(JSON.stringify({usage:{input_tokens:8,output_tokens:4,total_tokens:12},output:[{type:'function_call',name:'reply_as_synthetic_customer',arguments:JSON.stringify({message:`Quiero usar el nombre ${facts.companyName}.`,disclosedFields:['companyName']})}]}),{status:200,headers:{'Content-Type':'application/json'}});} ;
 const reply=await openAISyntheticClientMessage(['companyName'],facts,{key:'test-key',model:'test-model'},fetcher as typeof fetch);
 expect(reply.disclosedFields).toEqual(['companyName']);expect(reply.metrics).toMatchObject({inputTokens:8,outputTokens:4,totalTokens:12});expect(request).toMatchObject({store:false,parallel_tool_calls:false,tool_choice:{type:'function',name:'reply_as_synthetic_customer'}});expect(JSON.stringify(request)).not.toContain('test-key');
 const altered=async()=>new Response(JSON.stringify({output:[{type:'function_call',name:'reply_as_synthetic_customer',arguments:JSON.stringify({message:'Quiero usar Invented LLC.',disclosedFields:['companyName']})}]}),{status:200,headers:{'Content-Type':'application/json'}});
 await expect(openAISyntheticClientMessage(['companyName'],facts,{key:'test-key',model:'test-model'},altered as typeof fetch)).rejects.toMatchObject({code:'MODEL_SCHEMA'});
});
