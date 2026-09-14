import {expect,test} from 'vitest';
import {EE_FIELDS,EE_OBSERVED_AT,EE_RECHECK_AFTER,emptyEstoniaIntake,syntheticEstoniaIntake} from '../../packages/formation-packet/estonia-catalog';
import {prepareEstoniaPacket,simulateEstoniaPacketReceipt} from '../../packages/formation-packet/estonia';

const now=new Date(EE_OBSERVED_AT);
test('Estonia packet maps every declared field to official-source metadata without identity, signature, payment or filing',()=>{
 const packet=prepareEstoniaPacket(syntheticEstoniaIntake(),{caseId:'00000000-0000-4000-8000-000000000001',revision:0},now);
 expect(packet).toMatchObject({jurisdiction:'EE',mode:'SANDBOX',synthetic:true,status:'DRAFT_NOT_FOR_FILING',inputStatus:'COMPLETE_FOR_INTERNAL_REVIEW',filingAdapter:'EXTERNAL_BLOCKED',externalWrites:0,registered:false});
 expect(packet.fields).toHaveLength(EE_FIELDS.length);expect(packet.routing).toMatchObject({formation:'PORTAL_HANDOFF_REVIEW',address:'ESTONIAN_ADDRESS_REVIEW',vat:'NOT_REQUESTED',eligibilityConfirmed:false});expect(packet.blockers.map(item=>item.code)).toEqual(expect.arrayContaining(['HUMAN_REVIEW_PENDING','IDENTITY_VERIFICATION_EXTERNAL','CONTACT_PERSON_VERIFICATION_PENDING','SIGNATURE_UNVERIFIED','CAPITAL_AND_STATE_FEE_UNVERIFIED','EXTERNAL_FILING_DISABLED','RIK_API_UNVERIFIED']));
 expect(packet.sources.every(source=>source.url.startsWith('https://')&&(source.url.includes('rik.ee')||source.url.includes('e-resident.gov.ee')))).toBe(true);
 expect(simulateEstoniaPacketReceipt(packet)).toMatchObject({adapter:'SANDBOX',operation:'VALIDATE_ENVELOPE_ONLY',providerAccepted:false,externalWrites:0,registered:false});
});

test('Estonia packet fails closed for missing, unverified, stale or unsafe inputs',()=>{
 const empty=prepareEstoniaPacket(emptyEstoniaIntake(),null,now);expect(empty.inputStatus).toBe('NEEDS_INFORMATION');expect(empty.blockers.filter(item=>item.code==='DATA_MISSING')).toHaveLength(EE_FIELDS.length);
 const intake=syntheticEstoniaIntake();expect(prepareEstoniaPacket({...intake,acceptedDigitalIdentity:'unknown'},null,now).blockers.map(item=>item.code)).toContain('ESTONIAN_SIGNATURE_UNAVAILABLE');expect(prepareEstoniaPacket({...intake,legalAddressCountry:'Thailand',contactPersonNeeded:'no'},null,now).blockers.map(item=>item.code)).toContain('CONTACT_PERSON_ROUTE_REVIEW');expect(prepareEstoniaPacket({...intake,companyEmail:'real@example.com'},null,now).blockers.map(item=>item.code)).toContain('SYNTHETIC_EMAIL_REQUIRED');expect(prepareEstoniaPacket(intake,null,new Date(EE_RECHECK_AFTER)).routing.formation).toBe('RECHECK_REQUIRED');expect(prepareEstoniaPacket({...intake,founderTypeSummary:'Una persona jurídica ficticia'},null,now).routing.formation).toBe('NOTARY_ROUTE_REVIEW');
 for(const extra of [{personalCode:'00000000000'},{pin2:'1234'},{signature:'fake'},{registered:true},{paymentToken:'secret'}])expect(()=>prepareEstoniaPacket({...intake,...extra},null,now)).toThrow();
});
