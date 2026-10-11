"use client";
import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Check } from 'lucide-react';
import { matchesSpeech } from '@/lib/speech-answer';
import styles from './lesson.module.css';
type ResultEvent={resultIndex?:number;results:ArrayLike<{isFinal:boolean;length:number;[index:number]:{transcript:string}}>};
type Recognition={lang:string;continuous:boolean;interimResults:boolean;maxAlternatives:number;onstart:(()=>void)|null;onaudiostart:(()=>void)|null;onspeechend:(()=>void)|null;onresult:((event:ResultEvent)=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;abort:()=>void;stop:()=>void};
type SpeechWindow=Window & {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
type Phase='idle'|'starting'|'listening'|'processing'|'matched'|'uncertain'|'error';
const errorMessages:Record<string,string>={
 'not-allowed':'O navegador não liberou o reconhecimento automático.',
 'service-not-allowed':'Este navegador não liberou o serviço de reconhecimento.',
 'audio-capture':'O serviço de reconhecimento não conseguiu acessar o áudio.',
 'network':'O serviço de reconhecimento não respondeu à conexão.',
 'no-speech':'O serviço não reconheceu uma fala nesta tentativa.',
};
export default function SpeakingExercise({target,disabled,onAccepted,onUncertain,onReset,onBeforeListen}:{target:string;disabled:boolean;onAccepted:()=>void;onUncertain?:()=>void;onReset:()=>void;onBeforeListen:()=>void}) {
 const recognition=useRef<Recognition|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),session=useRef(0);
 const stream=useRef<MediaStream|null>(null),audio=useRef<AudioContext|null>(null),frame=useRef<number|null>(null),meter=useRef<HTMLDivElement|null>(null);
 const transcripts=useRef<string[]>([]),recognitionEnded=useRef(false),serviceFailure=useRef(''),finishing=useRef(false);
 const [phase,setPhase]=useState<Phase>('idle'),[message,setMessage]=useState(''),[heard,setHeard]=useState(''),[notice,setNotice]=useState('');
 const [consent,setConsent]=useState(false),[fallback,setFallback]=useState(false),[permissionDenied,setPermissionDenied]=useState(false);
 const busy=['starting','listening','processing'].includes(phase);
 function clearTimer(){if(timer.current)clearTimeout(timer.current);timer.current=null;}
 function releaseCapture(){
  if(frame.current!==null)cancelAnimationFrame(frame.current);frame.current=null;
  stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;
  void audio.current?.close().catch(()=>{});audio.current=null;meter.current?.style.setProperty('--voice-level','0');
 }
 function releaseRecognition(){const rec=recognition.current;recognition.current=null;if(rec){rec.onstart=null;rec.onaudiostart=null;rec.onspeechend=null;rec.onresult=null;rec.onerror=null;rec.onend=null;try{rec.abort();}catch{}}}
 function detach(){clearTimer();releaseRecognition();releaseCapture();}
 useEffect(()=>{const attempt=session;return()=>{attempt.current++;detach();};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 function failCapture(text:string){session.current++;detach();setPhase('error');setMessage(text);}
 function finishResult(){
  detach();const accepted=matchesSpeech(target,transcripts.current);
  setHeard(accepted?transcripts.current.find(text=>matchesSpeech(target,[text]))||transcripts.current[0]:transcripts.current[0]||'');
  if(accepted){setPhase('matched');setMessage('Entendi! Vamos para a próxima descoberta.');onAccepted();}
  else if(serviceFailure.current){setPhase('error');setMessage(`${serviceFailure.current} Sua tentativa foi captada pelo microfone, mas não foi avaliada automaticamente. Você pode tentar novamente ou praticar com seu responsável.`);}
  else{onUncertain?.();setPhase('uncertain');setMessage('Não consegui entender com segurança. Isso não quer dizer que você falou errado. Vamos tentar de novo, com calma.');}
 }
 function finish(){
  if(finishing.current||!stream.current)return;
  finishing.current=true;setPhase('processing');setMessage('Você terminou. Estou conferindo sua tentativa…');clearTimer();
  const rec=recognition.current;
  if(!rec||recognitionEnded.current||serviceFailure.current||matchesSpeech(target,transcripts.current)){finishResult();return;}
  timer.current=setTimeout(finishResult,8000);
  try{rec.stop();}catch{serviceFailure.current='Não consegui concluir o reconhecimento automático.';finishResult();}
 }
 async function start(){
  if(!consent||disabled||busy||stream.current)return;
  detach();const id=++session.current;finishing.current=false;transcripts.current=[];recognitionEnded.current=false;serviceFailure.current='';
  onBeforeListen();onReset();setPermissionDenied(false);setHeard('');setNotice('');setFallback(false);setPhase('starting');setMessage('Preparando o microfone…');
  const current=()=>session.current===id;
  if(!navigator.mediaDevices?.getUserMedia){failCapture('Este navegador não permite acessar o microfone nesta página. Abra a atividade em um navegador com acesso ao microfone.');return;}
  timer.current=setTimeout(()=>{if(current())failCapture('A permissão do microfone ainda não foi liberada. Confira a solicitação do navegador e tente novamente.');},20000);
  let capture:MediaStream;
  try{capture=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});}catch(error){if(current()){const name=error&&typeof error==='object'&&'name' in error?String(error.name):'';setPermissionDenied(name==='NotAllowedError'||name==='SecurityError');failCapture(name==='NotAllowedError'?'O acesso ao microfone foi negado. Libere a permissão do microfone no navegador para tentar novamente.':'Não consegui acessar o microfone. Confira o dispositivo e as permissões do navegador.');}return;}
  if(!current()){capture.getTracks().forEach(track=>track.stop());return;}
  stream.current=capture;clearTimer();
  capture.getAudioTracks().forEach(track=>{track.onended=()=>{if(current()&&!finishing.current)failCapture('O microfone foi desconectado. Confira o dispositivo e tente novamente.');};});
  // Capture and volume feedback are independent of the remote recognition service.
  setPhase('listening');setMessage(`Pode falar: ${target.toLocaleLowerCase('pt-BR')}. Depois, toque em “Terminei de falar”.`);
  timer.current=setTimeout(finish,30000);
  try{const ctx=new AudioContext();audio.current=ctx;void ctx.resume().catch(()=>{});const analyser=ctx.createAnalyser();analyser.fftSize=256;ctx.createMediaStreamSource(capture).connect(analyser);const samples=new Uint8Array(analyser.fftSize);
   const tick=()=>{if(!current()||finishing.current)return;analyser.getByteTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((sum,n)=>sum+((n-128)/128)**2,0)/samples.length);meter.current?.style.setProperty('--voice-level',String(Math.min(1,rms*5)));frame.current=requestAnimationFrame(tick);};tick();
  }catch{/* Optional volume visualization does not block microphone capture. */}
  const w=window as SpeechWindow;const Constructor=w.SpeechRecognition||w.webkitSpeechRecognition;
  const recognitionFailure=(text:string)=>{serviceFailure.current=text;setNotice(`${text} O microfone continua captando sua tentativa. Toque em “Terminei de falar” quando acabar.`);};
  if(!Constructor){recognitionFailure('Este navegador não oferece reconhecimento automático.');return;}
  const rec=new Constructor();recognition.current=rec;rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=5;
  const valid=()=>current()&&recognition.current===rec;
  // Pauses never stop capture. The child controls when the attempt ends.
  rec.onstart=null;rec.onaudiostart=null;rec.onspeechend=null;
  rec.onresult=event=>{
   if(!valid())return;const candidates:string[]=[],segments:string[]=[];
   for(let i=0;i<event.results.length;i++){const result=event.results[i];if(!result.isFinal)continue;segments.push(result[0].transcript);for(let j=0;j<result.length;j++)candidates.push(result[j].transcript);}
   if(segments.length>1)candidates.push(segments.join(' '));transcripts.current=candidates;
   if(finishing.current&&candidates.length)finishResult();
  };
  rec.onerror=event=>{if(!valid())return;if(event.error==='not-allowed')setPermissionDenied(true);recognitionEnded.current=true;recognitionFailure(errorMessages[event.error]||'O reconhecimento automático foi interrompido.');if(finishing.current)finishResult();};
  rec.onend=()=>{if(!valid())return;recognitionEnded.current=true;if(finishing.current)finishResult();else if(!transcripts.current.length&&!serviceFailure.current)recognitionFailure('O serviço de reconhecimento encerrou antes de receber uma resposta.');};
  try{rec.start();}catch{recognitionEnded.current=true;recognitionFailure('O reconhecimento automático não iniciou neste navegador.');}
 }
 const title=phase==='starting'?'Preparando…':phase==='listening'?'Pode falar — estou escutando':phase==='processing'?'Conferindo…':phase==='matched'?'Entendi!':phase==='error'||phase==='uncertain'?'Vamos com calma':'Sua vez de falar';
 return <div className={styles.speakingPanel} data-phase={phase}>
 <div className={styles.voiceStatus} role="status" aria-live="polite"><span className={styles.voiceBadge}>{phase==='matched'?<Check size={32} aria-hidden="true"/>:<Mic size={32} aria-hidden="true"/>}</span><strong>{title}</strong><p>{message||'Toque em Começar a falar. Espere “Pode falar” e diga a palavra no seu ritmo.'}</p></div>
 <div ref={meter} className={styles.voiceMeter} aria-hidden="true">{[.45,.75,1,.75,.45].map((scale,i)=><span key={i} style={{height:`${12+scale*30}px`}}/>)}</div>
 {!consent&&!busy&&<div className={styles.voicePermission}><p>Com o responsável: o navegador pode enviar áudio ao serviço de reconhecimento. O NeuroLearn não grava nem salva sua voz.</p><label className={styles.microphoneConsent}><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Podemos usar o microfone nesta atividade.</label></div>}
 {!disabled&&phase!=='matched'&&<button className={styles.primary} disabled={phase==='starting'||phase==='processing'||!consent} onClick={()=>phase==='listening'?finish():void start()}>{phase==='listening'?<Square size={20} aria-hidden="true"/>:<Mic size={20} aria-hidden="true"/>}{phase==='starting'?'Preparando microfone…':phase==='processing'?'Conferindo sua fala…':phase==='listening'?'Terminei de falar':phase==='uncertain'||phase==='error'?'Tentar novamente':'Começar a falar'}</button>}
 {!busy&&permissionDenied&&<div className={styles.voicePermission} role="status"><strong>Vamos liberar o microfone</strong><p>Com seu responsável, abra as permissões deste site pelo ícone ao lado do endereço. Em Microfone, escolha Permitir. Depois, toque em Tentar novamente.</p><p>Se você salvou a recusa, o navegador pode bloquear sem perguntar de novo. O aplicativo não consegue desfazer essa escolha sozinho.</p></div>}
 {notice&&<p className={styles.voiceServiceNotice} role="status">{notice}</p>}
 {heard&&!busy&&<details><summary>Ver o que o navegador entendeu</summary><p>{heard}</p></details>}
 {!busy&&!disabled&&phase!=='matched'&&<details className={styles.voiceAlternative}><summary>Prefiro praticar com meu responsável</summary><p>Diga “{target}” com calma. Seu responsável pode acompanhar, sem reconhecimento automático.</p>{!fallback?<button className={styles.secondary} onClick={()=>setFallback(true)}>Começar prática acompanhada</button>:<button className={styles.secondary} onClick={()=>{setPhase('matched');setMessage('Prática acompanhada concluída. Você pode continuar.');setNotice('');onAccepted();}}>Concluímos a prática juntos</button>}</details>}
 </div>;
}
