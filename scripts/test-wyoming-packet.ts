import {mkdir,writeFile} from 'node:fs/promises';
import {emptyWyomingIntake,syntheticWyomingIntake,WY_RECHECK_AFTER} from '../packages/formation-packet/catalog';
import {prepareWyomingPacket,simulatePacketReceipt} from '../packages/formation-packet/wyoming';

async function main(){
 const base=syntheticWyomingIntake();const now=new Date();
 const scenarios=[
  {id:'complete',intake:base},{id:'missing',intake:emptyWyomingIntake()},
  {id:'name-a',intake:{...base,companyName:'Andes QA LLC'}},
  {id:'agent-outside-wy',intake:{...base,agentState:'NY'}},
  {id:'po-box',intake:{...base,agentStreet:'PO Box 42'}},
  {id:'no-agent-consent',intake:{...base,agentConsentCopy:'no'}},
  {id:'specialized-close',intake:{...base,entityVariant:'close'}},
  {id:'ein-unknown',intake:{...base,einUsPresence:'unknown'}},
  {id:'ein-existing',intake:{...base,einExistingRequest:'yes'}},
  {id:'ein-us-presence',intake:{...base,einUsPresence:'yes',einTinAvailable:'yes'}},
  {id:'source-expired',intake:base,at:new Date(WY_RECHECK_AFTER)},
 ];
 const results=scenarios.map(s=>{const packet=prepareWyomingPacket(s.intake,null,s.at??now);return {scenario:s.id,packet,receipt:simulatePacketReceipt(packet)};});
 if(results.some(r=>r.packet.registered||r.receipt.providerAccepted||r.packet.externalWrites!==0||!r.packet.blockers.some(b=>b.code==='HUMAN_REVIEW_PENDING')))throw new Error('Unsafe packet result');
 await mkdir('.local/qa',{recursive:true});await writeFile('.local/qa/wyoming-packet-qa.json',JSON.stringify({evaluatedAt:now.toISOString(),limitation:'Datos ficticios; no mide un LLM ni aceptación externa.',results},null,2));
 console.log(`${results.length} escenarios Wyoming; cero presentaciones y ninguna aceptación externa. Informe: .local/qa/wyoming-packet-qa.json`);
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Packet QA failed');process.exitCode=1;});
