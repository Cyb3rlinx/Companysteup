import {test,expect} from 'vitest';
import {createEdgeHandler,FUNCTION_NAMES} from '../../packages/edge/handler';
import {answerWithOpenAI} from '../../packages/ai/openai';
import {sandboxRegistry} from '../../packages/regulatory-engine/fixtures';
import type {Repository} from '../../packages/persistence';
const repo:Repository={async list(){return[];},async atomic(){return[];},async rateLimit(){return true;}};
test('all ten Edge Functions deny anonymous requests, and webhooks require signatures',async()=>{
 const handle=createEdgeHandler({env:{APP_ORIGIN:'https://app.example'},repo});expect(FUNCTION_NAMES).toHaveLength(10);
 for(const name of FUNCTION_NAMES){const r=await handle(new Request(`https://functions.example/${name}`,{method:'POST',body:'{}'}),name);expect(r.status).toBe(name==='stripe-webhook'?400:401);}
});
test('Edge rejects cross-origin, oversized, malformed and forged automation requests',async()=>{
 const handle=createEdgeHandler({env:{APP_ORIGIN:'https://app.example',SOURCE_MONITOR_SECRET:'a'.repeat(32)},repo});
 expect((await handle(new Request('https://functions.example/notify',{method:'POST',headers:{Origin:'https://evil.example'},body:'{}'}),'notify')).status).toBe(403);
 expect((await handle(new Request('https://functions.example/notify',{method:'POST',body:'a'.repeat(70000)}),'notify')).status).toBe(413);
 expect((await handle(new Request('https://functions.example/notify',{method:'POST',body:'{'}),'notify')).status).toBe(400);
 expect((await handle(new Request('https://functions.example/notify',{method:'POST',headers:{'x-automation-secret':'b'.repeat(32)},body:'{}'}),'notify')).status).toBe(401);
});
test('OpenAI adapter forces a strict local tool and never returns arbitrary model legal prose',async()=>{
 const question='¿Qué cuesta constituir?';let payload:Record<string,unknown>={};const fake:typeof fetch=async(_url,init)=>{payload=JSON.parse(String(init?.body));return Response.json({output:[{type:'message',content:'Invented legal claim'},{type:'function_call',name:'retrieve_verified_rules',arguments:JSON.stringify({question,jurisdiction:'GB'})}]});};
 const answer=await answerWithOpenAI(question,'GB',sandboxRegistry(),{key:'unit-test-not-a-real-key',model:'configured-test-model'},fake);expect(payload.store).toBe(false);expect(payload.tool_choice).toEqual({type:'function',name:'retrieve_verified_rules'});expect(answer.answer).not.toContain('Invented legal claim');
 const altered:typeof fetch=async()=>Response.json({output:[{type:'function_call',name:'retrieve_verified_rules',arguments:JSON.stringify({question,jurisdiction:'EE'})}]});await expect(answerWithOpenAI(question,'GB',sandboxRegistry(),{key:'unit-test-not-a-real-key',model:'configured-test-model'},altered)).rejects.toThrow(/alcance/);
});
