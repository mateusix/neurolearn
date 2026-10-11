"use client";
import { useState } from 'react';
import { palettes, type PaletteId } from '@/lib/palettes';
import styles from './trail.module.css';
export default function PalettePicker({current,onSave,onCancel}:{current?:PaletteId;onSave:(value:PaletteId)=>void;onCancel?:()=>void}) {
 const [selected,setSelected]=useState<PaletteId>(current||'blue');
 return <section className={styles.avatarWelcome} aria-labelledby="palette-title" data-palette={selected} style={{background:'var(--nl-bg)',color:'var(--nl-text)',borderRadius:24,padding:24}}>
 <p className={styles.eyebrow}>DO SEU JEITINHO</p><h1 id="palette-title">Quais cores você prefere?</h1><p>Experimente uma combinação. Você pode mudar depois.</p>
 <fieldset className={styles.avatarChoices}><legend>Escolha suas cores</legend>{palettes.map(p=><label key={p.id} className={`${styles.avatarCard} ${selected===p.id?styles.avatarSelected:''}`}>
 <input type="radio" name="palette" checked={selected===p.id} onChange={()=>setSelected(p.id)}/><span style={{display:'flex',gap:6}} aria-hidden="true">{p.colors.map(c=><span key={c} style={{width:26,height:26,borderRadius:'50%',background:c,border:'1px solid #89949c'}}/>)}</span><strong>{p.name}</strong><span>{p.description}</span></label>)}</fieldset>
 <div className={styles.welcome} style={{margin:'16px 0',padding:20}}><strong>Uma descoberta de cada vez</strong><p>Estas são as cores da sua aprendizagem.</p></div>
 <button className={styles.avatarContinue} onClick={()=>onSave(selected)}>Usar estas cores</button>{onCancel&&<button className={styles.avatarCancel} onClick={onCancel}>Voltar sem mudar</button>}
 </section>;
}
