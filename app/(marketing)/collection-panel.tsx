"use client";
import {useSyncExternalStore,useState} from 'react';
import {LockKeyhole} from 'lucide-react';
import {avatars,getAvatar,saveAvatar,subscribeAvatar} from '@/lib/avatars';
import {getProgress,subscribeProgress} from '@/lib/lessons';
import {getExperienceSnapshot,getServerExperienceSnapshot,subscribeExperience,saveExperience} from '@/lib/experience';
import {accessories,type Experience} from '@/lib/experience-values';
import {earnedAchievements} from '@/lib/achievements';
import LunaMessage from './luna-message';
import AvatarBuddy from './avatar-buddy';
import styles from './discovery.module.css';
export default function CollectionPanel({onBack}:{onBack:()=>void}){
 const completed=useSyncExternalStore(subscribeProgress,getProgress,()=>0);const avatar=useSyncExternalStore(subscribeAvatar,getAvatar,()=>'');
 const experience=JSON.parse(useSyncExternalStore(subscribeExperience,getExperienceSnapshot,getServerExperienceSnapshot)) as Experience;
 const [message,setMessage]=useState('');
 return <section className={styles.panel} aria-labelledby="collection-title"><button className={styles.button} onClick={onBack}>← Voltar à trilha</button><h1 id="collection-title">Meu bichinho e minha coleção</h1>
  <div className={styles.note}><AvatarBuddy id={avatar||'panda'} size={100}/><LunaMessage>Cada descoberta abre uma surpresa. Escolha o que você gosta, no seu ritmo!</LunaMessage></div>
  <h2>Meus amigos</h2><div className={styles.grid}>{avatars.map(a=>completed<a.at?<div key={a.id} className={`${styles.card} ${styles.lockedCard}`}><span className={styles.lockBadge}><LockKeyhole size={16} aria-hidden="true"/> Bloqueado</span><span className={styles.lockedArt}><AvatarBuddy id={a.id} accessory="none" size={76}/></span><strong>{a.name}</strong><small>Abre após {a.at} etapas</small></div>:<button className={styles.card} key={a.id} disabled={completed<a.at} aria-pressed={avatar===a.id} onClick={()=>setMessage(saveAvatar(a.id)?`${a.name} vai acompanhar você!`:'A escolha vale nesta sessão; confira o salvamento.')}><AvatarBuddy id={a.id} accessory="none" size={76}/><strong>{a.name}</strong><small>{completed<a.at?`Abre após ${a.at} etapas`:avatar===a.id?'Seu amigo escolhido':'Escolher este amigo'}</small></button>)}</div>
  <h2>Acessórios</h2><div className={styles.grid}>{accessories.map(a=>completed<a.at?<div key={a.id} className={`${styles.card} ${styles.lockedCard}`}><span className={styles.lockBadge}><LockKeyhole size={16} aria-hidden="true"/> Bloqueado</span><span className={styles.lockedArt} aria-hidden="true" style={{fontSize:32}}>{a.icon}</span><strong>{a.name}</strong><small>Abre após {a.at} etapas</small></div>:<button className={styles.card} key={a.id} disabled={completed<a.at} aria-pressed={experience.accessory===a.id} onClick={()=>setMessage(saveExperience({...experience,accessory:a.id})?'Personalização atualizada.':'A escolha vale nesta sessão; confira o salvamento.')}><span aria-hidden="true" style={{fontSize:32}}>{a.icon}</span><strong>{a.name}</strong><small>{completed<a.at?`Abre após ${a.at} etapas`:'Usar no meu bichinho'}</small></button>)}</div>
  <h2>Meus adesivos</h2><p>Os adesivos representam as conquistas da sua trilha.</p><div className={styles.stickers}>{earnedAchievements(completed).map(a=><span className={styles.sticker} key={a.id} title={a.title} aria-label={a.title}>{a.icon}</span>)}</div>{completed<3&&<p>Seu primeiro adesivo aparece ao concluir três etapas.</p>}
  <p role="status">{message}</p>
 </section>;
}
