"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getFamilySnapshot } from "@/lib/family-store";
import type { Exercise } from "@/lib/lessons";
import styles from "./lesson.module.css";
export function tutorialKind(exercise: Exercise) {
  return exercise.listening ? "listening" : exercise.kind === "order" && exercise.separator ? "sentence" : exercise.kind;
}
export default function MiniTutorial({ kind }: { kind: string }) {
  const family = getFamilySnapshot();
  const storageKey = `neurolearn-demo-v2:${family.userId || "guest"}:${family.selected || "guest"}:${kind}`;
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(storageKey) !== "seen"; } catch { return true; } });
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const sentence = kind === "sentence" || kind === "listening";
  const pieces = sentence ? ["A", "BOLA", "ROLA"] : ["BO", "LA"];
  const labels = kind === "choice" ? ["Veja a pergunta: escolha a letra A.", "A Luna toca na caixinha A. Ela fica marcada.", "Ainda dá para mudar a escolha.", "Agora a Luna toca em Confirmar.", "A resposta foi conferida: acertou!", "Depois, é só tocar em Continuar. Sua vez!"] : kind === "write" ? ["Veja o modelo: BOLA.", "A Luna toca no espaço para escrever.", "Ela escreve as letras da palavra.", "Agora a Luna toca em Confirmar.", "A resposta foi conferida: acertou!", "Depois, é só tocar em Continuar. Sua vez!"] : [kind === "listening" ? "Primeiro, toque em Ouvir a frase ou Ver a frase. Aqui vamos mostrar A BOLA ROLA." : `Veja o modelo: ${sentence ? "A BOLA ROLA" : "BOLA"}.`, "A Luna toca no primeiro pedacinho.", "Ela coloca os outros na ordem. Para retirar, toque no pedacinho de novo.", "Agora a Luna toca em Confirmar.", "A resposta foi conferida: acertou!", "Depois, é só tocar em Continuar. Sua vez!"];
  useEffect(() => {
    if (!open || paused || step === 5) return;
    const timer = setTimeout(() => setStep(value => Math.min(5, value + 1)), 2800);
    return () => clearTimeout(timer);
  }, [open, paused, step]);
  function close() { try { localStorage.setItem(storageKey, "seen"); } catch {} setOpen(false); }
  if (!open) return <button className={styles.secondary} onClick={() => { setStep(0); setPaused(false); setOpen(true); }}>Ver como brincar</button>;
  return <aside className={styles.tutorial} aria-label="Demonstração automática da atividade">
    <div className={styles.tutorialHeading}><Image src="/mascotes/feliz.svg" width={54} height={54} alt="Luna" /><div><strong>Veja a Luna fazer primeiro</strong><p>É um exemplo · seu progresso não muda</p></div></div>
    <p aria-live="polite">{labels[step]}</p>
    <div className={styles.demo} aria-label="Exemplo de preenchimento">
      <strong>{kind === "choice" ? "Escolha A" : sentence ? "A BOLA ROLA" : "BOLA"}</strong>
      {kind === "choice" ? <div className={styles.demoOptions}>{["A", "E", "O"].map(value => <span key={value} className={step >= 1 && value === "A" ? styles.demoSelected : ""}>{value}{step === 1 && value === "A" ? " 👆" : ""}</span>)}</div> : <><div className={styles.demoAnswer}>{kind === "write" ? step >= 2 ? "BOLA" : step === 1 ? "│" : "Sua palavra" : step >= 2 ? pieces.join(sentence ? " " : "") : step === 1 ? pieces[0] : "Espaço para montar"}</div>{kind !== "write" && <div className={styles.demoOptions}>{pieces.map((value, i) => <span key={i} className={step >= 2 || step === 1 && i === 0 ? styles.demoSelected : ""}>{value}{step === 1 && i === 0 ? " 👆" : ""}</span>)}</div>}</>}
      <span className={styles.demoConfirm} data-ready={step >= (kind === "choice" ? 1 : 2)}>{step >= 4 ? "✓ Acertou!" : `Confirmar${step === 3 ? " 👆" : ""}`}</span>
      {step === 5 && <strong>Continuar →</strong>}
    </div>
    <div className={styles.tutorialActions}><button className={styles.secondary} onClick={close}>Pular exemplo</button>{step < 5 ? <button className={styles.secondary} onClick={() => setPaused(!paused)}>{paused ? "Retomar" : "Pausar"}</button> : <button className={styles.secondary} onClick={() => { setStep(0); setPaused(false); }}>Ver de novo</button>}<button className={styles.primary} onClick={close}>Minha vez</button></div>
  </aside>;
}
