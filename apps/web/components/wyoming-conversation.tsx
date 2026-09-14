'use client';
import {useEffect,useState,type FormEvent} from 'react';
import styles from './wyoming-packet.module.css';

type Turn={id:string;turn_kind:string;customer_message:string|null;assistant_message:string;model_status:string;created_at:string};
type Conversation={conversation:{id:string;caseId:string;status:string;executionMode:string;synthetic:boolean;state:Record<string,string>;pendingPatch:Record<string,string>;revision:number};turns:Turn[];packetPreview?:unknown};
type CaseOption={id:string;revision:number};
type Props={cases:CaseOption[];fixedCaseId?:string;readOnly?:boolean};
async function json(response:Response){const value=await response.json();if(!response.ok)throw new Error(value.error||'No se pudo completar la conversación');return value;}
const requestId=()=>crypto.randomUUID();

export function WyomingConversation({cases,fixedCaseId,readOnly=false}:Props){
 const [selectedCaseId,setSelectedCaseId]=useState('');const caseId=fixedCaseId??selectedCaseId;
 const [data,setData]=useState<Conversation|null>(null);const [loaded,setLoaded]=useState(false);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{if(!caseId)return;const controller=new AbortController();void fetch(`/api/agent-conversation?caseId=${encodeURIComponent(caseId)}`,{cache:'no-store',signal:controller.signal}).then(json).then(value=>{if(!controller.signal.aborted)setData(value)}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'No se pudo recuperar la sesión')}).finally(()=>{if(!controller.signal.aborted){setBusy(false);setLoaded(true)}});return()=>controller.abort();},[caseId]);
 function selectCase(value:string){setSelectedCaseId(value);setData(null);setError('');setLoaded(!value);setBusy(Boolean(value));}
 async function call(action:string,body:unknown){setBusy(true);setError('');try{const value=await json(await fetch(`/api/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));setData(value);window.dispatchEvent(new Event('case-tracking-updated'));}catch(e){setError(e instanceof Error?e.message:'No se pudo completar la conversación');}finally{setBusy(false);setLoaded(true);}}
 async function start(){const item=cases.find(c=>c.id===caseId);if(item)await call('agent-conversation-start',{caseId,caseRevision:item.revision,synthetic:true,clientRequestId:requestId()});}
 async function send(event:FormEvent){event.preventDefault();if(!data||!message.trim()||readOnly)return;const text=message;setMessage('');await call('agent-conversation-message',{conversationId:data.conversation.id,revision:data.conversation.revision,message:text,clientRequestId:requestId()});}
 async function confirm(accept:boolean){if(data&&!readOnly)await call('agent-conversation-confirm',{conversationId:data.conversation.id,revision:data.conversation.revision,accept,clientRequestId:requestId()});}
 const pending=data?Object.entries(data.conversation.pendingPatch):[];const completed=data?Object.values(data.conversation.state).filter(Boolean).length:0;
 return <section className={styles.packet} aria-label="Onboarding conversacional Wyoming">
  <p className={styles.eyebrow}>{readOnly?'VISTA OPERATIVA · SOLO LECTURA':'AGENTE DE INTAKE · SANDBOX'}</p><h2>Onboarding conversacional Wyoming</h2>
  <p>{readOnly?'Consulta el progreso y las confirmaciones del cliente. Esta vista no permite responder ni confirmar en su nombre.':'Usa únicamente datos ficticios. El agente propone valores y tú debes confirmarlos antes de guardarlos. No firma, paga, presenta ni responde consultas legales desde memoria.'}</p>
  {!fixedCaseId&&<label>Expediente Wyoming ficticio<select disabled={busy} value={caseId} onChange={e=>selectCase(e.target.value)}><option value="">Selecciona un expediente</option>{cases.map(c=><option key={c.id} value={c.id}>Expediente {c.id.slice(0,8)}</option>)}</select></label>}
  {fixedCaseId&&<p><small>Expediente vinculado: {fixedCaseId.slice(0,8)} · información sintética</small></p>}
  {caseId&&loaded&&!data&&!readOnly&&<button className="btn" disabled={busy} onClick={start}>{busy?'Preparando…':'Iniciar onboarding'}</button>}
  {caseId&&loaded&&!data&&readOnly&&<p role="status" className={styles.warning}>El cliente aún no inició este onboarding.</p>}
  {data&&<div className={styles.result} aria-label="Sesión de onboarding Wyoming">
   <p><strong>{completed}/21 campos confirmados · {data.conversation.executionMode}</strong></p>
   <div aria-live="polite">{data.turns.map(turn=><article key={turn.id}><p>{turn.customer_message&&<><b>Cliente ficticio:</b> {turn.customer_message}<br/></>}<b>Agente:</b> {turn.assistant_message}</p><small>{turn.model_status}</small></article>)}</div>
   {pending.length>0&&<div className={styles.confirmation}><h3>{readOnly?'Esperando confirmación del cliente':'Confirmación requerida'}</h3><ul>{pending.map(([field,value])=><li key={field}><b>{field}:</b> {value}</li>)}</ul>{!readOnly&&<><button className="btn" disabled={busy} onClick={()=>confirm(true)}>Confirmar y guardar</button> <button className="btn secondary" disabled={busy} onClick={()=>confirm(false)}>Rechazar</button></>}</div>}
   {!readOnly&&!pending.length&&data.conversation.status!=='ready_for_packet_review'&&<form onSubmit={send}><label htmlFor={`wy-agent-message-${caseId}`}>Mensaje del cliente ficticio</label><textarea id={`wy-agent-message-${caseId}`} rows={3} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Nombre propuesto: Orbit QA LLC"/><button className="btn" disabled={busy||!message.trim()}>{busy?'Procesando…':'Enviar al agente'}</button><p><small>Responde con líneas “Campo: valor”. Si existe un modelo conectado, también procesa lenguaje natural; toda propuesta requiere tu confirmación.</small></p></form>}
   {data.conversation.status==='ready_for_packet_review'&&<p role="status"><strong>Información completa para preparar una revisión interna. No está lista para presentación.</strong></p>}
  </div>}
  {!loaded&&caseId&&<p role="status">Cargando la conversación…</p>}
  {error&&<p role="alert" className={styles.warning}>{error}</p>}
 </section>;
}

export function WyomingConversationLab({cases,readOnly=false}:{cases:CaseOption[];readOnly?:boolean}){return <WyomingConversation cases={cases} readOnly={readOnly}/>;}
export function WyomingConversationCase({caseId,caseRevision,readOnly=false}:{caseId:string;caseRevision:number;readOnly?:boolean}){return <WyomingConversation cases={[{id:caseId,revision:caseRevision}]} fixedCaseId={caseId} readOnly={readOnly}/>}
