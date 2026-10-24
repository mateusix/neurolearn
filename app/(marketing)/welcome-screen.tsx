"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, Heart, PawPrint } from "lucide-react";
import styles from "./welcome-screen.module.css";

export default function WelcomeScreen({ onStart, returning }: { onStart: () => void; returning: boolean }) {
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

      <div className={styles.illustration} aria-hidden="true">
        <div className={styles.bubble}>Que bom ter você aqui!</div>
        <div className={styles.scene}>
          <span className={`${styles.letter} ${styles.a}`}>A</span>
          <span className={`${styles.letter} ${styles.e}`}>E</span>
          <span className={`${styles.letter} ${styles.o}`}>O</span>
          <Image className={`${styles.luna} luna-wave`} src="/mascotes/corpo-acenando.svg" width={260} height={260} alt="" preload />
          <div className={styles.word}><BookOpen size={24} /><span>Aprender é descobrir</span></div>
        </div>
      </div>
    </section>

    <section className={styles.preview} aria-labelledby="preview-title">
      <h2 id="preview-title">Um caminho cheio de descobertas</h2>
      <ol className={styles.steps}>
        <li><span className={styles.stepIcon}><PawPrint size={25} aria-hidden="true" /></span><div><h3>Um amigo para aprender</h3><p>Escolha seu bichinho favorito.</p></div></li>
        <li><span className={styles.stepIcon}><BookOpen size={25} aria-hidden="true" /></span><div><h3>Uma descoberta por vez</h3><p>Explore letras, palavras e histórias.</p></div></li>
        <li><span className={styles.stepIcon}><Heart size={25} aria-hidden="true" /></span><div><h3>Do seu jeitinho</h3><p>Com dicas e tempo para tentar.</p></div></li>
      </ol>
    </section>
    <p className={styles.familyNote}>Para responsáveis: o acesso no topo permite criar perfis e guardar as descobertas de cada criança.</p>
  </div>;
}
