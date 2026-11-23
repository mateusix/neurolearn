"use client";
import { LockKeyhole, ArrowLeft, Download, BarChart3, CheckCircle2 } from 'lucide-react';
import { achievements } from '@/lib/achievements';
import { lessons } from '@/lib/lessons';
import type { Experience } from '@/lib/experience-values';
import styles from './trail.module.css';
export default function AchievementsPanel({completed,experience,avatarName,onBack}:{completed:number;experience:Experience;avatarName:string;onBack:()=>void}) {
 const [attempts,correct]=Object.values(experience.stats).reduce<[number,number]>((totals,item)=>[totals[0]+item[0],totals[1]+item[1]],[0,0]);
 const rate=attempts?Math.round(correct/attempts*100):null;
 const exportSummary=()=>{
   const rows=[['Perfil',avatarName],['Etapas concluídas',`${completed}/${lessons.length}`],['Atividades registradas',String(attempts)],['Acertos',String(correct)],['Taxa de acerto',rate===null?'Sem dados':`${rate}%`],['Favoritos',String(experience.favorites.length)],['Conquistas liberadas',String(achievements.filter(item=>completed>=item.at).length)],[],['Etapa','Situação','Acertos','Tentativas','Taxa']];
   lessons.forEach((lesson,index)=>{const stat=experience.stats[index];const stageAttempts=stat?.[0]||0;const stageCorrect=stat?.[1]||0;rows.push([lesson.title,index<completed?'Concluída':index===completed?'Próxima':'Ainda não aberta',String(stageCorrect),String(stageAttempts),stageAttempts?`${Math.round(stageCorrect/stageAttempts*100)}%`:'']);});
   const csv=rows.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(';')).join('\n');
   const url=URL.createObjectURL(new Blob([`\uFEFF${csv}`],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='neurolearn-resumo-de-aprendizagem.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section className={styles.journey} aria-labelledby="achievements-title">
   <button className={styles.back} onClick={onBack}><ArrowLeft size={18} aria-hidden="true"/> Voltar à trilha</button>
   <h1 id="achievements-title" className={styles.trophyTitle}>Minhas conquistas</h1><p className={styles.developmentNote}>Cada pequeno ciclo traz uma descoberta. Sem pressa!</p>
   <div className={styles.trophyGrid}>{achievements.map(item=>{const earned=completed>=item.at;return <article key={item.id} className={`achievement-reveal ${styles.trophyCard} ${earned?styles.trophyEarned:''}`}>
     <span className={styles.preferenceIcon} aria-hidden="true">{earned?item.icon:'🔒'}</span><h2>{item.title}</h2><p>{earned?item.detail:`Abre ao concluir ${item.at} etapas.`}</p><span className={styles.trophyState}>{earned?'Conquista liberada':<><LockKeyhole size={14} aria-hidden="true"/> Uma descoberta pela frente</>}</span>
   </article>;})}</div>
   <section className={styles.dashboard} aria-labelledby="dashboard-title">
     <div className={styles.dashboardHeading}><div><p className={styles.eyebrow}>MINHAS DESCOBERTAS</p><h2 id="dashboard-title"><BarChart3 size={24} aria-hidden="true"/> Meu resumo</h2><p>Um retrato do caminho de {avatarName} na trilha.</p></div><button className={styles.exportButton} onClick={exportSummary}><Download size={18} aria-hidden="true"/> Baixar resumo</button></div>
     <div className={styles.dashboardStats}>
       <article><strong>{completed}/{lessons.length}</strong><span>Etapas concluídas</span></article>
       <article><strong>{attempts}</strong><span>Tentativas registradas</span></article>
       <article><strong>{correct}</strong><span>Acertos registrados</span></article>
       <article><strong>{rate===null?'—':`${rate}%`}</strong><span>Taxa de acerto</span></article>
     </div>
     <p className={styles.dashboardNote}>Os números ajudam a acompanhar o uso do protótipo; não são diagnóstico nem avaliação da capacidade da criança.</p>
     <div className={styles.dashboardProgress}><strong>Próxima descoberta</strong><span>{completed<lessons.length?lessons[completed].title:'Você concluiu toda a trilha!'}</span></div>
     <details className={styles.dashboardDetails}><summary>Ver etapas e registros</summary><div className={styles.dashboardTableWrap}><table><thead><tr><th>Etapa</th><th>Situação</th><th>Acertos / tentativas</th></tr></thead><tbody>{lessons.map((lesson,index)=>{const stat=experience.stats[index];return <tr key={lesson.title}><td>{lesson.title}</td><td>{index<completed?<><CheckCircle2 size={15} aria-hidden="true"/> Concluída</>:index===completed?'Próxima':'Ainda não aberta'}</td><td>{stat?`${stat[1]} / ${stat[0]}`:'Sem registro'}</td></tr>;})}</tbody></table></div></details>
   </section>
 </section>;
}
