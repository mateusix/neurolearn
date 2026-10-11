"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getPreferencesSnapshot, subscribePreferences, savePreferences, type Preferences } from '@/lib/preferences';
import PalettePicker from './palette-picker';
export default function PaletteProvider({children}:{children:React.ReactNode}) {
 const snapshot=useSyncExternalStore(subscribePreferences,getPreferencesSnapshot,()=> '');
 const preferences:Preferences|null=snapshot?JSON.parse(snapshot):null;
 const dialog=useRef<HTMLDialogElement>(null);
 const [open,setOpen]=useState(false);
 const [message,setMessage]=useState('');
 useEffect(()=>{const show=()=>setOpen(true);window.addEventListener('neurolearn-open-colors',show);return()=>window.removeEventListener('neurolearn-open-colors',show);},[]);
 useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
 return <div data-palette={preferences?.palette||'blue'} style={{minHeight:'100vh',background:'var(--nl-bg)',color:'var(--nl-text)'}}>{children}
 <dialog ref={dialog} className="neurolearn-colors-dialog" aria-label="Mudar minhas cores" onClose={()=>setOpen(false)} onCancel={()=>setOpen(false)}>
 {open&&preferences&&<PalettePicker current={preferences.palette} onSave={palette=>{if(savePreferences({...preferences,palette})){setMessage('');setOpen(false);}else setMessage('Sua escolha vale nesta sessão, mas não foi possível salvá-la.');}} onCancel={()=>setOpen(false)}/>}<p role="status">{message}</p>
 </dialog></div>;
}
