"use client";
import { LockKeyhole, ArrowLeft, Download, BarChart3, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { achievements } from '@/lib/achievements';
import { lessons } from '@/lib/lessons';
import type { Experience } from '@/lib/experience-values';
import styles from './trail.module.css';
export default function AchievementsPanel({completed,experience,avatarName,onBack}:{completed:number;experience:Experience;avatarName:string;onBack:()=>void}) {
 const [exportOpen,setExportOpen]=useState(false);
 const [attempts,correct]=Object.values(experience.stats).reduce<[number,number]>((totals,item)=>[totals[0]+item[0],totals[1]+item[1]],[0,0]);
 const rate=attempts?Math.round(correct/attempts*100):null;
 const trailRate=Math.round(completed/lessons.length*100);
 const chartStages=lessons.map((lesson,index)=>{const stat=experience.stats[index]||[0,0];return {index,title:lesson.title,attempts:stat[0],correct:stat[1],rate:stat[0]?Math.round(stat[1]/stat[0]*100):0};}).filter(stage=>stage.attempts>0);
 const exportRows=()=>{
   const rows=[['Perfil',avatarName],['Etapas concluídas',`${completed}/${lessons.length}`],['Atividades registradas',String(attempts)],['Acertos',String(correct)],['Taxa de acerto',rate===null?'Sem dados':`${rate}%`],['Favoritos',String(experience.favorites.length)],['Conquistas liberadas',String(achievements.filter(item=>completed>=item.at).length)],[],['Etapa','Situação','Acertos','Tentativas','Taxa']];
   lessons.forEach((lesson,index)=>{const stat=experience.stats[index];const stageAttempts=stat?.[0]||0;const stageCorrect=stat?.[1]||0;rows.push([lesson.title,index<completed?'Concluída':index===completed?'Próxima':'Ainda não aberta',String(stageCorrect),String(stageAttempts),stageAttempts?`${Math.round(stageCorrect/stageAttempts*100)}%`:'']);});
   return rows;
 };
 const download=(content:string,type:string,name:string)=>{const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setExportOpen(false);};
 const exportCsv=()=>{const csv=exportRows().map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(';')).join('\n');download(`\uFEFF${csv}`,'text/csv;charset=utf-8','neurolearn-resumo-de-aprendizagem.csv');};
 const exportText=()=>{const text=exportRows().map(row=>row.filter(Boolean).join(row.length>2?' | ':': ')).join('\n');download(text,'text/plain;charset=utf-8','neurolearn-resumo-de-aprendizagem.txt');};
 const exportSpreadsheet=()=>{const esc=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');const table=exportRows().map(row=>`<tr>${row.map(cell=>`<td>${esc(String(cell))}</td>`).join('')}</tr>`).join('');download(`\uFEFF<html><head><meta charset="utf-8"></head><body><table>${table}</table></body></html>`,'application/vnd.ms-excel;charset=utf-8','neurolearn-resumo-de-aprendizagem.xls');};
 const exportPdf=()=>{const esc=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');const table=exportRows().map(row=>`<tr>${row.map(cell=>`<td>${esc(String(cell))}</td>`).join('')}</tr>`).join('');const popup=window.open('','_blank');if(!popup)return;popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Resumo de aprendizagem</title><style>body{font:14px Arial,sans-serif;color:#173747;padding:28px}h1{font-size:24px;color:#21627b}p{color:#496775}table{width:100%;border-collapse:collapse;margin-top:22px}td{padding:8px;border-bottom:1px solid #cbdde3;text-align:left}tr:nth-child(8) td{border:0;height:12px}@media print{body{padding:0}}</style></head><body><h1>NeuroLearn — resumo de aprendizagem</h1><p>Perfil: ${esc(avatarName)}</p><table>${table}</table><script>window.onload=()=>window.print()<\/script></body></html>`);popup.document.close();setExportOpen(false);};
 const exportPdfWithCharts=()=>{
   const esc=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
   const table=exportRows().map(row=>`<tr>${row.map(cell=>`<td>${esc(String(cell))}</td>`).join('')}</tr>`).join('');
   const bars=chartStages.length ? chartStages.map(stage=>`<div class="bar"><div class="bar-label"><span>${stage.index+1}. ${esc(stage.title)}</span><b>${stage.correct}/${stage.attempts} · ${stage.rate}%</b></div><div class="track"><i style="width:${stage.rate}%"></i></div></div>`).join('') : '<p class="empty">Ainda não há tentativas registradas para gerar os gráficos.</p>';
   const rings=chartStages.length ? `<div class="rings"><div class="ring-item"><div class="ring" style="--value:${trailRate}%"><span>${trailRate}%</span></div>Trilha concluída</div><div class="ring-item"><div class="ring" style="--value:${rate||0}%"><span>${rate}%</span></div>Taxa de acerto</div></div>` : '';
   const popup=window.open('','_blank'); if(!popup){exportPdf();return;}
   popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Resumo de aprendizagem</title><style>body{font:14px Arial,sans-serif;color:#173747;padding:28px}h1{font-size:24px;color:#21627b;margin:0 0 6px}p{color:#496775}table{width:100%;border-collapse:collapse;margin-top:22px}td{padding:8px;border-bottom:1px solid #cbdde3;text-align:left}tr:nth-child(8) td{border:0;height:12px}.charts{margin-top:34px;padding-top:20px;border-top:2px solid #cbdde3;break-inside:avoid}.charts h2{font-size:19px;color:#21627b;margin:0 0 16px}.rings{display:flex;gap:28px;margin-bottom:24px}.ring-item{display:flex;align-items:center;gap:10px;font-weight:bold;color:#345867}.ring{width:76px;height:76px;border-radius:50%;background:conic-gradient(#317b99 var(--value),#e8f3f6 0);display:grid;place-items:center}.ring span{display:grid;place-items:center;width:57px;height:57px;border-radius:50%;background:#fff;color:#21627b;font-size:15px}.bar{margin:0 0 12px;break-inside:avoid}.bar-label{display:flex;justify-content:space-between;gap:12px;font-size:12px;margin-bottom:5px}.track{height:11px;border-radius:10px;background:#e8f3f6;overflow:hidden}.track i{display:block;height:100%;background:#317b99;border-radius:10px}.empty{padding:14px;background:#f3f8fa;border-radius:10px}@media print{body{padding:0}}</style></head><body><h1>NeuroLearn — resumo de aprendizagem</h1><p>Perfil: ${esc(avatarName)}</p><table>${table}</table><section class="charts"><h2>Gráficos de acompanhamento</h2>${rings}<h3>Acertos por etapa</h3>${bars}</section><script>window.onload=()=>window.print()<\\/script></body></html>`);
   popup.document.close(); setExportOpen(false);
 };
 return <section className={styles.journey} aria-labelledby="achievements-title">
   <button className={styles.back} onClick={onBack}><ArrowLeft size={18} aria-hidden="true"/> Voltar à trilha</button>
   <h1 id="achievements-title" className={styles.trophyTitle}>Minhas conquistas</h1><p className={styles.developmentNote}>Cada pequeno ciclo traz uma descoberta. Sem pressa!</p>
   <div className={styles.trophyGrid}>{achievements.map(item=>{const earned=completed>=item.at;return <article key={item.id} className={`achievement-reveal ${styles.trophyCard} ${earned?styles.trophyEarned:''}`}>
     <span className={styles.preferenceIcon} aria-hidden="true">{earned?item.icon:'🔒'}</span><h2>{item.title}</h2><p>{earned?item.detail:`Abre ao concluir ${item.at} etapas.`}</p><span className={styles.trophyState}>{earned?'Conquista liberada':<><LockKeyhole size={14} aria-hidden="true"/> Uma descoberta pela frente</>}</span>
   </article>;})}</div>
   <section className={styles.dashboard} aria-labelledby="dashboard-title">
     <div className={styles.dashboardHeading}><div><p className={styles.eyebrow}>MINHAS DESCOBERTAS</p><h2 id="dashboard-title"><BarChart3 size={24} aria-hidden="true"/> Meu resumo</h2><p>Um retrato do caminho de {avatarName} na trilha.</p></div><div className={styles.exportArea}><button className={styles.exportButton} aria-expanded={exportOpen} onClick={()=>setExportOpen(value=>!value)}><Download size={18} aria-hidden="true"/> Baixar resumo</button>{exportOpen&&<div className={styles.exportMenu} role="dialog" aria-label="Escolher formato do resumo"><strong>Escolha o formato</strong><button onClick={exportSpreadsheet}>Planilha Excel (.xls)</button><button onClick={exportCsv}>CSV</button><button onClick={exportText}>Texto (.txt)</button><button onClick={exportPdfWithCharts}>PDF</button><small>Ao escolher PDF, selecione “Salvar como PDF” na janela de impressão.</small></div>}</div></div>
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
