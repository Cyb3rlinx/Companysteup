import {expect,test} from 'vitest';
import {DE_FIELDS,DE_OBSERVED_AT,DE_RECHECK_AFTER,emptyDelawareIntake,syntheticDelawareIntake} from '../../packages/formation-packet/delaware-catalog';
import {prepareDelawarePacket,simulateDelawarePacketReceipt} from '../../packages/formation-packet/delaware';

const now=new Date(DE_OBSERVED_AT);
test('Delaware packet maps every declared field to reviewed official-source metadata without filing',()=>{
 const packet=prepareDelawarePacket(syntheticDelawareIntake(),{caseId:'00000000-0000-4000-8000-000000000001',revision:0},now);
 expect(packet).toMatchObject({jurisdiction:'US-DE',mode:'SANDBOX',synthetic:true,status:'DRAFT_NOT_FOR_FILING',inputStatus:'COMPLETE_FOR_INTERNAL_REVIEW',filingAdapter:'EXTERNAL_BLOCKED',externalWrites:0,registered:false});
 expect(packet.fields).toHaveLength(DE_FIELDS.length);expect(packet.routing).toMatchObject({filing:'DOCUMENT_UPLOAD_REVIEW_REQUIRED',ein:'INTERNATIONAL_CHANNEL_REVIEW',eligibilityConfirmed:false});expect(packet.blockers.map(item=>item.code)).toEqual(expect.arrayContaining(['HUMAN_REVIEW_PENDING','REGISTERED_AGENT_VERIFICATION_PENDING','SIGNATURE_UNVERIFIED','FEE_AND_PAYMENT_REVIEW_PENDING','EXTERNAL_FILING_DISABLED']));
 expect(packet.sources.every(source=>source.url.startsWith('https://')&&(source.url.includes('corp.delaware.gov')||source.url.includes('irs.gov')))).toBe(true);
 const receipt=simulateDelawarePacketReceipt(packet);expect(receipt).toMatchObject({adapter:'SANDBOX',operation:'VALIDATE_ENVELOPE_ONLY',providerAccepted:false,externalWrites:0,registered:false});
});

test('Delaware packet fails closed for missing, unverified, stale or unsafe inputs',()=>{
 const empty=prepareDelawarePacket(emptyDelawareIntake(),null,now);expect(empty.inputStatus).toBe('NEEDS_INFORMATION');expect(empty.blockers.filter(item=>item.code==='DATA_MISSING')).toHaveLength(DE_FIELDS.length);
 const intake=syntheticDelawareIntake();expect(prepareDelawarePacket({...intake,registeredAgentConsent:'unknown'},null,now).blockers.map(item=>item.code)).toContain('AGENT_CONSENT_PENDING');expect(prepareDelawarePacket({...intake,registeredOfficeStreet:'PO Box 1'},null,now).blockers.map(item=>item.code)).toContain('AGENT_PHYSICAL_ADDRESS_REQUIRED');expect(prepareDelawarePacket({...intake,submitterEmail:'real@example.com'},null,now).blockers.map(item=>item.code)).toContain('SYNTHETIC_EMAIL_REQUIRED');expect(prepareDelawarePacket(intake,null,new Date(DE_RECHECK_AFTER)).routing.filing).toBe('RECHECK_REQUIRED');
 for(const extra of [{ssn:'000-00-0000'},{signature:'fake'},{registered:true},{paymentToken:'secret'}])expect(()=>prepareDelawarePacket({...intake,...extra},null,now)).toThrow();
});
