import {expect,test} from 'vitest';
import {UK_FIELDS,UK_OBSERVED_AT,UK_RECHECK_AFTER,emptyUkIntake,syntheticUkIntake} from '../../packages/formation-packet/uk-catalog';
import {prepareUkPacket,simulateUkPacketReceipt} from '../../packages/formation-packet/uk';

const now=new Date(UK_OBSERVED_AT);
test('UK packet maps every declared field to official metadata without identity, signature, payment or filing',()=>{
 const packet=prepareUkPacket(syntheticUkIntake(),{caseId:'00000000-0000-4000-8000-000000000001',revision:0},now);
 expect(packet).toMatchObject({jurisdiction:'GB',mode:'SANDBOX',synthetic:true,status:'DRAFT_NOT_FOR_FILING',inputStatus:'COMPLETE_FOR_INTERNAL_REVIEW',filingAdapter:'EXTERNAL_BLOCKED',identityAdapter:'EXTERNAL_BLOCKED',externalWrites:0,registered:false});
 expect(packet.fields).toHaveLength(UK_FIELDS.length);expect(packet.routing).toMatchObject({formation:'CUSTOMER_SELF_FILING_REVIEW',identity:'COMPANIES_HOUSE_OR_VERIFIED_ACSP_REQUIRED',registeredOffice:'PROVIDER_EVIDENCE_REVIEW',eligibilityConfirmed:false});
 expect(packet.blockers.map(item=>item.code)).toEqual(expect.arrayContaining(['HUMAN_REVIEW_PENDING','IDENTITY_VERIFICATION_EXTERNAL','REGISTERED_OFFICE_EVIDENCE_PENDING','SIGNATURE_AND_DECLARATIONS_UNVERIFIED','PAYMENT_UNVERIFIED','EXTERNAL_FILING_DISABLED','ACSP_AUTHORIZATION_UNVERIFIED']));
 expect(packet.sources.every(source=>source.url.startsWith('https://www.gov.uk/'))).toBe(true);
 expect(simulateUkPacketReceipt(packet)).toMatchObject({adapter:'SANDBOX',operation:'VALIDATE_ENVELOPE_ONLY',providerAccepted:false,externalWrites:0,registered:false,identityAdapter:'EXTERNAL_BLOCKED'});
});

test('UK packet fails closed for missing, stale, unsafe or unverified inputs',()=>{
 const empty=prepareUkPacket(emptyUkIntake(),null,now);expect(empty.inputStatus).toBe('NEEDS_INFORMATION');expect(empty.blockers.filter(item=>item.code==='DATA_MISSING')).toHaveLength(UK_FIELDS.length);
 const intake=syntheticUkIntake();expect(prepareUkPacket({...intake,directorsIdentityVerified:'unknown'},null,now).blockers.map(item=>item.code)).toContain('DIRECTOR_IDENTITY_PENDING');expect(prepareUkPacket({...intake,pscIdentityLinked:'no'},null,now).blockers.map(item=>item.code)).toContain('PSC_ROLE_LINK_PENDING');expect(prepareUkPacket({...intake,registeredOfficeAppropriate:'unknown'},null,now).blockers.map(item=>item.code)).toContain('REGISTERED_OFFICE_REVIEW');expect(prepareUkPacket({...intake,registeredEmail:'real@example.com'},null,now).blockers.map(item=>item.code)).toContain('SYNTHETIC_EMAIL_REQUIRED');expect(prepareUkPacket(intake,null,new Date(UK_RECHECK_AFTER)).routing.formation).toBe('RECHECK_REQUIRED');expect(prepareUkPacket({...intake,filingRoute:'ACSP ficticio por validar'},null,now).routing.formation).toBe('ACSP_ROUTE_REVIEW');
 for(const extra of [{personalCode:'ABC12345678'},{passport:'QA123'},{signature:'fake'},{registered:true},{paymentToken:'secret'}])expect(()=>prepareUkPacket({...intake,...extra},null,now)).toThrow();
});
