"use client";
import dynamic from "next/dynamic";
import { getExperienceSnapshot, getServerExperienceSnapshot, subscribeExperience, toggleFavorite } from '@/lib/experience';
import type { Experience } from '@/lib/experience-values';
import LearningLoading from "./learning-loading";
import Image from "next/image";
import { canOpenStage } from "@/lib/learning-access";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, BookOpen, Check, LockKeyhole, Play, Volume2, Trophy } from "lucide-react";
import { getProgress, saveProgress, subscribeProgress, lessons, learningBlocks } from "@/lib/lessons";
import { useNarration } from "@/lib/use-narration";


import { avatars, getAvatar, saveAvatar, subscribeAvatar } from "@/lib/avatars";


import { getPreferencesSnapshot, subscribePreferences, type Preferences, savePreferences, themes } from "@/lib/preferences";
import { earnedAchievements } from "@/lib/achievements";

import { getFamilySnapshot, getServerFamilySnapshot, subscribeFamily, syncFamily, currentChild } from "@/lib/family-store";
import styles from "./trail.module.css";

const SuggestionsPanel = dynamic(() => import('./suggestions-panel'), {loading: () => <LearningLoading />});
const CollectionPanel = dynamic(() => import('./collection-panel'));
const FavoritesPanel = dynamic(() => import('./favorites-panel'));
const Lesson = dynamic(() => import("./lesson"), {loading: () => <LearningLoading />});
const ChooseAvatar = dynamic(() => import("./choose-avatar"), {loading: () => <LearningLoading />});
const PreferencesQuiz = dynamic(() => import("./preferences-quiz"), {loading: () => <LearningLoading />});
const AchievementsPanel = dynamic(() => import("./achievements-panel"), {loading: () => <LearningLoading />});
const FamilyPanel = dynamic(() => import("./family-panel"), {loading: () => <LearningLoading />});
const PalettePicker = dynamic(() => import("./palette-picker"), {loading: () => <LearningLoading />});

const steps = [
  { title: "Conhecer as vogais", detail: "Vamos descobrir A, E, I, O e U.", icon: "vogais", color: "blue" },
  { title: "Letras e sons", detail: "Cada letra tem um som.", icon: "sons", color: "peach" },
  { title: "Juntar sílabas", detail: "Pedacinhos que formam palavras.", icon: "silabas", color: "purple" },
  { title: "Minhas primeiras palavras", detail: "Palavras do nosso dia a dia.", icon: "palavras", color: "green" },
];
steps.push(
  {title:lessons[4].title,detail:"Descubra a primeira letra com imagens e modelos.",icon:"sons",color:"peach"},
  {title:lessons[5].title,detail:"Monte MALA, VACA, SAPO e outras palavras.",icon:"silabas",color:"purple"},
  {title:lessons[6].title,detail:"Pratique a escrita com um modelo para ajudar.",icon:"palavras",color:"green"},
  {title:lessons[7].title,detail:"Uma pequena revisão do que você descobriu.",icon:"vogais",color:"blue"},
);

steps.push(...lessons.slice(8).map((lesson,index) => ({
  title:lesson.title,
  detail:["Combine letras maiúsculas e minúsculas.","Encontre a sílaba que falta.","Leia e associe a palavra à imagem.","Monte palavras conhecidas usando uma dica se precisar.","Descubra palavras um pouco maiores.","Escreva sem copiar; abra uma dica quando quiser.","Coloque palavras em ordem para formar uma frase.","Leia uma frase e descubra o que ela conta.","Escute a Nina e coloque as palavras em ordem.","Descubra miau, au au e muu.","Conheça palavras com frutas coloridas.","Descubra os objetos que usamos para aprender.","Leia os nomes dos transportes."][index] || (lesson.exercises[0]?.kind === "memory" ? "Vire cartas e combine imagens com palavras, sem pressa." : "Leia, observe e responda com a ajuda da Luna."),
  icon:["vogais","silabas","palavras","silabas","silabas","palavras","palavras","sons","sons","sons","palavras","palavras","palavras"][index] || "palavras",
  color:["blue","purple","green","peach"][index % 4],
})));

export default function Home() {
  const family = useSyncExternalStore(subscribeFamily, getFamilySnapshot, getServerFamilySnapshot);
  return <LearningHome key={`${family.userId || "guest"}:${family.selected}`} />;
}
function LearningHome() {
  const family = useSyncExternalStore(subscribeFamily, getFamilySnapshot, getServerFamilySnapshot);
  const preferenceSnapshot = useSyncExternalStore(subscribePreferences, getPreferencesSnapshot, () => "");
  const preferences = useMemo(() => preferenceSnapshot ? JSON.parse(preferenceSnapshot) as Preferences : null, [preferenceSnapshot]);
  const [changingPreferences, setChangingPreferences] = useState(false);
  const experience=JSON.parse(useSyncExternalStore(subscribeExperience,getExperienceSnapshot,getServerExperienceSnapshot)) as Experience;
  const [panel,setPanel]=useState<'collection'|'favorites'|'suggestions'|null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const avatarId = useSyncExternalStore(subscribeAvatar, getAvatar, () => "");
  const [changingAvatar, setChangingAvatar] = useState(false);
  const avatar = avatars.find(item => item.id === avatarId);
  const [active, setActive] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [storageMessage, setStorageMessage] = useState("");
  const completed = useSyncExternalStore(subscribeProgress, getProgress, () => 0);
  const trailHeading = useRef<HTMLHeadingElement>(null);
  const { speak, stop, message } = useNarration();
  function openLesson(index: number) { if (!canOpenStage(index, getProgress())) return; stop(); setActive(index); }
  function nextStage() {
    if (active === null || active + 1 >= lessons.length || active + 1 > getProgress()) return;
    stop(); setActive(active + 1); setSelected(active + 1);
  }
  function back() { setActive(null); requestAnimationFrame(() => trailHeading.current?.focus()); }
  function complete() {
    if (active === null) return;
    if (!saveProgress(active + 1)) setStorageMessage("O progresso vale nesta sessão, mas não foi possível salvá-lo neste navegador.");
  }
  if (family.loading) return <div className={styles.page}><LearningLoading /></div>;
  if (family.error && !family.userId) return <div className={styles.page}><p role="alert">{family.error}</p><button className={styles.start} onClick={() => window.location.reload()}>Tentar novamente</button></div>;
  if (family.userId && (!family.selected || family.error && !currentChild())) return <FamilyPanel onContinue={() => { stop(); setActive(null); }} onClose={() => setActive(null)} />;
  if (!avatar || changingAvatar) return <div className={styles.page}>
    <ChooseAvatar key={avatarId} current={avatarId} onChoose={id => {
      stop();
      if (!saveAvatar(id)) setStorageMessage("Seu bichinho vale nesta sessão, mas não foi possível salvá-lo neste navegador.");
      setChangingAvatar(false);
    }} onCancel={() => { stop(); setChangingAvatar(false); }} />
    <p role="status" className={styles.audioStatus}>{message || storageMessage}</p>
  </div>;
  if (!preferences || changingPreferences) return <div className={styles.page}><PreferencesQuiz current={preferences} onSave={value => {
    stop(); if (!savePreferences(value)) setStorageMessage("Suas escolhas valem nesta sessão, mas não foi possível salvá-las neste navegador."); setChangingPreferences(false);
  }} onCancel={() => setChangingPreferences(false)} /><p role="status" className={styles.audioStatus}>{storageMessage}</p></div>;
  if (!preferences.palette) return <div className={styles.page}><PalettePicker current={preferences.palette} onSave={palette=>{ if (!savePreferences({...preferences,palette})) setStorageMessage("As cores valem nesta sessão, mas não foi possível salvá-las."); }} /><p role="status">{storageMessage}</p></div>;
  if (panel==='suggestions') return <SuggestionsPanel completed={completed} experience={experience} preferences={preferences} onBack={()=>setPanel(null)} onOpen={index=>{setPanel(null);openLesson(index);}}/>;
  if (panel==='collection') return <CollectionPanel onBack={()=>setPanel(null)}/>;
  if (panel==='favorites') return <FavoritesPanel onBack={()=>setPanel(null)} onOpen={index=>{setPanel(null);openLesson(index);}}/>;
  if (showAchievements) return <div className={styles.page}><AchievementsPanel completed={completed} onBack={() => setShowAchievements(false)} /></div>;
  return <div className={styles.page}>
    <div className={styles.avatarProfile}><div><span>Meu bichinho: <strong>{avatar.name}</strong></span></div><button onClick={() => { stop(); setChangingAvatar(true); }}>Trocar bichinho</button></div>
    <div className={styles.topline}><span><BookOpen size={18} aria-hidden="true" /> Minha aprendizagem</span><span className={styles.previewTag}>Protótipo de aprendizagem</span></div>
    {active === null && <>
      <nav className={styles.trailTabs} aria-label="Minha aprendizagem"><button aria-current="page">Minha trilha</button><button onClick={() => { stop(); setShowAchievements(true); }}><Trophy size={18} aria-hidden="true" /> Minhas conquistas ({earnedAchievements(completed).length})</button><button onClick={()=>{stop();setPanel("collection");}}>Meu bichinho e coleção</button><button onClick={()=>{stop();setPanel("favorites");}}>Favoritos ({experience.favorites.length})</button><button onClick={()=>{stop();setPanel("suggestions");}}>Sugestões da Luna</button></nav>
      <div className={styles.preferenceSummary}><span>Meu tema: {themes.find(theme => theme.id === preferences.theme)?.name}</span><button onClick={() => { stop(); setChangingPreferences(true); }}>Mudar meus gostos</button></div>
    </>}
    {active !== null ? <Lesson key={`${family.selected}:${active}`} preferences={preferences} index={active} onBack={back} onComplete={complete} onNext={active + 1 < lessons.length ? nextStage : undefined} /> : <>
      <section className={styles.welcome} aria-labelledby="welcome-title">
        <div className={styles.mascot}><Image src="/mascotes/corpo-acenando.svg" width={112} height={112} className="luna-wave" alt="Luna, o mascote azul do NeuroLearn, acenando" preload /></div>
        <div className={styles.welcomeText}><p className={styles.eyebrow}>UM PASSO DE CADA VEZ</p><h1 id="welcome-title">Que bom ter você aqui{currentChild()?.name ? `, ${currentChild()!.name}` : ""}!</h1><p>Eu sou a Luna. Seu amigo {avatar.name.toLocaleLowerCase("pt-BR")} já está pronto! Vamos descobrir letras, palavras e histórias, no seu ritmo.</p></div>
        <button className={styles.listen} onClick={() => speak("luna-apresentacao")} aria-label="Ouvir a apresentação da Luna"><Volume2 size={22} aria-hidden="true" /><span>Ouvir</span></button>
      </section>
      <p role="status" className={styles.audioStatus}>{message}</p>
      <section className={styles.journey} aria-labelledby="trail-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>COMEÇANDO A DESCOBRIR</p><h2 id="trail-title" ref={trailHeading} tabIndex={-1}>Minha trilha</h2></div><span className={styles.progressLabel}>{completed} de {steps.length} etapas</span></div>
        {completed < steps.length && <div className={styles.resumeBanner}><div><strong>Sua próxima descoberta</strong><p>{steps[completed].title}</p></div><button className={`${styles.start} ${styles.nextStart}`} onClick={() => openLesson(completed)}>Continuar daqui <ArrowRight size={18} aria-hidden="true"/></button></div>}
        <div className={styles.progress} role="progressbar" aria-label="Etapas concluídas" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completed}><span style={{width:`${completed / steps.length * 100}%`, backgroundColor:`hsl(${45 + completed / steps.length * 80} 42% 65%)`}} /></div>
        <ol className={styles.steps}>{steps.map((step, index) => {
          const available = index <= completed;
          const done = index < completed;
          return <li key={step.title} className={`${styles.step} ${index === completed ? styles.nextStep : ""} ${available ? `${styles.current} ${selected === index ? styles.selected : ""}` : styles.locked}`}>
            <div className={`${styles.node} ${styles[step.color]}`} aria-hidden="true"><Image src={`/trail/${step.icon}.svg`} width={80} height={80} alt="" className={styles.trailIcon} /></div>
            <div className={styles.stepCard}>
              {available && <button type="button" className={styles.selectCard} aria-label={`Selecionar etapa: ${step.title}`} aria-pressed={selected === index} onClick={() => setSelected(index)} />}
              {(done || selected === index) && <span className={styles.selectionMark} aria-hidden="true"><Check size={18} strokeWidth={3} /></span>}
              <span className={styles.blockLabel}>{learningBlocks[Math.floor(index / 4)].title}</span>
              <span className={styles.stepLabel}>{done ? "CONCLUÍDA" : index === completed ? "SUA PRÓXIMA DESCOBERTA" : `ETAPA ${index + 1}`}</span>
              <h3>{step.title}</h3><p>{preferences.theme !== "mixed" && [2,3,5,6,9,10,11,13].includes(index) ? `Palavras no tema ${themes.find(theme => theme.id === preferences.theme)?.name.toLocaleLowerCase("pt-BR")}, com imagens e dicas para ajudar.` : step.detail}</p>
              {available ? <button className={`${styles.start} ${done ? styles.practiceStart : styles.nextStart}`} onClick={() => openLesson(index)} aria-label={`${done ? "Praticar de novo" : "Começar"}: ${step.title}`}><Play size={17} fill="currentColor" aria-hidden="true" /> {done ? "Praticar de novo" : "Começar"}<ArrowRight size={19} aria-hidden="true" /></button> : <span className={styles.lockLabel}><LockKeyhole size={15} aria-hidden="true" /> Abre depois da etapa {index}</span>}
              {available&&<button type="button" className={styles.favoriteButton} aria-label={`${experience.favorites.includes(index)?"Retirar dos favoritos":"Favoritar"}: ${step.title}`} aria-pressed={experience.favorites.includes(index)} onClick={()=>{if(!toggleFavorite(index))setStorageMessage('Não foi possível guardar esta preferência.');}}>{experience.favorites.includes(index)?'★ Favoritada':'☆ Favoritar'}</button>}
            </div>
          </li>;
        })}</ol>
        <p className={styles.encouragement}>{completed === steps.length ? "Você percorreu a trilha! Pode voltar para praticar." : "Cada descoberta é um passo. Vamos com calma."}</p>
        <p className={styles.developmentNote}>{family.userId ? "Progresso do perfil conectado à conta do responsável. Você escolhe quando ouvir a Luna." : "Progresso salvo neste navegador. Você escolhe quando ouvir a Luna."}</p>
      </section>
    </>}
    {family.userId && <div role="status" className={styles.audioStatus}>{family.error || (family.saving ? "Salvando na conta…" : family.pending ? "Aguardando salvamento na conta…" : "Progresso salvo na conta.")}{family.error && <button onClick={() => void syncFamily()}> Salvar novamente</button>}</div>}
    <p role="status" className={styles.audioStatus}>{storageMessage}</p>
  </div>;
}
