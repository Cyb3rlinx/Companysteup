'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { CountryGuide, GuideId } from '../../../packages/formation-guidance/catalog';
import type { Evaluation, Scenario } from '../../../packages/formation-guidance';
import styles from './agent-lab.module.css';

type Guide = CountryGuide & {scenarios: {id: Scenario; label: string}[]};
type Result = Evaluation & {caseId: string | null; persisted: boolean};
const stageNames = {INTAKE_INCOMPLETE: 'Onboarding incompleto', RESEARCH_ESCALATION: 'Requiere investigación y revisión', DRAFT_HANDOFF: 'Preparación de entrega, sin presentar'};
const ownerNames = {PLATFORM: 'Plataforma', USER: 'Usuario', PROVIDER: 'Proveedor', GOVERNMENT: 'Autoridad', REVIEWER: 'Revisor humano'};
const resultNames = {PREPARED: 'Preparado en simulación', BLOCKED: 'Bloqueado', NOT_ATTEMPTED: 'No intentado'};
export function AgentLab({name, version, observedAt, recheckAfter, guides, cases}: {
  name: string; version: string; observedAt: string; recheckAfter: string;
  guides: Guide[]; cases: {id: string; jurisdiction: string}[];
}) {
  const [selected, setSelected] = useState<GuideId>('US-WY');
  const [scenario, setScenario] = useState<Scenario>('base');
  const [caseId, setCaseId] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const guide = guides.find(g => g.id === selected)!;
  const result = results.find(r => r.guideId === selected && r.scenario === scenario && (r.caseId || '') === caseId);
  async function run(all: boolean) {
    setBusy(true); setError('');
    try {
      const targets = all ? guides.map(g => ({guideId: g.id, scenario: 'base' as Scenario})) : [{guideId: selected, scenario, ...(caseId ? {caseId} : {})}];
      for (const target of targets) {
        const response = await fetch('/api/agent-lab-evaluate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(target)});
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo ejecutar la prueba');
        setResults(previous => [data, ...previous.filter(r => !(r.guideId === data.guideId && r.scenario === data.scenario && r.caseId === data.caseId))]);
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Error de prueba'); }
    finally { setBusy(false); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({version, synthetic: true, results}, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'agent-lab-synthetic-report.json'; link.click(); URL.revokeObjectURL(url);
  }
  return <main className={styles.lab}>
    <header className={styles.header}><Link href="/panel">← Volver a mi espacio</Link><span>INVESTIGACIÓN INTERNA · {name}</span></header>
    <div className={styles.heading}><div><p className={styles.eyebrow}>CONTROL DE ALCANCE · {version}</p><h1>Laboratorio de agentes</h1><p>Un recorrido por jurisdicción. Cada dato con su destino; cada límite con su responsable.</p></div><button className="btn" disabled={busy} onClick={() => run(true)}>{busy ? 'Evaluando…' : 'Evaluar las 7 rutas'}</button></div>
    <aside className={styles.warning}><strong>SANDBOX · Revisión humana pendiente</strong><p>Supervisor determinista con escenarios ficticios. No es una prueba de un modelo de IA autónomo ni una constitución real. No accedemos a cuentas oficiales, no firmamos y no enviamos solicitudes o pagos.</p><p>Fuentes públicas observadas: {observedAt.slice(0,10)}. Nueva revisión interna antes de {recheckAfter.slice(0,10)}; esta fecha no determina vigencia legal.</p></aside>
    <div className={styles.routes} aria-label="Jurisdicciones de investigación">{guides.map(g => <button key={g.id} disabled={busy} aria-pressed={selected === g.id} onClick={() => {setSelected(g.id); setScenario('base'); setCaseId(''); setError('');}}><span>{g.id}</span><strong>{g.name}</strong><small>{g.scope === 'EXISTING_ROUTE' ? 'Ruta existente · preparación' : 'Investigación · no ofrecida'}</small></button>)}</div>
    <section className={styles.content} aria-label="Detalle de la guía">
      <div><p className={styles.eyebrow}>{guide.agent}</p><h2>{guide.name} · {guide.route}</h2><p>{guide.opportunity}</p><p className={styles.limit}>{guide.limitation}</p></div>
      <div className={styles.form}><label>Escenario de prueba<select disabled={busy} value={scenario} onChange={e => setScenario(e.target.value as Scenario)}>{guide.scenarios.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
      <label>Expediente para registrar la evaluación<select disabled={busy} value={caseId} onChange={e => setCaseId(e.target.value)}><option value="">Ensayo sin vincular expediente</option>{cases.filter(c => c.jurisdiction === selected).map(c => <option key={c.id} value={c.id}>Expediente {c.id.slice(0,8)}</option>)}</select></label>
      <button className="btn" disabled={busy} onClick={() => run(false)}>Probar este escenario</button></div>
      <p className={styles.note}>La prueba usa un fixture, no los datos del expediente. Vincularlo solo agrega un evento de auditoría; no avanza su trámite. Las rutas nuevas no generan casos comerciales.</p>
      {error && <p role="alert" className={styles.warning}>{error}</p>}
      {result && <section aria-label="Resultado de la evaluación" className={styles.result}><h3>{stageNames[result.maximumStage]}</h3><p><strong>Registro real: no · Escrituras externas: {result.externalWrites}</strong></p><p>{result.persisted ? 'Evaluación sintética guardada en el historial del expediente.' : 'Ensayo sin expediente; descarga el informe para conservarlo.'}</p><ol>{result.trace.map(t => <li key={t.stage}><div><b>{t.stage}</b><span>{ownerNames[t.owner]} · {resultNames[t.result]}</span></div><p>{t.reason}</p></li>)}</ol><details><summary>Códigos de bloqueo para auditoría</summary><ul>{result.blockers.map(b => <li key={b}><code>{b}</code></li>)}</ul></details></section>}
      <h3>Qué información va en cada sitio</h3><p>No ingreses pasaportes, identificadores fiscales ni credenciales aquí. Este mapa orienta la revisión del formulario; no certifica que el trámite autenticado esté disponible.</p>
      <div className={styles.tableWrap}><table><thead><tr><th>Información</th><th>Dónde se ingresa o verifica</th><th>Quién la ingresa</th><th>Evidencia</th></tr></thead><tbody>{guide.fields.map(f => {const source = guide.sources.find(s => s.id === f.sourceId)!; return <tr key={f.field}><td>{f.field}{f.sensitive && <small>Solo canal seguro autorizado</small>}</td><td>{f.destination}</td><td>{f.enteredBy}</td><td><a href={source.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Fuente oficial ↗</a></td></tr>;})}</tbody></table></div>
      <div className={styles.handoff}><h3>Hasta dónde llega nuestro servicio</h3><p>Entrevista, lista de información, enlaces oficiales y borrador de entrega para revisión. La resolución del registro requiere evidencia emitida por la autoridad.</p><p><b>Entrega a usuario/proveedor:</b> {guide.handoff}</p><p><b>Para habilitar esta ruta:</b> {guide.nextResearch}</p></div>
      <h3>Fuentes y límite de verificación</h3><ul className={styles.sources}>{guide.sources.map(s => <li key={s.id}><a href={s.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{s.title} ↗</a><small>{s.observation === 'RELOCATED' ? 'Enlace trasladado; información actual por confirmar' : s.observation === 'PUBLIC_PORTAL_ONLY' ? 'Solo acceso público observado; formulario autenticado no probado' : 'Contenido público consultado; aprobación profesional pendiente'}</small></li>)}</ul>
    </section>
    <section className={styles.content} aria-label="Comparación de resultados"><div className={styles.header}><h2>Bitácora de esta sesión</h2><button className="btn secondary" onClick={download} disabled={!results.length || busy}>Descargar informe JSON</button></div><p>Los resultados de esta tabla se reinician al recargar. Los vinculados a un expediente permanecen en su historial.</p><div className={styles.tableWrap}><table><thead><tr><th>Agente / ruta</th><th>Escenario</th><th>Máximo alcance</th><th>Registro real</th></tr></thead><tbody>{results.map(r => <tr key={`${r.guideId}-${r.scenario}-${r.caseId}`}><td>{r.agent}</td><td>{guides.find(g => g.id === r.guideId)?.scenarios.find(s => s.id === r.scenario)?.label}</td><td>{stageNames[r.maximumStage]}</td><td>No</td></tr>)}</tbody></table></div>{!results.length && <p>Ejecuta una evaluación para comparar los límites.</p>}</section>
  </main>;
}
