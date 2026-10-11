"use client";
import { LockKeyhole, ArrowLeft } from 'lucide-react';
import { achievements } from '@/lib/achievements';
import styles from './trail.module.css';
export default function AchievementsPanel({completed,onBack}:{completed:number;onBack:()=>void}) {
 return <section className={styles.journey} aria-labelledby="achievements-title">
   <button className={styles.back} onClick={onBack}><ArrowLeft size={18} aria-hidden="true"/> Voltar à trilha</button>
   <h1 id="achievements-title" className={styles.trophyTitle}>Minhas conquistas</h1><p className={styles.developmentNote}>Cada pequeno ciclo traz uma descoberta. Sem pressa!</p>
   <div className={styles.trophyGrid}>{achievements.map(item=>{const earned=completed>=item.at;return <article key={item.id} className={`achievement-reveal ${styles.trophyCard} ${earned?styles.trophyEarned:''}`}>
     <span className={styles.preferenceIcon} aria-hidden="true">{earned?item.icon:'🔒'}</span><h2>{item.title}</h2><p>{earned?item.detail:`Abre ao concluir ${item.at} etapas.`}</p><span className={styles.trophyState}>{earned?'Conquista liberada':<><LockKeyhole size={14} aria-hidden="true"/> Uma descoberta pela frente</>}</span>
   </article>;})}</div>
 </section>;
}
