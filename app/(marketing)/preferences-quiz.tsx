"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { themes, type Preferences } from '@/lib/preferences';
import styles from './trail.module.css';
export default function PreferencesQuiz({current,onSave,onCancel}:{current:Preferences|null;onSave:(value:Preferences)=>void;onCancel:()=>void}) {
 const [step,setStep]=useState<'start'|'themes'>(current?'themes':'start');const [theme,setTheme]=useState<Preferences['theme']|''>(current?.theme||'');
 const title=useRef<HTMLHeadingElement>(null);useEffect(()=>{title.current?.focus();},[step]);
 const savePreset=(comfort:NonNullable<Preferences['comfort']>)=>onSave({...current,theme:'mixed',support:'hint',palette:'blue',comfort});
 return <section className={styles.avatarWelcome} aria-labelledby="preferences-title">
   <Image className={`${styles.quizMascot} luna-hello`} src="/mascotes/curioso.svg" alt="Luna curiosa" width={80} height={80}/>
   {step==='start' ? <>
     <p className={styles.eyebrow}>PARA COMEÇAR</p>
     <h1 id="preferences-title" ref={title} tabIndex={-1}>Como vamos começar?</h1>
     <p>Você pode escolher uma forma pronta de iniciar. Depois, tudo pode ser mudado.</p>
     <div className={styles.presetChoices}>
       <button className={styles.presetCard} onClick={()=>savePreset('00')}><span aria-hidden="true">🌿</span><strong>Começar com calma</strong><small>Menos sons e movimentos, com dicas sempre disponíveis.</small></button>
       <button className={styles.presetCard} onClick={()=>savePreset('01')}><span aria-hidden="true">✨</span><strong>Explorar aos poucos</strong><small>Movimentos suaves, dicas disponíveis e uma descoberta por vez.</small></button>
       <button className={styles.presetCard} onClick={()=>setStep('themes')}><span aria-hidden="true">🎨</span><strong>Escolher meus gostos</strong><small>Selecione o tema que você mais gosta de descobrir.</small></button>
     </div>
   </> : <>
     <p className={styles.eyebrow}>SEUS GOSTOS</p>
     <h1 id="preferences-title" ref={title} tabIndex={-1}>O que você gosta de descobrir?</h1>
     <p>Vamos trazer seus gostos para algumas atividades. As dicas da Luna continuam disponíveis.</p>
     <fieldset className={styles.avatarChoices}><legend>Seu tema favorito</legend>{themes.map(option=><label key={option.id} className={`${styles.avatarCard} ${theme===option.id?styles.avatarSelected:''}`}>
       <input type="radio" name="theme" checked={theme===option.id} onChange={()=>setTheme(option.id)}/>
       <span className={styles.preferenceIcon} aria-hidden="true">{option.icon}</span><span>{option.name}</span>{theme===option.id&&<Check className={styles.avatarCheck} size={20} aria-hidden="true"/>}
     </label>)}</fieldset>
     <div className={styles.quizActions}><button className={styles.avatarContinue} disabled={!theme} onClick={()=>onSave({...current,theme:theme as Preferences['theme'],support:'hint',palette:'blue',comfort:current?.comfort||'01'})}>{current?'Salvar escolhas':'Começar minha trilha'}<ArrowRight size={20} aria-hidden="true"/></button>
     <div className={styles.quizSecondaryActions}><button className={styles.avatarCancel} onClick={()=>current?onCancel():setStep('start')}><ArrowLeft size={16} aria-hidden="true"/> {current?'Cancelar alterações':'Voltar'}</button></div></div>
   </>}
   <p className={styles.developmentNote}>O tema branco suave com detalhes azuis é usado para começar. Você pode mudar seus gostos quando quiser.</p>
 </section>;
}
