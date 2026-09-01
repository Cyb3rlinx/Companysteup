import {NextRequest,NextResponse} from 'next/server';
import {supabaseAuth} from '../../../lib/auth';
import {appOrigin} from '../../../lib/runtime';
export async function GET(request:NextRequest){const code=request.nextUrl.searchParams.get('code');if(code){const{error}=await(await supabaseAuth()).auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/panel',appOrigin()));}return NextResponse.redirect(new URL('/ingresar?confirmation=failed',appOrigin()));}
