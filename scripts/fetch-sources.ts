import { mkdir, writeFile } from 'node:fs/promises';
import { OFFICIAL_SOURCES, fetchOfficialSource, normalizeSource, hashText } from '../packages/regulatory-engine';
async function main(){
await mkdir('regulatory/fixtures/captured',{recursive:true});
const results=[];
for(const s of OFFICIAL_SOURCES) {
 try {
  const r=await fetchOfficialSource(s.url); const normalized=normalizeSource(r.body);
  const metadata={source_code:s.source_code,url:s.url,fetched_at:new Date().toISOString(),http_status:r.status,etag:r.etag,last_modified:r.lastModified,content_hash:hashText(r.body),normalized_text_hash:hashText(normalized),status:'CAPTURED_NOT_APPROVED'};
  await writeFile(`regulatory/fixtures/captured/${s.source_code}.json`,JSON.stringify(metadata,null,2));
  // Raw untrusted content is not committed; retained locally for human review.
  await mkdir('.local/source-snapshots',{recursive:true});
  await writeFile(`.local/source-snapshots/${s.source_code}.txt`,normalized);
  results.push(metadata);console.log(`${s.source_code}: captured, pending human approval`);
 } catch(e) { const result={source_code:s.source_code,status:'EXTERNAL_BLOCKED',error:e instanceof Error?e.message:'fetch failed'};results.push(result);console.log(`${s.source_code}: ${result.status}`); }
}
await writeFile('regulatory/fixtures/capture-report.json',JSON.stringify(results,null,2));

}
void main().catch(error=>{console.error(error);process.exitCode=1;});

