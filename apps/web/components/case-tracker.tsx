'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { CaseTracking } from '../../../packages/case-tracking';
import styles from './case-tracker.module.css';
const runLabels: Record<CaseTracking['agent']['runStatus'],string> = {NOT_STARTED:'Sin ejecución disponible', RUNNING:'Preparación en curso', COMPLETED:'Resumen preparado', FAILED:'La preparación falló', UNCONFIRMED:'Ejecución sin confirmación reciente', OUTDATED:'Resumen anterior; actualizar expediente'};
export function CaseTracker({caseId, names = {}, internal = false, onUpdate}: {caseId?: string; names?: Record<string,string>; internal?: boolean; onUpdate?:()=>Promise<void>}) {
  const [cases,setCases] = useState<CaseTracking[]>([]);
  const [error,setError] = useState('');
  const [checkedAt,setCheckedAt] = useState('');
  const [busy,setBusy] = useState<string | null>(null);
  const [message,setMessage] = useState('');
  const endpoint = '/api/case-tracking'+(caseId?`?caseId=${encodeURIComponent(caseId)}`:'');
  const refresh = useCallback(async (signal?: AbortSignal) => {
    const response=await fetch(endpoint,{cache:'no-store',signal});
    if(!response.ok)throw new Error('No pudimos actualizar el seguimiento. La información anterior puede estar desactualizada.');
    const result=await response.json();if(signal?.aborted)return;
    // Keep the existing workflow, billing and summary cards synchronized too.
    await onUpdate?.();if(signal?.aborted)return;
    setCases(result.cases);setCheckedAt(result.checkedAt);setError('');
  },[endpoint,onUpdate]);
  useEffect(()=>{
    const controller=new AbortController();let loading=false;
    const update=async()=>{if(loading||document.visibilityState==='hidden')return;loading=true;try{await refresh(controller.signal);}catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'No se pudo actualizar');}finally{loading=false;}};
    void update();const interval=setInterval(()=>void update(),25000);window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);
    return()=>{controller.abort();clearInterval(interval);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);};
  },[refresh]);
  async function prepare(id:string){
    setBusy(id);setMessage('');
    try {const response=await fetch('/api/case-brief',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId:id})});const result=await response.json();if(!response.ok)throw new Error(result.error || 'No se pudo preparar el resumen');setMessage('Resumen preparado y registrado en el historial. No se presentó ninguna solicitud.');await refresh();}
    catch(e){setError(e instanceof Error?e.message:'No se pudo preparar');}finally{setBusy(null);}
  }
  return <section className={styles.tracker} aria-label={internal?'Seguimiento operativo de expedientes':'Seguimiento de mis expedientes'}>
    <header><div><span className={styles.eyebrow}>{internal?'OPERACIONES':'TU PROCESO, CON EVIDENCIA'}</span><h2>{internal?'Agentes y próximos pasos':'Seguimiento de mis expedientes'}</h2></div><button className="btn secondary small" disabled={Boolean(busy)} onClick={()=>{void refresh().catch(e=>setError(e.message));}}>Actualizar seguimiento</button></header>
    <p className={styles.note}>Se actualiza cada 25 segundos mientras esta pantalla está visible. Los porcentajes miden pasos del expediente, no probabilidades de aprobación.</p>
    {checkedAt&&<p className={styles.note}>Última consulta: {new Date(checkedAt).toLocaleString('es-419')}</p>}
    {error&&<p role="alert" className={styles.warning}>{error}</p>}{message&&<p role="status" className={styles.success}>{message}</p>}
    {!checkedAt&&!error&&<p>Cargando seguimiento…</p>}
    {checkedAt&&!cases.length&&<p>Todavía no tienes expedientes. <Link href="/iniciar">Completar onboarding</Link></p>}
    <div className={styles.grid}>{cases.map(item=><article key={item.caseId} className={styles.card}>
      <div className={styles.top}><span>{item.jurisdiction}</span><b>{item.mode==='SANDBOX'?'SANDBOX':'Expediente guiado'}</b></div>
      <h3><Link href={`/casos/${item.caseId}`}>{names[item.caseId] || `Expediente ${item.caseId.slice(0,8)}`}</Link></h3>
      <p className={styles.registration}>{item.registrationLabel}</p>
      {item.requiresEvidenceReview&&<p className={styles.warning}>El estado registrado necesita conciliación con evidencia oficial. No confirma constitución.</p>}
      <label className={styles.progress}>{item.completedSteps} de {item.totalSteps} pasos del expediente <progress max={100} value={item.progressPercent}/></label>
      <dl><dt>Paso actual</dt><dd>{item.status}</dd><dt>Responsable del paso</dt><dd>{item.nextOwner}</dd><dt>Asistente de la ruta</dt><dd>{item.agent.name}<small>Preparación determinista · v{item.agent.version}</small></dd><dt>Última ejecución</dt><dd>{busy===item.caseId?'Preparando el resumen solicitado…':runLabels[item.agent.runStatus]}</dd></dl>
      <p><b>Próxima acción:</b> {item.nextAction}</p><p className={styles.note}>{item.filingLabel}. La sesión de Google no verifica identidad ni constituye una compañía.</p>
      <details><summary>Pendientes y responsables ({item.blockers.length})</summary><ul>{item.blockers.map(b=><li key={b.code}>{b.message}<small>{b.owner}</small></li>)}</ul></details>
      <button className="btn secondary full" disabled={Boolean(busy)||!item.canPrepare} onClick={()=>prepare(item.caseId)}>Preparar resumen del expediente</button>
      <details><summary>Actividad comprobada</summary>{item.activity.length?<ol>{item.activity.map(event=><li key={event.id}>{event.label}{event.synthetic?' · SANDBOX':''}<small>{new Date(event.at).toLocaleString('es-419')}</small></li>)}</ol>:<p>Sin eventos disponibles.</p>}</details>
      <p className={styles.note}>El resumen usa tus datos guardados y no envía información a terceros. No ejecuta un modelo de IA ni avanza pasos del trámite.</p>
    </article>)}</div>
  </section>;
}
