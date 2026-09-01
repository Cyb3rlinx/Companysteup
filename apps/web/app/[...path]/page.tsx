import { notFound,redirect } from 'next/navigation';
import { PublicSite } from '../../components/public-site';
import { Workspace } from '../../components/workspace';
import { AuthForm } from '../../features/auth/auth-form';
import { getActor } from '../../lib/auth';
import { isSandbox } from '../../lib/runtime';
import { publicRoutes } from '../../lib/public-locale';
import { getPublicLocale } from '../../lib/public-locale-server';
export const dynamic='force-dynamic';
const privateRoutes=['panel','iniciar','recomendaciones','casos','tareas','documentos','empresas','calendario','facturacion','soporte','configuracion','admin','checkout'];
export default async function Page({params}:{params:Promise<{path:string[]}>}){const{path}=await params;const section=path[0];
 if(publicRoutes.includes(section))return <PublicSite section={section} sandbox={isSandbox()} locale={await getPublicLocale()}/>;
 if(['registro','ingresar'].includes(section))return <AuthForm signup={section==='registro'} sandbox={isSandbox()}/>;
 if(!privateRoutes.includes(section))notFound();const actor=await getActor();if(!actor)redirect('/ingresar');if(section==='admin'&&actor.role==='customer')redirect('/panel');return <Workspace section={section} resourceId={path[1]} actor={actor} sandbox={isSandbox()}/>;
}
