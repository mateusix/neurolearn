"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Hand, Heart, PawPrint, Sparkles } from "lucide-react";
import LunaMascot, { type LunaMood } from "./luna-mascot";
import styles from "./welcome-screen.module.css";

export default function WelcomeScreen({ onStart, returning }: { onStart: () => void; returning: boolean }) {
  const [greeting, setGreeting] = useState(0);
  const [greetingBusy, setGreetingBusy] = useState(false);
  const [mood, setMood] = useState<LunaMood>('wave');
  const [customMessage, setCustomMessage] = useState('');
  const greetingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (greetingTimer.current) clearTimeout(greetingTimer.current); }, []);
  const greetings = ["Que bom ter você aqui!", "Oi! Vamos descobrir juntos?", "Cada tentativa é uma descoberta!", "Eu acompanho você. Sem pressa."];
  function interact(nextMood: LunaMood = 'wave') {
    if (greetingBusy) return;
    setMood(nextMood);
    setCustomMessage(nextMood === 'celebrate' ? 'Viva! Cada pequeno passo merece um sorriso.' : nextMood === 'calm' ? 'Podemos fazer uma pausa. Você escolhe quando continuar.' : '');
    setGreeting(value => value + 1);
    setGreetingBusy(true);
    greetingTimer.current = setTimeout(() => setGreetingBusy(false), 1900);
  }
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="intro-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>BEM-VINDO AO NEUROLEARN</p>
        <h1 id="intro-title">Vamos aprender<br />no seu ritmo?</h1>
        <p className={styles.description}>Eu sou a Luna! Vamos descobrir letras, palavras e histórias juntos. Um passinho de cada vez.</p>
        <button type="button" className={styles.start} onClick={onStart}>
          {returning ? "Continuar minha aprendizagem" : "Vamos começar"}
          <ArrowRight size={22} aria-hidden="true" />
        </button>
        <p className={styles.hint}>{returning ? "Seu bichinho e suas descobertas continuam com você." : "Primeiro, vamos escolher um bichinho para acompanhar você."}</p>
      </div>

      <div className={styles.illustration}>
        <div className={styles.bubble} role="status" aria-live="polite">{customMessage || greetings[greeting % greetings.length]}</div>
        <div className={styles.scene} aria-hidden="true">
          <span className={`${styles.letter} ${styles.a}`}>A</span>
          <span className={`${styles.letter} ${styles.e}`}>E</span>
          <span className={`${styles.letter} ${styles.o}`}>O</span>
          <Sparkles className={styles.sparkle} size={23} />
          <LunaMascot gesture={greeting} mood={mood} className={styles.luna} />
          <div className={styles.word}><BookOpen size={24} /><span>Aprender é descobrir</span></div>
        </div>
        <div className={styles.interactions} role="group" aria-label="Interagir com a Luna">
          <button type="button" className={styles.hello} onClick={() => interact('wave')} aria-disabled={greetingBusy} aria-label="Dar um oi para a Luna"><Hand size={18} aria-hidden="true" /> Oi, Luna!</button>
          <button type="button" className={styles.hello} onClick={() => interact('celebrate')} aria-disabled={greetingBusy}><Sparkles size={18} aria-hidden="true" /> Comemorar</button>
          <button type="button" className={styles.hello} onClick={() => interact('calm')} aria-disabled={greetingBusy}><Heart size={18} aria-hidden="true" /> Uma pausa</button>
        </div>
      </div>
    </section>

    <section className={styles.preview} aria-labelledby="preview-title">
      <h2 id="preview-title">Um caminho cheio de descobertas</h2>
      <ol className={styles.steps}>
        <li><span className={styles.stepIcon}><PawPrint size={25} aria-hidden="true" /></span><div><span className={styles.stepNumber}>01 · SEU COMPANHEIRO</span><h3>Um amigo para aprender</h3><p>Escolha seu bichinho favorito.</p></div></li>
        <li><span className={styles.stepIcon}><BookOpen size={25} aria-hidden="true" /></span><div><span className={styles.stepNumber}>02 · SUAS DESCOBERTAS</span><h3>Uma descoberta por vez</h3><p>Explore letras, palavras e histórias.</p></div></li>
        <li><span className={styles.stepIcon}><Heart size={25} aria-hidden="true" /></span><div><span className={styles.stepNumber}>03 · NO SEU TEMPO</span><h3>Do seu jeitinho</h3><p>Com dicas e tempo para tentar.</p></div></li>
      </ol>
    </section>
    <p className={styles.familyNote}>Para responsáveis: o acesso no topo permite criar perfis e guardar as descobertas de cada criança.</p>
  </div>;
}
