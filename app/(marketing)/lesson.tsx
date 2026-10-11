"use client";
import Image from "next/image";
import MiniTutorial, { tutorialKind } from "./mini-tutorial";

import { exerciseGuidance } from "@/lib/exercise-guidance";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, Trophy } from "lucide-react";
import { lessons, normalizeAnswer, assembleAnswer, isAnswerReady, readLessonPosition, saveLessonPosition, getProgress } from "@/lib/lessons";
import { chooseDialogue, type Dialogue } from "@/lib/luna-dialogue";
import { requestSound } from "@/lib/comfort";
import { useNarration } from "@/lib/use-narration";
import { personalizedLesson } from "@/lib/personalized-lessons";
import type { Preferences } from "@/lib/preferences";
import { achievements } from "@/lib/achievements";
import styles from "./lesson.module.css";

export default function Lesson({ index, onBack, onComplete, onNext, preferences = null }: { index: number; onBack: () => void; onComplete: () => void; onNext?: () => void; preferences?: Preferences | null }) {
  const lesson = useMemo(() => personalizedLesson(index, preferences), [index, preferences]);
  const [initialCompleted] = useState(getProgress);
  const newAchievement = achievements.find(item => item.at === index + 1 && initialCompleted < item.at);
  const [position, setPosition] = useState(() => readLessonPosition(index));
  const [choice, setChoice] = useState("");
  const [pieces, setPieces] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "retry" | null>(null);
  const [hint, setHint] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [finishDialogue, setFinishDialogue] = useState<Dialogue | null>(null);
  const [finished, setFinished] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const { speak, stop, message, hasAudio } = useNarration();
  const exercise = lesson.exercises[position];
  const orientation = exerciseGuidance(exercise);
  useEffect(() => { title.current?.focus(); }, [position, finished]);
  const answer = exercise.kind === "order" ? assembleAnswer(exercise, pieces) : choice;
  const ready = isAnswerReady(exercise, choice, pieces);
  const [storageWarning, setStorageWarning] = useState("");
  function confirm() {
    if (!ready || feedback === "correct" || (exercise.kind === "order" && feedback === "retry")) return;
    showResult(normalizeAnswer(answer) === exercise.answer);
  }
  function showResult(correct:boolean) {
    stop();
    if (correct) requestSound("success");
    setFeedback(correct ? "correct" : "retry");
    setHint(!correct);
    setDialogue(chooseDialogue(correct ? "success" : "support"));
    if (correct && position < lesson.exercises.length - 1 && !saveLessonPosition(index, position + 1)) setStorageWarning("Vamos continuar. Não foi possível salvar a retomada neste navegador.");
  }
  function togglePiece(index:number) {
    if (feedback === "correct") return;
    setPieces(current=>current.includes(index)?current.filter(piece=>piece!==index):[...current,index]);
    setFeedback(null);setHint(false);setDialogue(null);
  }
  function retryOrder() {
    stop(); setPieces([]); setFeedback(null); setHint(false);
    requestAnimationFrame(() => title.current?.focus());
  }
  function changeChoice(value: string) { setChoice(value); setFeedback(null); }
  function restart() {
    stop(); saveLessonPosition(index, 0); setPosition(0); setChoice(""); setPieces([]); setFeedback(null); setHint(false); setShowTranscript(false); setDialogue(null); setFinishDialogue(null); setFinished(false);
  }
  function next() {
    stop();
    if (position === lesson.exercises.length - 1) { saveLessonPosition(index, 0); onComplete(); setFinishDialogue(chooseDialogue(!onNext ? "final" : newAchievement ? "achievement" : "finish")); requestSound(newAchievement ? "achievement" : "complete"); setFinished(true); return; }
    setPosition(position + 1); setChoice(""); setPieces([]); setFeedback(null); setHint(false); setShowTranscript(false); setDialogue(null);
  }
  return <section className={styles.lesson} data-feedback={feedback ?? undefined} aria-labelledby="lesson-title">
    <div className={styles.toolbar}><button className={styles.secondary} onClick={() => { stop(); onBack(); }}><ArrowLeft size={18} aria-hidden="true" /> Voltar à trilha</button><span>{finished ? "Etapa concluída" : `${position + 1} de ${lesson.exercises.length}`}</span></div>
    <div className={styles.progress} role="progressbar" aria-label="Atividades concluídas nesta lição" aria-valuemin={0} aria-valuemax={lesson.exercises.length} aria-valuenow={finished ? lesson.exercises.length : position}><span style={{width:`${(finished ? 1 : position / lesson.exercises.length) * 100}%`, backgroundColor:`hsl(${45 + (finished ? 1 : position / lesson.exercises.length) * 80} 42% 65%)`}} /></div>
    {finished ? <div className={styles.finish}>
      <Image className="luna-celebrate" src="/mascotes/comemorando.svg" width={180} height={180} alt="Mascote comemorando" />
      <h2 id="lesson-title" ref={title} tabIndex={-1}>Uma etapa cheia de descobertas!</h2>
      {newAchievement && <div className={`${styles.achievementUnlocked} achievement-reveal`} role="status"><span aria-hidden="true">{newAchievement.icon}</span><div><strong><Trophy size={18} aria-hidden="true"/> Você liberou uma conquista!</strong><p>{newAchievement.title}</p></div></div>}
      <p>Você concluiu {lesson.title.toLowerCase()}.</p>
      <p>{finishDialogue?.text || (onNext ? "Mais uma descoberta! Vamos descansar um pouquinho ou seguir para a próxima etapa? No seu ritmo." : "Você percorreu toda a trilha! Quer descansar um pouquinho ou praticar de novo? No seu ritmo.")}</p>
      {finishDialogue && hasAudio(finishDialogue.id) && <button className={styles.secondary} onClick={() => speak(finishDialogue.id)}><Volume2 size={20} aria-hidden="true" /> Ouvir</button>}
      <div className={styles.finishActions}>
        <button className={styles.secondary} onClick={() => { stop(); onBack(); }}><ArrowLeft size={18} aria-hidden="true" /> Voltar à trilha</button>
        {onNext ? <button className={styles.primary} onClick={() => { stop(); onNext(); }}>Próxima etapa <ArrowRight size={18} aria-hidden="true" /></button> : <button className={styles.primary} onClick={restart}><RotateCcw size={18} aria-hidden="true" /> Praticar de novo</button>}
      </div>
      {onNext && <p className={styles.nextStage}>A seguir: {lessons[index + 1].title}</p>}
    </div> : <>
      <p className={styles.eyebrow}>{lesson.title}</p>
      <h2 id="lesson-title" ref={title} tabIndex={-1}>{exercise.prompt}</h2>
      <MiniTutorial key={tutorialKind(exercise)} kind={tutorialKind(exercise)} />
      {orientation && <div className={styles.lunaOrientation}><strong>Luna explica</strong><p>{orientation.text}</p>{hasAudio(orientation.id)&&<button className={styles.secondary} onClick={() => speak(orientation.id)} aria-label="Ouvir a explicação da Luna"><Volume2 size={18} aria-hidden="true"/> Ouvir a Luna</button>}</div>}
      {hasAudio(exercise.id) && <button className={styles.secondary} onClick={() => speak(exercise.id)}><Volume2 size={20} aria-hidden="true" /> {exercise.listening ? "Ouvir a frase" : "Ouvir a instrução"}</button>}
      {exercise.listening && <div className={styles.listeningSupport}>
        <p>{hasAudio(exercise.id) ? "Toque em Ouvir a frase. Depois, coloque as palavras na ordem que você escutou. Pode ouvir quantas vezes quiser." : "O áudio desta frase está em preparação. Você pode usar Ver a frase para montar com um modelo."}</p>
        <button className={styles.secondary} onClick={() => setShowTranscript(!showTranscript)} aria-expanded={showTranscript}>{showTranscript ? "Esconder a frase" : "Ver a frase"}</button>
        {showTranscript && <p className={styles.transcript}>{exercise.word}</p>}
      </div>}
      {!exercise.listening && (exercise.picture || exercise.word) && <div className={styles.picture}>
        {exercise.picture && (exercise.pictureAudioId && hasAudio(exercise.pictureAudioId) ? <button className={styles.pictureListen} aria-label={`Ouvir ${exercise.word?.toLocaleLowerCase("pt-BR")}`} onClick={() => speak(exercise.pictureAudioId!)}><span aria-hidden="true">{exercise.picture}</span><Volume2 size={22} aria-hidden="true" /></button> : <span role="img" aria-label={exercise.word?.toLocaleLowerCase("pt-BR")}>{exercise.picture}</span>)}
        {!exercise.hideModel && <span className={styles.word}>{exercise.word}</span>}
      </div>}
      {exercise.optionAudio && Object.values(exercise.optionAudio).some(hasAudio) && <p className={styles.audioExplanation}>Toque em uma opção para selecionar e ouvir a Nina. Depois, confirme sua resposta.{exercise.id.startsWith("animal-") && " Aqui, a Nina imita os sons dos animais."}</p>}
      {exercise.kind === "choice" && <div className={styles.options} role="group" aria-label="Opções de resposta">{exercise.options!.map((option) => <button key={option} aria-pressed={choice === option} disabled={feedback === "correct"} className={`${styles.option} ${choice === option ? styles.chosen : ""}`} onClick={() => { changeChoice(option); const audioId = exercise.optionAudio?.[option]; if (audioId && hasAudio(audioId)) void speak(audioId); }}>{option}{exercise.optionAudio?.[option] && hasAudio(exercise.optionAudio[option]) && <Volume2 size={18} aria-hidden="true" />}</button>)}</div>}
      {exercise.kind === "order" && <>
        <div className={styles.assembled} aria-label="Sua palavra" aria-live="polite">{pieces.length ? pieces.map((piece, slot) => <button key={piece} className={styles.piece} disabled={feedback === "correct"} aria-label={`Retirar ${exercise.options![piece]}, posição ${slot+1}`} onClick={() => togglePiece(piece)}>{exercise.options![piece]}</button>) : exercise.separator ? "Toque nas palavras para montar" : "Toque nas sílabas para montar"}</div>
        {feedback === null && pieces.length > 0 && <p className={styles.editHelp}>Toque novamente em um pedacinho para retirá-lo. Você pode mudar a ordem antes de confirmar.</p>}
        <div className={styles.options} role="group" aria-label={exercise.separator ? "Palavras da frase" : "Sílabas da palavra"}>{exercise.options!.map((option, i) => <button key={i} className={`${styles.option} ${pieces.includes(i) ? styles.chosen : ""}`} aria-pressed={pieces.includes(i)} aria-label={`${option}, opção ${i+1}`} disabled={feedback === "correct"} onClick={() => togglePiece(i)}>{option}</button>)}</div>
      </>}
      {exercise.kind === "write" && <label className={styles.inputLabel}>Sua palavra<input value={choice} onChange={(event) => changeChoice(event.target.value)} disabled={feedback === "correct"} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); confirm(); } }} autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck={false} maxLength={30} /></label>}
      {hint && <div className={styles.hint}><p>{exercise.hint}</p>{hasAudio(`${exercise.id}-dica`) && <button className={styles.secondary} onClick={() => speak(`${exercise.id}-dica`)}><Volume2 size={18} aria-hidden="true" /> Ouvir a dica</button>}</div>}
      {feedback && <div className={`${styles.feedback} ${feedback === "correct" ? styles.correct : styles.retry}`} role="status"><Image className={feedback === "correct" ? "luna-happy" : "luna-encourage"} src={`/mascotes/${feedback === "correct" ? "feliz" : "encorajador"}.svg`} width={80} height={80} alt={feedback === "correct" ? "Mascote feliz" : "Mascote encorajando"} /><div><strong>{feedback === "correct" ? exercise.kind === "speak" ? "Muito bem! Você praticou com sua voz." : "Isso! Você acertou." : "Vamos tentar de outro jeito?"}</strong><p>{dialogue?.text || (feedback === "correct" ? "Mais uma descoberta na sua trilha." : "Olhe a dica. Você pode tentar novamente.")}</p>{dialogue && hasAudio(dialogue.id) && <button className={styles.feedbackAudio} onClick={() => speak(dialogue!.id)} aria-label="Ouvir a mensagem de apoio"><Volume2 size={17} aria-hidden="true" /> Ouvir</button>}</div></div>}
      <div className={styles.actions}>{feedback === "correct" ? <button className={styles.primary} onClick={next}>{position === lesson.exercises.length - 1 ? "Concluir etapa" : exercise.kind === "speak" ? "Próximo" : "Continuar"}<ArrowRight size={18} aria-hidden="true" /></button> : exercise.kind === "order" && feedback === "retry" ? <button className={styles.primary} onClick={retryOrder}><RotateCcw size={18} aria-hidden="true" /> Tentar novamente</button> : <>{exercise.kind !== "speak" && <button className={styles.secondary} onClick={() => setHint(!hint)}>{hint ? "Fechar dica" : "Ver uma dica"}</button>}{exercise.kind !== "speak" && <button className={styles.primary} onClick={confirm} disabled={!ready}>Confirmar</button>}</>}</div>
    </>}
    <p role="status" className={styles.error}>{message || storageWarning}</p>
  </section>;
}
