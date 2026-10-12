"use client";
import { getExperienceSnapshot, getServerExperienceSnapshot, subscribeExperience, readExperience, saveExperience } from '@/lib/experience';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Volume2, VolumeX, Sparkles, Palette } from 'lucide-react';
import { getComfortSnapshot,getServerComfortSnapshot,saveComfort,subscribeComfort,type SoundCue } from '@/lib/comfort';
import styles from './comfort.module.css';
import { getPreferencesSnapshot, subscribePreferences } from '@/lib/preferences';
const notes:Record<SoundCue,number[]>={click:[440],success:[440,554],complete:[392,494,587],achievement:[440,554,659]};
function subscribeReducedMotion(callback:()=>void) { const query=window.matchMedia('(prefers-reduced-motion: reduce)');query.addEventListener('change',callback);return()=>query.removeEventListener('change',callback); }
const getReducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export default function ComfortProvider({children}:{children:React.ReactNode}) {
 const experience=JSON.parse(useSyncExternalStore(subscribeExperience,getExperienceSnapshot,getServerExperienceSnapshot));
 const preferences=useSyncExternalStore(subscribePreferences,getPreferencesSnapshot,()=>'');
 const settings=useSyncExternalStore(subscribeComfort,getComfortSnapshot,getServerComfortSnapshot);
 const reduced=useSyncExternalStore(subscribeReducedMotion,getReducedMotion,()=>false);
 const sound=settings[0]==='1', motion=settings[1]==='1'&&!reduced;
 const context=useRef<AudioContext|null>(null);const last=useRef(0);const voices=useRef<OscillatorNode[]>([]);
 const [message,setMessage]=useState('');
 const play=useCallback(async(cue:SoundCue,test=false)=>{
   if(!sound)return;
   const now=Date.now();if(!test&&now-last.current<180)return;last.current=now;
   try {
    const AudioEngine=typeof AudioContext!=='undefined'?AudioContext:(window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
    if(!AudioEngine)throw new Error('Audio unavailable');
    const ctx=context.current||new AudioEngine();context.current=ctx;
    if(ctx.state!=='running')await ctx.resume();
    if(ctx.state!=='running')throw new Error('Audio paused');
    const start=ctx.currentTime;const sequence=notes[cue];
    sequence.forEach((frequency,i)=>{
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;
      const duration=test?.18:.09;
      const at=start+i*duration;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(test?.06:.025,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+(test?.17:.085));
      oscillator.connect(gain);gain.connect(ctx.destination);voices.current.push(oscillator);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();voices.current=voices.current.filter(item=>item!==oscillator);};
      oscillator.start(at);oscillator.stop(at+duration);
    });
    if(test)setMessage("Som de teste reproduzido. Se não ouviu, confira o volume do celular.");
   }catch{setMessage('O som não está disponível neste navegador. Você pode continuar normalmente.');}
 },[sound]);
 useEffect(()=>{
   const listener=(event:Event)=>{const cue=(event as CustomEvent).detail;if(['click','success','complete','achievement'].includes(cue))void play(cue);};
   window.addEventListener('neurolearn-sound',listener);return()=>window.removeEventListener('neurolearn-sound',listener);
 },[play]);
 useEffect(()=>{if(!sound)for(const voice of voices.current){try{voice.stop();}catch{}}},[sound]);
 useEffect(()=>()=>{void context.current?.close();},[]);
 function change(value:string){setMessage(saveComfort(value)?'':'Sua escolha vale nesta sessão, mas não foi possível salvá-la neste navegador.');}
 return <div className={styles.surface} data-motion={motion?'on':'off'} onClick={event=>{
   const target=event.target as Element;const button=target.closest('button');
   if(!button||!button.closest('main')||button.disabled||button.hasAttribute('aria-pressed')||/^Ouvir/i.test(button.getAttribute('aria-label')||button.textContent?.trim()||''))return;
   void play('click');
 }}>
   <aside className={styles.controls} aria-label="Conforto na aprendizagem">
    <button aria-pressed={sound} onClick={()=>change(`${sound?'0':'1'}${settings[1]}`)}>{sound?<Volume2 size={17} aria-hidden="true"/>:<VolumeX size={17} aria-hidden="true"/>} Efeitos sonoros: {sound?'ligados':'desligados'}</button>
    <button aria-pressed={motion} disabled={reduced} title={reduced ? "Movimento reduzido ativado no seu computador" : undefined} onClick={()=>change(`${settings[0]}${motion?'0':'1'}`)}><Sparkles size={17} aria-hidden="true"/> Animações: {reduced?'reduzidas':motion?'ligadas':'desligadas'}</button>
    {preferences&&<button onClick={()=>window.dispatchEvent(new Event('neurolearn-open-colors'))}><Palette size={17} aria-hidden="true"/> Mudar cores</button>}
    {sound&&<button type="button" aria-label="Testar efeitos sonoros" onClick={()=>void play('success',true)}><Volume2 size={17} aria-hidden="true"/> Testar som</button>}
    <button onClick={()=>{const sizes=['small','standard','large'] as const; const value=readExperience(); const next=sizes[(sizes.indexOf(value.fontSize)+1)%sizes.length];setMessage(saveExperience({...value,fontSize:next})?'Tamanho do texto atualizado.':'A escolha vale nesta sessão; o salvamento está indisponível.');}}>Texto: {({small:'menor',standard:'padrão',large:'maior'} as const)[experience.fontSize as 'small'|'standard'|'large']}</button>
    <span role="status">{message}</span>
   </aside>
   {children}
 </div>;
}
