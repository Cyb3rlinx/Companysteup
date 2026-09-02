import { notFound, redirect } from 'next/navigation';
import { getActor, userRepository } from '../../lib/auth';
import { isSandbox } from '../../lib/runtime';
import { AgentLab } from '../../components/agent-lab';
import { COUNTRY_GUIDES, GUIDE_VERSION, assertLabAccess, scenariosFor, scenarioLabels, OBSERVED_AT, RECHECK_AFTER } from '../../../../packages/formation-guidance';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'Laboratorio de agentes · Investigación interna', robots: {index: false, follow: false}};
export default async function Page() {
  const actor = await getActor();
  if (!actor) redirect('/ingresar');
  try { assertLabAccess(isSandbox(), actor.role); } catch { notFound(); }
  const cases = await (await userRepository(actor)).list('formation_cases');
  return <AgentLab name={actor.displayName} version={GUIDE_VERSION} observedAt={OBSERVED_AT} recheckAfter={RECHECK_AFTER}
    guides={COUNTRY_GUIDES.map(g => ({...g, scenarios: scenariosFor(g.id).map(id => ({id, label: scenarioLabels[id]}))}))}
    cases={cases.map(c => ({id: String(c.id), jurisdiction: String(c.jurisdiction_code)}))}/>;
}
