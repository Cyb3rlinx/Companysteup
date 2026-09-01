import { mkdirSync,readFileSync,writeFileSync } from 'node:fs';
import path from 'node:path';
import { PRODUCTS } from '../packages/jurisdiction-engine/catalog';
import { analyzeWorkflow } from '../packages/workflow-engine';
import { integrationCatalog } from '../packages/integrations';

const root=path.resolve(import.meta.dirname,'..');
const verticals=JSON.parse(readFileSync(path.join(root,'supabase','verticals.json'),'utf8')) as {version:number;verticals:unknown[]};
const sourceManifest=JSON.parse(readFileSync(path.join(root,'regulatory','source-manifests','official_sources.json'),'utf8')) as unknown[];
const rules=JSON.parse(readFileSync(path.join(root,'regulatory','normalized','rule-candidates.json'),'utf8')) as unknown[];
const jurisdictions=Object.fromEntries(Object.entries(PRODUCTS).map(([code,product])=>[code,{
 product:{code:product.code,name:product.name,country:product.country,entity:product.entity,currency:product.currency},
 workflow:product.workflow,
 coverage:analyzeWorkflow(product.workflow),
}]));
const output={
 schemaVersion:1,
 purpose:'Lovable generation context only; not runtime configuration or regulatory evidence',
 canonicalSources:{schema:'supabase/migrations',domain:'packages',workflows:'jurisdictions',regulatory:'regulatory/source-manifests and regulatory/normalized'},
 jurisdictions,
 integrations:integrationCatalog.map(item=>({...item,status:'EXTERNAL_BLOCKED'})),
 supabase:{verticalsVersion:verticals.version,verticalCount:verticals.verticals.length,manifest:'supabase/verticals.json'},
 regulatory:{officialSourceCandidates:sourceManifest.length,ruleCandidates:rules.length,status:'UNTRUSTED_UNTIL_HUMAN_REVIEW'},
 acceptance:{document:'docs/AGENT_ACCEPTANCE.md',realFormationProven:false,sandboxOrchestrationProven:true},
};
mkdirSync(path.join(root,'lovable'),{recursive:true});
writeFileSync(path.join(root,'lovable','context.generated.json'),JSON.stringify(output,null,2)+'\n');
console.log(`Exported Lovable context for ${Object.keys(jurisdictions).length} jurisdictions and ${verticals.verticals.length} Supabase verticals.`);
