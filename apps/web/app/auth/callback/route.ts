import {NextRequest,NextResponse} from 'next/server';
import {supabaseAuth,getActor} from '../../../lib/auth';
import {appOrigin,isSandbox} from '../../../lib/runtime';
import {authCallbackLocation} from '../../../../../packages/authentication/google';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 let success=false;
 const codes=request.nextUrl.searchParams.getAll('code');
 if(!isSandbox()&&!request.nextUrl.searchParams.has('error')&&codes.length===1&&codes[0].length>0&&codes[0].length<=2048){
  try {const client=await supabaseAuth();const{error}=await client.auth.exchangeCodeForSession(codes[0]);success=!error&&Boolean(await getActor());}catch{success=false;}
 }
 // Destination never comes from next/redirect_to/Host/X-Forwarded-Host inputs.
 const response=NextResponse.redirect(authCallbackLocation(appOrigin(),success));
 response.headers.set('Cache-Control','no-store');response.headers.set('Referrer-Policy','no-referrer');return response;
}
