'use client';
import {useState,type FormEvent} from 'react';
import {WY_FIELDS,WY_PACKET_VERSION,emptyWyomingIntake,syntheticWyomingIntake,type WyomingFieldId} from '../../../packages/formation-packet/catalog';
import type {evaluateWyomingPacket} from '../../../packages/formation-packet/service';
import styles from './wyoming-packet.module.css';
type Result=Awaited<ReturnType<typeof evaluateWyomingPacket>>;
const routes:Record<string,string>={RECHECK_REQUIRED:'Fuentes pendientes de nueva revisión',PAPER_MANUAL_REVIEW:'Revisión del canal en papel por nombre con A',CHANNEL_REVIEW_REQUIRED:'Canal estatal pendiente de confirmar',SPECIALIZED_REVIEW:'Modalidad fuera del ensayo ordinario',EXISTING_REQUEST_REVIEW:'Conciliar EIN o solicitud anterior',MISSING_INFORMATION:'Información insuficiente para revisar el canal EIN',INTERNATIONAL_CHANNEL_REVIEW:'Revisar canal internacional con profesional',ALTERNATIVE_CHANNEL_REVIEW:'Revisar alternativa al canal en línea',ONLINE_ELIGIBILITY_REVIEW:'Revisar elegibilidad en línea; no confirmada'};

export function WyomingPacketLab({cases}:{cases:{id:string;revision:number}[]}){
  const [intake,setIntake]=useState(emptyWyomingIntake);
  const [caseId,setCaseId]=useState('');
  const [synthetic,setSynthetic]=useState(false);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState('');
  function change(key:WyomingFieldId,value:string){setIntake(previous=>({...previous,[key]:value}));setResult(null);setError('');}
  async function prepare(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');setResult(null);
    try{
      const selected=cases.find(c=>c.id===caseId);
      const response=await fetch('/api/wyoming-packet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({synthetic,intake,...(selected?{caseId:selected.id,caseRevision:selected.revision}:{})})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo preparar el paquete');setResult(data);
    }catch(e){setError(e instanceof Error?e.message:'No se pudo preparar');}finally{setBusy(false);}
  }
  function download(){if(!result)return;const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='wyoming-review-packet-synthetic.json';link.click();URL.revokeObjectURL(url);}
  return <section className={styles.packet} aria-label="Paquete de revisión de Wyoming">
    <p className={styles.eyebrow}>PRIMERA RUTA · V{WY_PACKET_VERSION}</p><h2>Preparar el expediente de Wyoming</h2>
    <p>Completa datos ficticios para comprobar qué falta y dónde se revisa cada campo. El borrador y el acuse son simulaciones internas: ningún proveedor los recibe.</p>
    <div className={styles.warning}>No ingreses datos personales reales, SSN, ITIN, EIN, pasaportes, firmas o contraseñas. Una respuesta «Sí» solo representa una declaración del ensayo; no acredita verificación, consentimiento ni disponibilidad de nombre.</div>
    <div className={styles.actions}><button type="button" className="btn secondary" disabled={busy} onClick={()=>{setIntake(syntheticWyomingIntake());setResult(null);setError('');}}>Cargar fundador ficticio</button><button type="button" className="btn secondary" disabled={busy} onClick={()=>{setIntake(emptyWyomingIntake());setResult(null);setError('');setSynthetic(false);}}>Vaciar paquete</button></div>
    <form onSubmit={prepare} autoComplete="off">
      <fieldset disabled={busy} className={styles.fields}><legend>Datos declarados para revisión</legend>
        {[...new Set(WY_FIELDS.map(f=>f.section))].map(section=><section key={section} className={styles.group}><h3>{section}</h3><div className={styles.grid}>{WY_FIELDS.filter(f=>f.section===section).map(field=><label key={field.key}>{field.label}
          {'options' in field?<select aria-label={field.label} aria-describedby={`wy-help-${field.key}`} value={intake[field.key]} onChange={e=>change(field.key,e.target.value)}><option value="">Sin completar</option>{field.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>:<input aria-label={field.label} aria-describedby={`wy-help-${field.key}`} maxLength={500} value={intake[field.key]} onChange={e=>change(field.key,e.target.value)}/>}
          <small id={`wy-help-${field.key}`}>{field.destination}</small></label>)}</div></section>)}
        <label>Vincular solo auditoría a expediente local<select value={caseId} onChange={e=>{setCaseId(e.target.value);setResult(null);}}><option value="">Sin vinculación; descargar el paquete</option>{cases.map(c=><option key={c.id} value={c.id}>Expediente {c.id.slice(0,8)} · revisión {c.revision}</option>)}</select></label>
        <p className={styles.note}>No se cargan ni reemplazan los datos de ese caso. Solo se registra el hash, versión y resultado del ensayo; el formulario no se guarda en el historial. Descargar para conservarlo. Una revisión posterior puede volverlo obsoleto.</p>
        <label className={styles.consent}><input type="checkbox" checked={synthetic} onChange={e=>{setSynthetic(e.target.checked);setResult(null);}}/>Confirmo que uso únicamente datos ficticios</label>
        <button type="submit" className="btn" disabled={!synthetic||busy}>{busy?'Preparando paquete…':'Preparar paquete de revisión'}</button>
      </fieldset>
    </form>
    {error&&<p role="alert" className={styles.warning}>{error}</p>}
    {result&&<section className={styles.result} aria-label="Resultado del paquete Wyoming">
      <h3>{result.packet.inputStatus==='COMPLETE_FOR_INTERNAL_REVIEW'?'Datos completos para revisión interna':'Faltan datos o aclaraciones'}</h3>
      <p role="status">{result.persisted?'Metadatos del ensayo guardados en el expediente.':'Paquete sin vincular; descarga para conservarlo.'} No se presentó ningún trámite.</p>
      <p><b>Estado:</b> borrador no presentable · Revisión profesional pendiente · Registro real: no</p>
      <p><b>Canal estatal:</b> {routes[result.packet.routing.filing]}</p><p><b>EIN:</b> {routes[result.packet.routing.ein]}</p>
      <p className={styles.note}>«Datos completos» solo cubre este formulario de preparación. No significa expediente suficiente para presentar ni elegibilidad confirmada.</p>
      <h3>Pendientes y responsables</h3><ul>{result.packet.blockers.map((b,i)=><li key={`${b.code}-${b.field}-${i}`}><b>{b.owner}:</b> {b.message}<small>{b.code}</small></li>)}</ul>
      <details><summary>Mapa del paquete y fuentes</summary><div className={styles.table}><table><thead><tr><th>Campo declarado</th><th>Dato ficticio</th><th>Destino / responsable</th><th>Fuente pendiente de revisión</th></tr></thead><tbody>{result.packet.fields.map(field=>{const source=result.packet.sources.find(s=>s.id===field.sourceId);return <tr key={field.key}><td>{field.label}</td><td>{field.value||'Sin completar'}</td><td>{field.destination}<small>{field.owner}</small></td><td>{source?<a href={source.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{field.sourceLocation} ↗</a>:field.sourceLocation}</td></tr>;})}</tbody></table></div></details>
      <details><summary>Entrega a proveedor: qué falta acordar</summary><ol>{result.packet.partnerChecklist.map(item=><li key={item}>{item}</li>)}</ol><p>Acuse ficticio: solo valida el formato interno. Aceptación por proveedor: no. Presentación externa: bloqueada.</p><code>{result.receipt.receiptId}</code></details>
      <p className={styles.note}>Fuentes observadas: {result.packet.sources[0].observedAt}. Reconsultar antes de {result.packet.sources[0].recheckAfter}. No es una fecha efectiva de ley.</p>
      <p className={styles.note}>Huella del contenido (no firma): <code>{result.packet.packetHash}</code></p>
      <button type="button" className="btn secondary" onClick={download}>Descargar paquete Wyoming JSON</button>
    </section>}
  </section>;
}
