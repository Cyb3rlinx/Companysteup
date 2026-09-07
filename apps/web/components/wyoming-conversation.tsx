'use client';
import {useEffect,useState,type FormEvent} from 'react';
import styles from './wyoming-packet.module.css';

type Turn={id:string;turn_kind:string;customer_message:string|null;assistant_message:string;model_status:string;created_at:string};
type Conversation={conversation:{id:string;caseId:string;status:string;executionMode:string;synthetic:boolean;state:Record<string,string>;pendingPatch:Record<string,string>;revision:number};turns:Turn[];packetPreview?:unknown};
async function json(response:Response){const value=await response.json();if(!response.ok)throw new Error(value.error||'No se pudo completar la conversación');return value;}
const requestId=()=>crypto.randomUUID();

export function WyomingConversationLab({cases}:{cases:{id:string;revision:number}[]}){
 const [caseId,setCaseId]=useState('');const [data,setData]=useState<Conversation|null>(null);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{if(!caseId)return;let active=true;void fetch(`/api/agent-conversation?caseId=${encodeURIComponent(caseId)}`,{cache:'no-store'}).then(json).then(value=>{if(active)setData(value)}).catch(e=>{if(active)setError(e instanceof Error?e.message:'No se pudo recuperar la sesión')}).finally(()=>{if(active)setBusy(false)});return()=>{active=false};},[caseId]);
 function selectCase(value:string){setCaseId(value);setData(null);setError('');setBusy(Boolean(value));}
 async function call(action:string,body:unknown){setBusy(true);setError('');try{setData(await json(await fetch(`/api/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})));}catch(e){setError(e instanceof Error?e.message:'No se pudo completar la conversación');}finally{setBusy(false);}}
 async function start(){const item=cases.find(c=>c.id===caseId);if(item)await call('agent-conversation-start',{caseId,caseRevision:item.revision,synthetic:true,clientRequestId:requestId()});}
 async function send(event:FormEvent){event.preventDefault();if(!data||!message.trim())return;const text=message;setMessage('');await call('agent-conversation-message',{conversationId:data.conversation.id,revision:data.conversation.revision,message:text,clientRequestId:requestId()});}
 async function confirm(accept:boolean){if(data)await call('agent-conversation-confirm',{conversationId:data.conversation.id,revision:data.conversation.revision,accept,clientRequestId:requestId()});}
 const pending=data?Object.entries(data.conversation.pendingPatch):[];const completed=data?Object.values(data.conversation.state).filter(Boolean).length:0;
 return <section className={styles.packet} aria-label="Onboarding conversacional Wyoming">
  <p className={styles.eyebrow}>AGENTE DE INTAKE · SANDBOX</p><h2>Conversación persistente Wyoming</h2>
  <p>Usa únicamente datos ficticios. El agente propone valores; tú debes confirmarlos antes de guardarlos. No firma, paga, presenta ni responde consultas legales desde memoria.</p>
  <label>Expediente Wyoming ficticio<select disabled={busy} value={caseId} onChange={e=>selectCase(e.target.value)}><option value="">Selecciona un expediente</option>{cases.map(c=><option key={c.id} value={c.id}>Expediente {c.id.slice(0,8)}</option>)}</select></label>
  {caseId&&!data&&<button className="btn" disabled={busy} onClick={start}>{busy?'Preparando…':'Iniciar conversación'}</button>}
  {data&&<div className={styles.result} aria-label="Sesión de onboarding Wyoming">
   <p><strong>{completed}/21 campos confirmados · {data.conversation.executionMode}</strong></p>
   <div aria-live="polite">{data.turns.map(turn=><article key={turn.id}><p>{turn.customer_message&&<><b>Cliente ficticio:</b> {turn.customer_message}<br/></>}<b>Agente:</b> {turn.assistant_message}</p><small>{turn.model_status}</small></article>)}</div>
   {pending.length>0&&<div className={styles.confirmation}><h3>Confirmación requerida</h3><ul>{pending.map(([field,value])=><li key={field}><b>{field}:</b> {value}</li>)}</ul><button className="btn" disabled={busy} onClick={()=>confirm(true)}>Confirmar y guardar</button> <button className="btn secondary" disabled={busy} onClick={()=>confirm(false)}>Rechazar</button></div>}
   {!pending.length&&data.conversation.status!=='ready_for_packet_review'&&<form onSubmit={send}><label htmlFor="wy-agent-message">Mensaje del cliente ficticio</label><textarea id="wy-agent-message" rows={3} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Nombre propuesto: Orbit QA LLC"/><button className="btn" disabled={busy||!message.trim()}>{busy?'Procesando…':'Enviar al agente'}</button><p><small>Sin modelo configurado usa “Campo: valor”. Con OpenAI configurado se admite lenguaje natural, siempre con confirmación.</small></p></form>}
   {data.conversation.status==='ready_for_packet_review'&&<p role="status"><strong>Información completa para preparar una revisión interna. No está lista para presentación.</strong></p>}
  </div>}
  {error&&<p role="alert" className={styles.warning}>{error}</p>}
 </section>;
}
