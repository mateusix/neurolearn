"use client";
import { LockKeyhole, ArrowLeft, Download, BarChart3, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import type { CSSProperties } from 'react';
import { achievements } from '@/lib/achievements';
import { lessons } from '@/lib/lessons';
import type { Experience } from '@/lib/experience-values';
import styles from './trail.module.css';
export default function AchievementsPanel({completed,experience,avatarName,onBack}:{completed:number;experience:Experience;avatarName:string;onBack:()=>void}) {
 const [attempts,correct]=Object.values(experience.stats).reduce<[number,number]>((totals,item)=>[totals[0]+item[0],totals[1]+item[1]],[0,0]);
 const rate=attempts?Math.round(correct/attempts*100):null;
 const trailRate=Math.round(completed/lessons.length*100);
 const chartStages=lessons.map((lesson,index)=>{const stat=experience.stats[index]||[0,0];return {index,title:lesson.title,attempts:stat[0],correct:stat[1],rate:stat[0]?Math.round(stat[1]/stat[0]*100):0};}).filter(stage=>stage.attempts>0);
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
     {attempts>0 ? <section className={styles.dashboardCharts} aria-label="Gráficos do progresso">
       <article className={styles.chartCard}>
         <div className={styles.chartTitle}><Target size={19} aria-hidden="true"/><div><strong>Visão geral</strong><span>Seu caminho até aqui</span></div></div>
         <div className={styles.ringCharts}>
           <div className={styles.ringItem}><div className={styles.ring} style={{'--chart-value':`${trailRate}%`} as CSSProperties}><strong>{trailRate}%</strong></div><span>Trilha concluída</span></div>
           <div className={styles.ringItem}><div className={styles.ring} style={{'--chart-value':`${rate||0}%`} as CSSProperties}><strong>{rate}%</strong></div><span>Respostas certas</span></div>
         </div>
       </article>
       <article className={styles.chartCard}>
         <div className={styles.chartTitle}><TrendingUp size={19} aria-hidden="true"/><div><strong>Atividades praticadas</strong><span>Acertos em cada etapa registrada</span></div></div>
         <div className={styles.barChart}>{chartStages.map(stage=><div className={styles.barRow} key={stage.index}>
           <div className={styles.barLabel}><span>{stage.index+1}. {stage.title}</span><strong>{stage.correct}/{stage.attempts}</strong></div>
           <div className={styles.barTrack} aria-label={`${stage.title}: ${stage.correct} acertos em ${stage.attempts} tentativas, ${stage.rate}%`}><span style={{width:`${stage.rate}%`}} /></div>
         </div>)}</div>
       </article>
     </section> : <section className={styles.emptyChart} aria-label="Ainda não há dados para os gráficos"><BarChart3 size={28} aria-hidden="true"/><div><strong>Os gráficos aparecem conforme você pratica.</strong><p>Quando houver tentativas registradas, será possível acompanhar os acertos e o progresso por etapa.</p></div></section>}
     <p className={styles.dashboardNote}>Os números ajudam a acompanhar o uso do protótipo; não são diagnóstico nem avaliação da capacidade da criança.</p>
     <div className={styles.dashboardProgress}><strong>Próxima descoberta</strong><span>{completed<lessons.length?lessons[completed].title:'Você concluiu toda a trilha!'}</span></div>
     <details className={styles.dashboardDetails}><summary>Ver etapas e registros</summary><div className={styles.dashboardTableWrap}><table><thead><tr><th>Etapa</th><th>Situação</th><th>Acertos / tentativas</th></tr></thead><tbody>{lessons.map((lesson,index)=>{const stat=experience.stats[index];return <tr key={lesson.title}><td>{lesson.title}</td><td>{index<completed?<><CheckCircle2 size={15} aria-hidden="true"/> Concluída</>:index===completed?'Próxima':'Ainda não aberta'}</td><td>{stat?`${stat[1]} / ${stat[0]}`:'Sem registro'}</td></tr>;})}</tbody></table></div></details>
   </section>
 </section>;
}
