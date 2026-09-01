import { PublicSite } from '../components/public-site';
import { isSandbox } from '../lib/runtime';
import { getPublicLocale } from '../lib/public-locale-server';
export const dynamic='force-dynamic';
export default async function Home(){return <PublicSite section="inicio" sandbox={isSandbox()} locale={await getPublicLocale()}/>;}
