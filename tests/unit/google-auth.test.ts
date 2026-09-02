import { test, expect } from 'vitest';
import { createServerClient } from '@supabase/ssr';
import { startGoogleOAuth, googleAuthStatus, authCallbackLocation, type GoogleAuthConfig } from '../../packages/authentication/google';
const config: GoogleAuthConfig = {sandbox:false,mode:'SANDBOX',appOrigin:'https://app.example.test',supabaseUrl:'https://auth.example.test',publishableKey:'synthetic-publishable-key'};

test('Google OAuth uses the real Supabase SDK PKCE flow, minimal scopes and HttpOnly verifier cookie',async()=>{
  const jar: {name:string;value:string;options?:{httpOnly?:boolean;secure?:boolean;sameSite?:boolean|string}}[]=[];
  const client=createServerClient(config.supabaseUrl!,config.publishableKey!,{cookieOptions:{httpOnly:true,secure:true,sameSite:'lax'},cookies:{getAll:()=>[],setAll:items=>{jar.push(...items);}}});
  const result=await startGoogleOAuth(config,client);const target=new URL(result.url);
  expect(target.origin).toBe('https://auth.example.test');
  expect(target.pathname).toBe('/auth/v1/authorize');expect(target.searchParams.get('provider')).toBe('google');
  expect(target.searchParams.get('redirect_to')).toBe('https://app.example.test/auth/callback');
  expect(target.searchParams.get('code_challenge_method')).toBe('s256');expect(target.searchParams.get('code_challenge')).toBeTruthy();
  expect(target.searchParams.get('scopes')).toBe('openid email profile');
  expect(target.searchParams.has('access_type')).toBe(false);
  expect(jar.some(c=>c.name.includes('code-verifier')&&c.value.length>0&&c.options?.httpOnly&&c.options.secure&&c.options.sameSite==='lax')).toBe(true);
  for(const cookie of jar)expect(result.url).not.toContain(cookie.value);
});
test('unconfigured Google never calls the provider; sandbox cannot impersonate Google',async()=>{
  let calls=0;const client={auth:{signInWithOAuth:async()=>{calls++;return {data:{url:null},error:null};}}};
  for(const blocked of [{...config,sandbox:true},{...config,mode:'EXTERNAL_BLOCKED'},{...config,publishableKey:''},{...config,appOrigin:'https://app.example.test@evil.test/path'},{...config,supabaseUrl:'http://evil.test'}]) {
    expect(googleAuthStatus(blocked)).toBe('EXTERNAL_BLOCKED');await expect(startGoogleOAuth(blocked,client)).rejects.toMatchObject({code:'EXTERNAL_BLOCKED'});
  }
  expect(calls).toBe(0);
});
test.each(['https://evil.test/auth/v1/authorize','javascript:alert(1)','https://auth.example.test@evil.test/auth/v1/authorize','https://auth.example.test/auth/v1/authorize?provider=google&redirect_to=https://evil.test','https://auth.example.test/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fapp.example.test%2Fauth%2Fcallback'])('unexpected OAuth destination or missing PKCE is refused: %s',url=>{
  const client={auth:{signInWithOAuth:async()=>({data:{url},error:null})}};
  return expect(startGoogleOAuth(config,client)).rejects.toMatchObject({code:'OAUTH_INVALID_REDIRECT'});
});
test('provider errors are sanitized and callbacks have fixed destinations',async()=>{
  await expect(startGoogleOAuth(config,{auth:{signInWithOAuth:async()=>({data:{url:null},error:{message:'secret-provider-error'}})}})).rejects.toMatchObject({code:'OAUTH_UNAVAILABLE'});
  expect(authCallbackLocation(config.appOrigin,true)).toBe('https://app.example.test/panel');
  expect(authCallbackLocation(config.appOrigin,false)).toBe('https://app.example.test/ingresar?confirmation=failed');
  expect(()=>authCallbackLocation('https://app.example.test/?next=https://evil.test',true)).toThrow();
});
