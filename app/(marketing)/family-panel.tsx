"use client";
import Image from 'next/image';
import { useState, useSyncExternalStore } from 'react';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { avatars } from '@/lib/avatars';
import { readProgress, subscribeProgress, lessons } from '@/lib/lessons';
import { MAX_CHILDREN } from '@/lib/family-types';
import { createChild, getFamilySnapshot, getServerFamilySnapshot, loadFamily, selectChild, subscribeFamily, syncFamily } from '@/lib/family-store';
import styles from './family.module.css';
export default function FamilyPanel({onContinue,onClose}:{onContinue:()=>void;onClose:()=>void}) {
  const {isSignedIn} = useAuth();
  const state = useSyncExternalStore(subscribeFamily,getFamilySnapshot,getServerFamilySnapshot);
  const guestCompleted = useSyncExternalStore(subscribeProgress,readProgress,() => 0);
  const [importProgress,setImportProgress] = useState(false);
  const [name,setName] = useState(''); const [avatar,setAvatar] = useState('');
  const [creating,setCreating] = useState(false); const [error,setError] = useState('');
  async function add(event:React.FormEvent) {
    event.preventDefault(); setCreating(true); setError('');
    try { await createChild(name,avatar,importProgress ? guestCompleted : 0); setImportProgress(false); setName(''); setAvatar(''); } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível criar o perfil.'); }
    finally { setCreating(false); }
  }
  return <section className={styles.panel} aria-labelledby="family-title">
    <p className={styles.eyebrow}>ACOMPANHAR COM CARINHO</p><h1 id="family-title">Painel do responsável</h1>
    {!isSignedIn ? <><p>Entre na sua conta para criar perfis e recuperar o progresso em outro computador.</p><SignInButton mode="modal"><button className={styles.primary}>Entrar como responsável</button></SignInButton><button className={styles.secondary} onClick={onClose}>Voltar à aprendizagem</button></> : <>
      <p>Cada criança tem seu bichinho e suas próprias descobertas. Escolha um perfil para continuar.</p>
      {state.loading ? <p role="status">Carregando seus perfis…</p> : <>
        {state.error && <div role="status" className={styles.notice}><p>{state.error}</p><button onClick={() => state.pending ? void syncFamily() : void loadFamily(state.userId)}> {state.pending ? 'Salvar novamente' : 'Tentar novamente'}</button></div>}
        <div className={styles.profiles}>{Object.values(state.family.children).map(child => <article key={child.id} className={styles.card}>
          <Image src={`/avatars/${child.avatar}.svg`} alt="" width={80} height={80} /><h2>{child.name}</h2>
          <p>{child.completed} de {lessons.length} etapas concluídas</p><progress max={lessons.length} value={child.completed} aria-label={`Etapas concluídas de ${child.name}`} />
          <p className={styles.next}>{child.completed < lessons.length ? `Próxima: ${lessons[child.completed].title}` : 'Trilha concluída! Você pode voltar para praticar.'}</p>
          <p>Última atividade: {new Date(child.updatedAt).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}</p>
          <details><summary>Ver etapas concluídas</summary>{child.completed ? <ul>{lessons.slice(0,child.completed).map(lesson => <li key={lesson.title}>{lesson.title}</li>)}</ul> : <p>As primeiras descobertas estão por vir.</p>}</details>
          <button className={styles.primary} onClick={() => {selectChild(child.id);onContinue();}}>Continuar com {child.name}</button>
        </article>)}</div>
        {!state.error && Object.keys(state.family.children).length < MAX_CHILDREN && <form className={styles.form} onSubmit={add}>
          <h2>Novo perfil infantil</h2><p>Use um apelido. Não é necessário informar nome completo, idade ou diagnóstico.</p>
          <label htmlFor="child-name">Apelido da criança</label><input id="child-name" value={name} onChange={e => setName(e.target.value)} maxLength={32} required autoComplete="off" />
          <fieldset><legend>Escolha o bichinho</legend><div className={styles.animals}>{avatars.map(item => <label key={item.id} className={avatar === item.id ? styles.chosen : ''}><input type="radio" name="child-avatar" value={item.id} checked={avatar === item.id} onChange={() => setAvatar(item.id)} required /><Image src={`/avatars/${item.id}.svg`} width={56} height={56} alt="" /><span>{item.name}</span></label>)}</div></fieldset>
          {guestCompleted > 0 && <label className={styles.import}><input type="checkbox" checked={importProgress} onChange={e => setImportProgress(e.target.checked)} /> Trazer para este perfil as {guestCompleted} etapas concluídas neste navegador</label>}
          {error && <p role="alert">{error}</p>}<button className={styles.primary} disabled={creating || !name.trim() || !avatar}>{creating ? 'Criando…' : 'Criar perfil'}</button>
        </form>}
        {Object.keys(state.family.children).length >= MAX_CHILDREN && <p>Até cinco perfis por responsável nesta versão.</p>}
        {state.selected && <button className={styles.secondary} onClick={onClose}>Voltar à aprendizagem</button>}
        <p role="status">{state.saving ? 'Salvando na conta…' : state.pending ? 'Há descobertas aguardando salvamento.' : state.error ? '' : 'Perfis e progresso salvos na sua conta.'}</p>
      </>}
    </>}
  </section>;
}
