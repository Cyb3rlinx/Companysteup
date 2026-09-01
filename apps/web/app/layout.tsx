import type { Metadata } from 'next';
import { getDocumentLocale, getPublicLocale } from '../lib/public-locale-server';
import { DocumentLanguage } from '../components/document-language';
import './globals.css';
export async function generateMetadata(): Promise<Metadata> {
  const english = (await getDocumentLocale()) === 'en';
  const title = english ? 'Nexo — Your company, in order' : 'Nexo — Tu compañía, en orden';
  const description = english
    ? 'Company formation and compliance coordination for international founders. Four jurisdictions, clear steps and official sources.'
    : 'Constitución y cumplimiento para fundadores internacionales. Cuatro jurisdicciones, pasos claros y fuentes oficiales.';
  return {title:{default:title,template:'%s | Nexo'},description,robots:{index:false,follow:false},openGraph:{title,description,type:'website',locale:english?'en_US':'es_LA'}};
}
export default async function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang={(await getDocumentLocale()) === 'en' ? 'en' : 'es-419'}><body><DocumentLanguage publicLocale={await getPublicLocale()}/>{children}</body></html>;
}
