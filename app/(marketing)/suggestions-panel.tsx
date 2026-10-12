"use client";
import {useEffect,useMemo,useRef,useState} from 'react';
import type {Experience} from '@/lib/experience-values';
import {lessons} from '@/lib/lessons';
import {personalizedLesson} from '@/lib/personalized-lessons';
import {themes,type Preferences} from '@/lib/preferences';
import {activitySuggestions,interestQueries} from '@/lib/activity-suggestions';
import LunaMessage from './luna-message';
import styles from './discovery.module.css';
export default function SuggestionsPanel({completed,experience,preferences,onBack,onOpen}:{completed:number;experience:Experience;preferences:Preferences;onBack:()=>void;onOpen:(index:number)=>void}){
 const [theme,setTheme]=useState(preferences.theme);
 const [scores,setScores]=useState<number[]>();
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState('');
 const worker=useRef<Worker|null>(null);const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
 const candidates=useMemo(()=>lessons.slice(0,completed+1).map((_,index)=>{const lesson=personalizedLesson(index,preferences);return {index,title:lesson.title,description:`${lesson.title}. ${lesson.exercises.map(e=>e.prompt+' '+(e.word||e.pictureLabel||'')).join(' ')}`};}),[completed,preferences]);
 const suggestions=activitySuggestions(candidates,completed,experience.stats,scores);
 function stop(){if(worker.current){worker.current.onmessage=null;worker.current.onerror=null;worker.current.terminate();}worker.current=null;if(timeout.current)clearTimeout(timeout.current);timeout.current=null;}
 useEffect(()=>()=>{worker.current?.terminate();if(timeout.current)clearTimeout(timeout.current);},[]);
 function refine(){
  if(busy||candidates.length<2)return;
  setBusy(true);setScores(undefined);setStatus('Preparando as sugestões neste aparelho…');
  try{
   const instance=new Worker(new URL('./suggestions.worker.ts',import.meta.url),{type:'module'});worker.current=instance;
   const fail=()=>{stop();setBusy(false);setStatus('Vamos usar as sugestões leves. Você pode continuar normalmente.');};
   timeout.current=setTimeout(fail,90000);instance.onerror=fail;
   instance.onmessage=(event:MessageEvent)=>{
    const data=event.data;
    if(data.type==='progress')setStatus(`Baixando um arquivo do modelo: ${Math.max(0,Math.min(100,data.progress))}%. Você pode cancelar.`);
    if(data.type==='error')fail();
    if(data.type==='complete'){
     const valid=Array.isArray(data.scores)&&data.scores.length===candidates.length&&data.scores.every((n:unknown)=>typeof n==='number'&&Number.isFinite(n));
     if(!valid){fail();return;}setScores(data.scores);stop();setBusy(false);setStatus('Sugestões relacionadas ao tema, calculadas neste aparelho.');
    }
   };
   instance.postMessage({query:interestQueries[theme],descriptions:candidates.map(c=>c.description)});
  }catch{stop();setBusy(false);setStatus('As sugestões leves continuam disponíveis neste navegador.');}
 }
 return <section className={styles.panel} aria-labelledby="suggestions-title">
  <button className={styles.button} onClick={onBack}>← Voltar à trilha</button>
  <h1 id="suggestions-title">Sugestões da Luna</h1>
  <LunaMessage>Podemos seguir para uma nova descoberta ou praticar um pouco. Você escolhe!</LunaMessage>
  <div className={styles.favorites}>{suggestions.map(s=><article key={s.index}><small>{s.reason}</small><h2>{s.title}</h2><button className={styles.button} onClick={()=>onOpen(s.index)}>{s.index===completed?'Continuar':'Praticar esta atividade'} →</button></article>)}</div>
  <details className={styles.localOption}><summary>Relacionar sugestões aos meus gostos</summary>
   <p>Esta opção usa IA neste aparelho. O primeiro download tem cerca de 150 MB e pode demorar ou consumir bateria. As sugestões acima já funcionam sem esse download.</p>
   <fieldset disabled={busy}><legend>Qual tema vamos explorar?</legend><div className={styles.favoriteActions}>{themes.map(t=><button type="button" className={styles.button} key={t.id} aria-pressed={theme===t.id} onClick={()=>{setTheme(t.id);setScores(undefined);setStatus('');}}>{t.icon} {t.name}</button>)}</div></fieldset>
   {candidates.length<2?<p>Depois da primeira etapa, haverá mais atividades para relacionar.</p>:<div className={styles.favoriteActions}><button className={styles.button} disabled={busy} onClick={refine}>Testar sugestões neste aparelho</button>{busy&&<button className={styles.button} onClick={()=>{stop();setBusy(false);setStatus('Download e processamento interrompidos. As sugestões leves continuam disponíveis.');}}>Cancelar</button>}</div>}
   <p>O navegador baixa arquivos da Hugging Face. O cálculo é local; nomes, respostas e histórico não são enviados ao serviço. Os arquivos podem ficar no cache do navegador.</p>
  </details><p role="status" aria-live="polite">{status}</p>
 </section>;
}
