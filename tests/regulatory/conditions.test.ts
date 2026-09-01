import {test,expect} from 'vitest';
import {evaluateCondition,selectRule,ruleBlockers} from '../../packages/regulatory-engine';
import {sandboxRegistry,FIXTURE_TIME} from '../../packages/regulatory-engine/fixtures';
test('safe conditions require explicit context and reject unknown operators',()=>{
 const condition={all:[{field:'country',op:'in',value:['MX','CO']},{field:'owners',op:'gte',value:1}]};expect(evaluateCondition(condition,{country:'MX',owners:2})).toBe(true);expect(evaluateCondition(condition,{country:'MX'})).toBe(false);expect(evaluateCondition({field:'country',op:'eval',value:'true'},{country:'MX'})).toBe(false);expect(evaluateCondition({any:[{field:'ready',op:'eq',value:true}]},{ready:false})).toBe(false);
 const registry=sandboxRegistry();registry.rules[0].condition={field:'applies',op:'eq',value:true};expect(selectRule(registry,registry.rules[0].code,new Date(FIXTURE_TIME))).toBeNull();expect(selectRule(registry,registry.rules[0].code,new Date(FIXTURE_TIME),{applies:true})).not.toBeNull();
});
test('critical rule cadence cannot be relaxed by a source flag',()=>{const r=sandboxRegistry();const rule=r.rules[0];const source=r.sources.find(s=>s.id===rule.evidence[0].sourceId)!;source.critical=false;source.refreshHours=72;expect(ruleBlockers(rule,r,new Date(Date.parse(FIXTURE_TIME)+25*3600000))).toContain('La regla crítica requiere evidencia consultada en menos de 24 horas');});
