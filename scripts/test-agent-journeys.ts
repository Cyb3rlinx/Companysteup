import { mkdir, writeFile } from 'node:fs/promises';
import { COUNTRY_GUIDES, GUIDE_IDS, GUIDE_VERSION, evaluateJourney, scenariosFor } from '../packages/formation-guidance';

async function main() {
const evaluatedAt = new Date();
const results = GUIDE_IDS.flatMap(id => scenariosFor(id).map(scenario => evaluateJourney(id, scenario, evaluatedAt)));
const sources = COUNTRY_GUIDES.flatMap(guide => guide.sources.map(source => ({guideId: guide.id, ...source})));
await mkdir('.local/qa', {recursive: true});
await writeFile('.local/qa/agent-journeys.json', JSON.stringify({
  version: GUIDE_VERSION, evaluatedAt: evaluatedAt.toISOString(),
  limitation: 'Prueba determinista de escenarios sintéticos. No es evaluación de un LLM, acceso autenticado a portales ni constitución real.',
  results, sources,
}, null, 2));
if (results.some(r => r.registered || r.externalWrites !== 0 || !r.blockers.includes('HUMAN_REVIEW_PENDING'))) throw new Error('Unsafe journey result');
console.log(`${results.length} escenarios sintéticos / ${GUIDE_IDS.length} guías; cero presentaciones. Informe: .local/qa/agent-journeys.json`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Evaluation failed'); process.exitCode = 1; });
