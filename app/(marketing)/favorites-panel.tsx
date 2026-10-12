"use client";
import LunaMessage from './luna-message';
import {useSyncExternalStore,useState} from 'react';
import {lessons,getProgress,subscribeProgress} from '@/lib/lessons';
import {getExperienceSnapshot,getServerExperienceSnapshot,subscribeExperience,toggleFavorite} from '@/lib/experience';
import styles from './discovery.module.css';
export default function FavoritesPanel({onBack,onOpen}:{onBack:()=>void;onOpen:(index:number)=>void}){
 const value=JSON.parse(useSyncExternalStore(subscribeExperience,getExperienceSnapshot,getServerExperienceSnapshot));const completed=useSyncExternalStore(subscribeProgress,getProgress,()=>0);const [message,setMessage]=useState('');
 return <section className={styles.panel}><button className={styles.button} onClick={onBack}>← Voltar à trilha</button><h1>Minhas atividades favoritas</h1><LunaMessage>Aqui estão as atividades que você guardou para brincar de novo!</LunaMessage>{!value.favorites.length&&<div className={styles.note}>Na trilha, toque em “Favoritar” nas etapas abertas para guardar suas preferidas.</div>}<div className={styles.favorites}>{value.favorites.map((i:number)=><article key={i}><h2>{lessons[i].title}</h2><div className={styles.favoriteActions}><button className={styles.button} disabled={i>completed} onClick={()=>onOpen(i)}>Abrir atividade →</button><button className={styles.button} onClick={()=>setMessage(toggleFavorite(i)?'Atividade retirada dos favoritos.':'Não foi possível guardar esta mudança.')}>Retirar dos favoritos</button></div></article>)}</div><p role="status">{message}</p></section>;
}
