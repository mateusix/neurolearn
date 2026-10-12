"use client";
import {useState} from 'react';
import styles from './discovery.module.css';
export default function MemoryGame({pairs,onAttempt,onSolved}:{pairs:{word:string;picture:string}[];onAttempt:(correct:boolean)=>void;onSolved:()=>void}){
 const [deck]=useState(()=>pairs.flatMap((pair,id)=>[{id,text:pair.word,type:'word'},{id,text:pair.picture,type:'picture'}]).map(card=>({card,order:Math.random()})).sort((a,b)=>a.order-b.order).map(x=>x.card));
 const [open,setOpen]=useState<number[]>([]);const [matched,setMatched]=useState<number[]>([]);const [message,setMessage]=useState('Vire duas cartas: uma imagem e a palavra que combina com ela.');
 function flip(index:number){
  if(open.length===2||open.includes(index)||matched.includes(deck[index].id))return;
  const selected=[...open,index];setOpen(selected);if(selected.length<2)return;
  const correct=deck[selected[0]].id===deck[selected[1]].id;onAttempt(correct);
  if(correct){const next=[...matched,deck[index].id];setMatched(next);setOpen([]);setMessage(next.length===pairs.length?'Todos os pares encontrados! Você pode continuar.':'Um par encontrado! Vamos descobrir outro.');if(next.length===pairs.length)onSolved();}
  else setMessage('Estas duas cartas não formam um par. Observe e tente com calma.');
 }
 return <div className={styles.memory}>
  <p>Sem tempo marcado. Os pares encontrados ficam abertos.</p>
  <div className={styles.memoryGrid} role="group" aria-label="Cartas do jogo de memória">{deck.map((card,index)=>{const found=matched.includes(card.id),shown=found||open.includes(index);return <button key={index} type="button" className={styles.memoryCard} data-matched={found} aria-pressed={shown} disabled={found||open.length===2&&!open.includes(index)} aria-label={shown?(card.type==='picture'?`Imagem de ${pairs[card.id].word}`:card.text):`Virar carta ${index+1}`} onClick={()=>flip(index)}>{shown?<span className={card.type==='picture'?styles.memoryPicture:undefined}>{card.text}</span>:'?'}</button>;})}</div>
  <p role="status" className={styles.memoryStatus}>{message}</p>
  {open.length===2&&<button className={styles.button} onClick={()=>{setOpen([]);setMessage('Vamos procurar outro par. Você pode tentar de novo.');}}>Virar estas cartas de novo</button>}
 </div>;
}
