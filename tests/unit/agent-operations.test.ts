import {describe,expect,test} from 'vitest';
import {agentQualityBaselines,AGENT_REGRESSION_VERSION} from '../../packages/agent-operations';

describe('registro operativo de calidad de agentes',()=>{
  test('cubre exactamente las cuatro rutas permitidas con evidencia sintética y sin acciones externas',()=>{
    const rows=agentQualityBaselines();
    expect(rows.map(row=>row.jurisdiction).sort()).toEqual(['EE','GB','US-DE','US-WY']);
    expect(new Set(rows.map(row=>row.jurisdiction)).size).toBe(4);
    expect(rows.map(row=>row.fieldCount)).toEqual([21,20,24,22]);
    for(const row of rows){
      expect(row.regressionVersion).toBe(AGENT_REGRESSION_VERSION);
      expect(row).toMatchObject({passedScenarios:4,totalScenarios:4,externalWrites:0,evidenceStatus:'PASSED',scope:'SYNTHETIC_EVALUATION_ONLY',filingCapability:'EXTERNAL_BLOCKED'});
    }
  });

  test('solo marca vigente la evidencia conectada de la misma versión del evaluador',()=>{
    const rows=agentQualityBaselines();
    expect(rows.filter(row=>row.operationalStatus==='CONNECTED_PASSED_CURRENT').map(row=>row.jurisdiction).sort()).toEqual(['EE','GB','US-DE','US-WY']);
    expect(rows.find(row=>row.jurisdiction==='US-WY')).toMatchObject({connectedEvidenceVersion:'2026-09-14.5',currentEvaluationVersion:'2026-09-14.5',operationalStatus:'CONNECTED_PASSED_CURRENT',requestCount:49,totalTokens:26988});
  });

  test('el registro público no contiene credenciales ni rutas de informes locales',()=>{
    const serialized=JSON.stringify(agentQualityBaselines()).toLowerCase();
    for(const forbidden of ['api_key','secret','password','.local/','openai_api_key'])expect(serialized).not.toContain(forbidden);
  });
});
