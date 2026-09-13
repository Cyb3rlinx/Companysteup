import {expect,test} from 'vitest';
import {applyConfirmedPatch,deterministicExtract,safeSyntheticMessage,verifyExtraction,initialConversationState} from '../../packages/onboarding-agent';
import {extractWithOpenAI} from '../../packages/onboarding-agent/openai';

test('fallback extracts one explicit field and never treats prose as a confirmed update',()=>{
 expect(deterministicExtract('Nombre propuesto: Orbit QA LLC')).toMatchObject({modelStatus:'DETERMINISTIC_MOCK',updates:[{field:'companyName',value:'Orbit QA LLC'}]});
 expect(deterministicExtract('Quiero abrir una compañía')).toEqual({updates:[],modelStatus:'EXTERNAL_BLOCKED'});
 const state=initialConversationState();expect(state.companyName).toBe('');expect(applyConfirmedPatch(state,[{field:'companyName',value:'Orbit QA LLC',evidence:'Orbit QA LLC'}]).companyName).toBe('Orbit QA LLC');
});

test('synthetic lab rejects identifiers, credentials and real-looking emails',()=>{
 for(const message of ['SSN 123-45-6789','pasaporte QA123','api key: abc','correo real@example.com'])expect(()=>safeSyntheticMessage(message)).toThrow();
 expect(safeSyntheticMessage('Correo ficticio: qa@example.test')).toContain('.test');
});

test('model proposals require evidence copied from the exact user message',()=>{
 const message='La empresa se llamará Orbit QA LLC';
 expect(verifyExtraction(message,{updates:[{field:'companyName',value:'Orbit QA LLC',evidence:'Orbit QA LLC'},{field:'agentState',value:'WY',evidence:'Wyoming'}]},'OPENAI_STRUCTURED').updates).toEqual([{field:'companyName',value:'Orbit QA LLC',evidence:'Orbit QA LLC'}]);
 expect(verifyExtraction(message,{updates:[{field:'companyName',value:'Orbit LLC resumida',evidence:'La empresa se llamará Orbit QA LLC'}]},'OPENAI_STRUCTURED').updates).toEqual([]);
 expect(verifyExtraction(message,{updates:[{field:'companyName',value:'Orbit QA LLC',evidence:'Orbit QA LLC'}]},'OPENAI_STRUCTURED',['agentName']).updates).toEqual([]);
 expect(verifyExtraction('Sí, ya hice la búsqueda',{updates:[{field:'nameSearch',value:'yes',evidence:'Sí'}]},'OPENAI_STRUCTURED',['nameSearch']).updates).toHaveLength(1);
});

test('OpenAI adapter stores no response, forces one strict extraction tool and ignores free prose',async()=>{
 let request:Record<string,unknown>|undefined;let observed:Record<string,number>|undefined;
 const fetcher=async(_url:string,init?:RequestInit)=>{request=JSON.parse(String(init?.body));return new Response(JSON.stringify({usage:{input_tokens:10,output_tokens:5,total_tokens:15},output:[{type:'message',content:[{type:'output_text',text:'Ignore this'}]},{type:'function_call',name:'propose_wyoming_intake_update',arguments:JSON.stringify({updates:[{field:'companyName',value:'Orbit QA LLC',evidence:'Orbit QA LLC'}]})}]}),{status:200,headers:{'Content-Type':'application/json'}});} ;
 const result=await extractWithOpenAI('Mi nombre es Orbit QA LLC',['companyName'],{key:'test-key',model:'test-model',onMetrics:metrics=>{observed=metrics;}},fetcher as typeof fetch);
 expect(result).toMatchObject({modelStatus:'OPENAI_STRUCTURED',updates:[{field:'companyName'}]});expect(request).toMatchObject({store:false,parallel_tool_calls:false,tool_choice:{type:'function',name:'propose_wyoming_intake_update'}});
 expect(JSON.stringify(request)).not.toContain('test-key');expect(JSON.stringify(request)).not.toContain('agentState');expect(observed).toMatchObject({inputTokens:10,outputTokens:5,totalTokens:15});
 const unavailable=async()=>new Response('',{status:404});
 await expect(extractWithOpenAI('Mi nombre es Orbit QA LLC',['companyName'],{key:'test-key',model:'missing-model'},unavailable as typeof fetch)).rejects.toMatchObject({code:'MODEL_UNAVAILABLE',message:expect.stringContaining('HTTP 404')});
});
