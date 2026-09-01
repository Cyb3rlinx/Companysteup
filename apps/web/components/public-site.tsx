'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Globe2, ShieldCheck, Route, CalendarDays, Plus } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { setPublicLocale } from '../app/actions/public-locale';
import type { PublicLocale } from '../lib/public-locale';
import { publicCopy } from './public-copy';

const destinations = [
  { code: 'US-DE', entity: 'LLC', href: '/delaware' },
  { code: 'US-WY', entity: 'LLC', href: '/wyoming' },
  { code: 'EE', entity: 'OÜ', href: '/estonia' },
  { code: 'GB', entity: 'Ltd', href: '/reino-unido' },
];
const navPaths = ['/como-funciona', '/comparar', '/cumplimiento', '/precios'];
const footerPaths = ['/alcance', '/privacidad', '/terminos'];

function LanguageButtons({ locale }: { locale: PublicLocale }) {
  const { pending } = useFormStatus();
  return <>
    <button type="submit" name="locale" value="en" lang="en" aria-label="English" aria-pressed={locale === 'en'} disabled={pending}>EN</button>
    <button type="submit" name="locale" value="es" lang="es-419" aria-label="Español" aria-pressed={locale === 'es'} disabled={pending}>ES</button>
  </>;
}

export function PublicSite({ section, sandbox, locale }: { section: string; sandbox: boolean; locale: PublicLocale }) {
  const [menu, setMenu] = useState(false);
  const t = publicCopy[locale];
  const countries = destinations.map((c, i) => ({ ...c, ...t.countries[i] }));
  const country = countries.find(c => c.href === '/' + section);
  const legalTitle = t.legalTitles[section as keyof typeof t.legalTitles];
  const principlesIcons = [CalendarDays, ShieldCheck, Globe2];
  const countryIcons = [Route, ShieldCheck];

  return <div className="public-site" lang={locale === 'en' ? 'en' : 'es-419'}>
    <header className="public-header">
      <Link className="brand" href="/"><span className="brand-symbol">n</span>nexo<span className="brand-caption">COMPANY OS</span></Link>
      <button className="mobile-toggle" onClick={() => setMenu(!menu)} aria-label={menu ? t.closeMenu : t.openMenu} aria-expanded={menu} aria-controls="public-navigation">☰</button>
      <nav id="public-navigation" aria-label={t.navigation} className={menu ? 'open' : ''}>
        {navPaths.map((href, i) => <Link key={href} href={href} onClick={() => setMenu(false)}>{t.nav[i]}</Link>)}
      </nav>
      <div className="header-actions">
        <Link className="public-sign-in" href="/ingresar">{t.signIn}</Link>
        <form className="language-switch" action={setPublicLocale} aria-label={t.language}><LanguageButtons locale={locale}/></form>
        <Link className="btn small" href="/registro">{t.start} <ArrowUpRight size={15}/></Link>
      </div>
    </header>
    {sandbox && <div className="public-sandbox">{t.sandbox} <span>{t.sandboxNote}</span></div>}
    <main>
      {section === 'inicio' && <>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="live-dot"/> {t.eyebrow}</span>
            <h1>{t.hero[0]}<br/><em>{t.hero[1]}</em><br/>{t.hero[2]}</h1>
            <p>{t.intro}</p>
            <div className="hero-actions"><Link className="btn" href="/registro">{t.build} <ArrowRight size={18}/></Link><Link className="text-link" href="/comparar">{t.explore} <ArrowUpRight size={16}/></Link></div>
            <div className="hero-note"><ShieldCheck size={16}/> {t.heroNote}</div>
          </div>
          <div className="hero-surface">
            <div className="surface-top"><span className="small-caps">{t.map}</span><span className="badge green">{t.routes}</span></div>
            <h2>{t.mapTitle[0]}<br/>{t.mapTitle[1]}</h2>
            <div className="route-lines">{t.steps.map(([n, title, desc], i) => <div className="route-line" key={n}><span className={i === 0 ? 'route-number selected' : 'route-number'}>{i === 0 ? <Check size={17}/> : n}</span><div><b>{title}</b><p>{desc}</p></div>{i === 1 && <span className="route-current">{t.next}</span>}</div>)}</div>
            <div className="surface-footer"><Globe2 size={18}/><span>{t.countriesLine}</span></div>
          </div>
        </section>
        <section className="trust-strip"><span>{t.responsibilities}</span>{['you', 'prepare', 'partner', 'government'].map((actor, i) => <div key={actor}><span className={'actor-dot ' + actor}/>{t.actors[i]}</div>)}</section>
      </>}
      {(section === 'inicio' || section === 'comparar') && <section className="public-section">
        <div className="section-heading"><div><span className="eyebrow">{t.choose}</span><h2>{t.compareTitle}</h2></div><p>{t.compareIntro[0]}<br/>{t.compareIntro[1]}</p></div>
        <div className="country-grid">{countries.map((c, i) => <Link href={c.href} className="country-card" key={c.code}><span className={'country-code country-' + i}>{c.code}</span><ArrowUpRight size={18}/><h3>{c.name} <span>{c.entity}</span></h3><p>{c.tag}</p><div>{t.explorePath} <ArrowRight size={15}/></div></Link>)}</div>
        <p className="fine-print">{t.compareNote}</p>
      </section>}
      {country && <section className="public-section narrow"><span className="eyebrow">{country.code} · {t.formationPath}</span><h1>{country.name} <em>{country.entity}</em></h1><p className="lead">{country.tag}. {t.countryIntro}</p><div className="feature-grid">{t.countryFeatures.map(([title, desc], i) => { const Icon = countryIcons[i]; return <article key={title}><Icon/><h3>{title}</h3><p>{desc}</p></article>; })}</div><Link className="btn" href="/registro">{t.evaluate} <ArrowRight size={16}/></Link></section>}
      {section === 'como-funciona' && <section className="public-section narrow"><span className="eyebrow">{t.howEyebrow}</span><h1>{t.howTitle[0]}<br/><em>{t.howTitle[1]}</em></h1>{t.howSteps.map(([n, title, desc]) => <article className="how-step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{desc}</p></div></article>)}<Link className="btn" href="/registro">{t.startAssessment} <ArrowRight size={16}/></Link></section>}
      {(section === 'cumplimiento' || section === 'inicio') && <section className="compliance-feature"><div><span className="eyebrow">{t.complianceEyebrow}</span><h2>{t.complianceTitle[0]}<br/><em>{t.complianceTitle[1]}</em></h2><p>{t.complianceIntro}</p><Link href="/registro" className="btn light">{t.findPath} <ArrowRight size={16}/></Link></div><div className="compliance-principles">{t.principles.map(([title, desc], i) => { const Icon = principlesIcons[i]; return <article key={title}><Icon/><div><h3>{title}</h3><p>{desc}</p></div></article>; })}</div></section>}
      {section === 'precios' && <section className="public-section narrow"><span className="eyebrow">{t.pricingEyebrow}</span><h1>{t.pricingTitle[0]}<br/><em>{t.pricingTitle[1]}</em></h1><div className="pricing-breakdown">{t.pricing.map(([n, title, desc]) => <article key={n}><span>{n}</span><div><h3>{title}</h3><p>{desc}</p></div><Plus size={20}/></article>)}</div><Link className="btn" href="/registro">{t.startAssessment} <ArrowRight size={16}/></Link></section>}
      {legalTitle && <section className="public-section narrow legal"><span className="eyebrow">{t.legalEyebrow}</span><h1>{legalTitle}</h1><p className="lead">{t.legalIntro}</p>{(section === 'privacidad' ? t.privacy : t.scope).map(([title, desc]) => <section key={title}><h3>{title}</h3><p>{desc}</p></section>)}</section>}
    </main>
    <footer className="public-footer"><Link className="brand" href="/"><span className="brand-symbol">n</span>nexo</Link><p>{t.footer}</p><nav>{footerPaths.map((href, i) => <Link href={href} key={href}>{t.footerNav[i]}</Link>)}</nav><span>{t.localeLabel}</span></footer>
  </div>;
}
