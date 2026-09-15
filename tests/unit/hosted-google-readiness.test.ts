import {expect,test} from 'vitest';
import {hostedGoogleReadiness} from '../../packages/authentication/hosted-readiness';

test('hosted Google is ready for a flow test only when provider and signup are enabled',()=>{
 expect(hostedGoogleReadiness({external:{google:true,email:true},disable_signup:false})).toEqual({status:'READY_FOR_FLOW_TEST',googleEnabled:true,emailEnabled:true,signupAvailable:true});
 expect(hostedGoogleReadiness({external:{google:true,email:true},disable_signup:true}).status).toBe('EXTERNAL_BLOCKED');
 expect(hostedGoogleReadiness({external:{google:false,email:true}})).toEqual({status:'EXTERNAL_BLOCKED',googleEnabled:false,emailEnabled:true,signupAvailable:true});
});

test('malformed or optimistic settings fail closed',()=>{
 for(const value of [null,[],{},"enabled",{external:{google:'true'}},{external:null}])expect(hostedGoogleReadiness(value).status).toBe('EXTERNAL_BLOCKED');
});
