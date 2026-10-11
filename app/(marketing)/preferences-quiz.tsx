"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { themes, type Preferences } from '@/lib/preferences';
import styles from './trail.module.css';
export default function PreferencesQuiz({current,onSave,onCancel}:{current:Preferences|null;onSave:(value:Preferences)=>void;onCancel:()=>void}) {
 const [step,setStep]=useState(0);const [theme,setTheme]=useState<Preferences['theme']|''>(current?.theme||'');const [support,setSupport]=useState<Preferences['support']|''>(current?.support||'');
 const title=useRef<HTMLHeadingElement>(null);useEffect(()=>{title.current?.focus();},[step]);
 return <section className={styles.avatarWelcome} aria-labelledby="preferences-title">
   <Image className={`${styles.quizMascot} luna-hello`} src="/mascotes/curioso.svg" alt="Luna curiosa" width={80} height={80}/>
   <p className={styles.eyebrow}>DO SEU JEITINHO • {step+1} DE 2</p>
   <h1 id="preferences-title" ref={title} tabIndex={-1}>{step===0?'O que você gosta de descobrir?':'Como você gosta de tentar?'}</h1>
   <p>{step===0?'Vamos trazer seus gostos para algumas atividades.':'Você sempre poderá pedir uma dica e aprender com calma.'}</p>
   <fieldset className={styles.avatarChoices}><legend>{step===0?'Seu tema favorito':'Sua forma de tentar'}</legend>
   {(step===0?themes:[{id:'model',name:'Ver um modelo',icon:'👀'},{id:'hint',name:'Tentar com dicas',icon:'💡'}]).map(option=><label key={option.id} className={`${styles.avatarCard} ${(step===0?theme:support)===option.id?styles.avatarSelected:''}`}>
    <input type="radio" name={`preference-${step}`} checked={(step===0?theme:support)===option.id} onChange={()=>step===0?setTheme(option.id as Preferences['theme']):setSupport(option.id as Preferences['support'])}/>
    <span className={styles.preferenceIcon} aria-hidden="true">{option.icon}</span><span>{option.name}</span>{(step===0?theme:support)===option.id&&<Check className={styles.avatarCheck} size={20} aria-hidden="true"/>}
   </label>)}</fieldset>
   <div className={styles.quizActions}><button className={styles.avatarContinue} disabled={step===0?!theme:!support} onClick={()=>step===0?setStep(1):onSave({...current,theme:theme as Preferences['theme'],support:support as Preferences['support']})}>{step===0?'Continuar':current?'Salvar escolhas':'Começar minha trilha'}<ArrowRight size={20} aria-hidden="true"/></button>
   <div className={styles.quizSecondaryActions}>{step===1&&<button className={styles.avatarCancel} onClick={()=>setStep(0)}><ArrowLeft size={16} aria-hidden="true"/> Revisar gostos</button>}
   <button className={styles.avatarCancel} onClick={()=>current?onCancel():onSave({theme:'mixed',support:'hint'})}>{current?'Cancelar alterações':'Usar escolhas sugeridas'}</button>
   </div></div><p className={styles.developmentNote}>Você pode mudar seus gostos quando quiser.</p>
 </section>;
}
