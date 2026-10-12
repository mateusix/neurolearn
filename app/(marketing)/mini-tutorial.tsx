"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { getFamilySnapshot } from "@/lib/family-store";
import type { Exercise } from "@/lib/lessons";
import styles from "./lesson.module.css";
export function tutorialKind(exercise: Exercise) {
  return exercise.listening ? "listening" : exercise.kind === "order" && exercise.separator ? "sentence" : exercise.kind;
}
export default function MiniTutorial({ kind, children }: { kind: string; children: ReactNode }) {
  const family = getFamilySnapshot();
  const storageKey = `neurolearn-demo-v2:${family.userId || "guest"}:${family.selected || "guest"}:${kind}`;
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(storageKey) !== "seen"; } catch { return true; } });
  const activity = useRef<HTMLDivElement>(null);
  const focusActivity = useRef(false);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const sentence = kind === "sentence" || kind === "listening";
  const pieces = sentence ? ["A", "BOLA", "ROLA"] : ["BO", "LA"];
  const labels = kind === 'memory' ? ['Neste jogo, a Luna procura uma imagem e seu nome.','Ela vira a carta do gato.','Agora vira a palavra GATO: é um par!','O par encontrado fica aberto.','Se as cartas não combinarem, ela pode tentar novamente.','Quando encontrar todos os pares, pode continuar. Sua vez!'] : kind === "choice" ? ["Veja a pergunta: escolha a letra A.", "A Luna toca na caixinha A. Ela fica marcada.", "Ainda dá para mudar a escolha.", "Agora a Luna toca em Confirmar.", "A resposta foi conferida: acertou!", "No exercício, toque em Continuar depois de acertar. O exemplo terminou!"] : kind === "write" ? ["Veja o modelo: BOLA.", "A Luna toca no espaço para escrever.", "Ela escreve as letras da palavra.", "Agora a Luna toca em Confirmar.", "A resposta foi conferida: acertou!", "No exercício, toque em Continuar depois de acertar. O exemplo terminou!"] : [kind === "listening" ? "Primeiro, toque em Ouvir a frase ou Ver a frase. Aqui vamos mostrar A BOLA ROLA." : `Veja o modelo: ${sentence ? "A BOLA ROLA" : "BOLA"}.`, "A Luna toca no primeiro pedacinho.", "Ela coloca os outros na ordem. Para retirar, toque no pedacinho de novo.", "Agora a Luna toca em Confirmar.", "A resposta foi conferida: acertou!", "No exercício, toque em Continuar depois de acertar. O exemplo terminou!"];
  useEffect(() => {
    if (!open || paused || step === 5) return;
    const timer = setTimeout(() => setStep(value => Math.min(5, value + 1)), 2800);
    return () => clearTimeout(timer);
  }, [open, paused, step]);
  useEffect(() => { if (!open && focusActivity.current) { activity.current?.focus(); focusActivity.current = false; } }, [open]);
  function close() { try { localStorage.setItem(storageKey, "seen"); } catch {} focusActivity.current = true; setOpen(false); }
  if (!open) return <><button className={`${styles.secondary} ${styles.tutorialReopen}`} onClick={() => { setStep(0); setPaused(false); setOpen(true); }}>Ver o tutorial de novo</button><div ref={activity} tabIndex={-1} className={styles.activity} aria-label="Exercício: agora é sua vez">{children}</div></>;
  return <aside className={styles.tutorial} aria-label="Tutorial: como fazer o exercício">
    <div className={styles.tutorialHeading}><Image src="/mascotes/feliz.svg" width={54} height={54} alt="Luna" /><div><span className={styles.tutorialBadge}>TUTORIAL · COMO FAZER</span><h3>Veja a Luna fazer primeiro</h3><p>Agora é só observar. Depois será sua vez!</p></div></div>
    <div className={styles.tutorialProgress}><span>{paused ? "Exemplo pausado" : step === 5 ? "Exemplo terminado" : "Exemplo automático"}</span><span>Passo {step + 1} de {labels.length}</span></div>
    <p aria-live="polite">{labels[step]}</p>
    <div className={styles.demo} aria-label="Demonstração sem interação"><span className={styles.demoNotice}>SÓ OBSERVE · A LUNA PREENCHE SOZINHA</span>
      <strong>{kind === "memory" ? "Combine imagem e palavra" : kind === "choice" ? "Escolha A" : sentence ? "A BOLA ROLA" : "BOLA"}</strong>
      {(kind === "choice" || kind === "memory") ? <div className={styles.demoOptions}>{(kind === "memory" ? ["🐱", "GATO", "🐸"] : ["A", "E", "O"]).map(value => <span key={value} className={step >= 1 && (value === "A" || value === "🐱" || step >= 2 && value === "GATO") ? styles.demoSelected : ""}>{value}{step === 1 && value === "A" ? " 👆" : ""}</span>)}</div> : <><div className={styles.demoAnswer}>{kind === "write" ? step >= 2 ? "BOLA" : step === 1 ? "│" : "Sua palavra" : step >= 2 ? pieces.join(sentence ? " " : "") : step === 1 ? pieces[0] : "Espaço para montar"}</div>{kind !== "write" && <div className={styles.demoOptions}>{pieces.map((value, i) => <span key={i} className={step >= 2 || step === 1 && i === 0 ? styles.demoSelected : ""}>{value}{step === 1 && i === 0 ? " 👆" : ""}</span>)}</div>}</>}
      <span className={styles.demoConfirm} data-ready={step >= (kind === "choice" ? 1 : 2)}>{kind === "memory" ? step >= 2 ? "✓ Par encontrado!" : "Vire duas cartas" : step >= 4 ? "✓ Acertou!" : `Confirmar${step === 3 ? " 👆" : ""}`}</span>
      {step === 5 && <span className={styles.demoFinished}>Pronto! Você viu como fazer.</span>}
    </div>
    <p className={styles.tutorialHint}>Este exemplo não conta pontos nem muda seu progresso.</p>
    <div className={styles.tutorialActions}>{step < 5 ? <button className={styles.secondary} onClick={() => setPaused(!paused)}>{paused ? "Continuar o tutorial" : "Pausar o tutorial"}</button> : <button className={styles.secondary} onClick={() => { setStep(0); setPaused(false); }}>Ver o tutorial de novo</button>}<button className={styles.primary} onClick={close}>Ir para o exercício <span aria-hidden="true">→</span></button></div>
  </aside>;
}
