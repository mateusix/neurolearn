"use client";

import Image from "next/image";
import { ArrowLeft, Heart } from "lucide-react";
import { useState } from "react";
import styles from "./trail.module.css";

const emotions = [
  { id:"feliz", title:"Feliz", image:"feliz", prompt:"Que bom! Vamos aproveitar essa energia para fazer uma descoberta?" },
  { id:"triste", title:"Triste", image:"pensativo", prompt:"Tudo bem ficar triste às vezes. Quer fazer uma atividade bem calma comigo?" },
  { id:"bravo", title:"Bravo", image:"concentrado", prompt:"Às vezes ficamos bravos. Vamos respirar devagar e escolher o próximo passo?" },
  { id:"cansado", title:"Cansado", image:"descansando", prompt:"Descansar também é importante. Você pode fazer uma pausa e voltar quando quiser." },
  { id:"curioso", title:"Curioso", image:"curioso", prompt:"Que legal querer descobrir! Vamos explorar uma palavra ou uma história nova?" },
] as const;

export default function EmotionsPanel({onBack}:{onBack:()=>void}) {
 const [selected,setSelected]=useState<typeof emotions[number]['id']|null>(null);
 const feeling=emotions.find(item=>item.id===selected);
 return <section className={styles.journey} aria-labelledby="emotions-title">
   <button className={styles.back} onClick={onBack}><ArrowLeft size={18} aria-hidden="true"/> Voltar à trilha</button>
   <div className={styles.emotionsHeading}><p className={styles.eyebrow}>UM MOMENTO PARA VOCÊ</p><h1 id="emotions-title"><Heart size={27} aria-hidden="true"/> Emoções da Luna</h1><p>Como você está se sentindo hoje?</p></div>
   <div className={styles.emotionGrid} role="group" aria-label="Escolha como você está se sentindo">{emotions.map(item=><button key={item.id} type="button" className={`${styles.emotionCard} ${selected===item.id?styles.emotionSelected:""}`} aria-pressed={selected===item.id} onClick={()=>setSelected(item.id)}>
     <Image src={`/mascotes/${item.image}.svg`} width={120} height={120} alt="" aria-hidden="true"/><strong>{item.title}</strong>
   </button>)}</div>
   {feeling ? <div className={styles.emotionReply} role="status"><Image src={`/mascotes/${feeling.image}.svg`} width={96} height={96} alt="Luna"/><div><strong>Luna diz:</strong><p>{feeling.prompt}</p></div></div> : <p className={styles.emotionHint}>Escolha uma expressão para a Luna conversar com você.</p>}
   <p className={styles.emotionNote}>Este espaço é apenas uma brincadeira de expressão e acolhimento. Ele não avalia sentimentos nem substitui o acompanhamento de adultos ou profissionais.</p>
 </section>;
}
