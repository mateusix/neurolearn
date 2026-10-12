"use client";
import Image from "next/image";
import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { getProgress } from "@/lib/lessons";
import { avatars } from "@/lib/avatars";
import styles from "./trail.module.css";
export default function ChooseAvatar({ current, onChoose, onCancel }: {
  current: string; onChoose: (id: string) => void; onCancel: () => void;
}) {
  const [selected, setSelected] = useState(current);
  return <section className={styles.avatarWelcome} aria-labelledby="avatar-title">
    <div className={styles.avatarGuide}><Image src="/mascotes/corpo-acenando.svg" className="luna-wave" alt="Luna acenando" width={88} height={88} /></div>
    <p className={styles.eyebrow}>UMA AVENTURA NO SEU RITMO</p>
    <h1 id="avatar-title">Qual vai ser seu bichinho?</h1>
    <p>Escolha um amigo para acompanhar suas descobertas. Você pode trocar depois!</p>
    <fieldset className={styles.avatarChoices}><legend>Escolha seu bichinho</legend>{avatars.map(avatar => <label key={avatar.id} className={`${styles.avatarCard} ${selected === avatar.id ? styles.avatarSelected : ""}`}>
      <input type="radio" name="avatar" value={avatar.id} disabled={getProgress()<avatar.at} checked={selected === avatar.id} onChange={() => setSelected(avatar.id)} />
      <Image src={`/avatars/${avatar.id}.svg`} alt="" width={104} height={104} />
      <span>{avatar.name}</span>{getProgress()<avatar.at&&<small>Abre após {avatar.at} etapas</small>}{selected === avatar.id && <Check className={styles.avatarCheck} size={20} aria-hidden="true" />}
    </label>)}</fieldset>
    <button className={styles.avatarContinue} disabled={!selected || !avatars.some(a=>a.id===selected&&a.at<=getProgress())} onClick={() => onChoose(selected)}>Vamos aprender <ArrowRight size={20} aria-hidden="true" /></button>
    {current && <button className={styles.avatarCancel} onClick={onCancel}>Voltar sem trocar</button>}
    <p className={styles.developmentNote}>Seu bichinho fica salvo neste navegador.</p>
  </section>;
}
