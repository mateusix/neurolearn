import { palettes, type PaletteId } from './palettes';
import { currentChild, isAccountMode, updateChild } from './family-store';
export type Preferences = { theme: 'animals' | 'food' | 'travel' | 'mixed'; support: 'model' | 'hint'; palette?: PaletteId };
export const themes = [{id:'animals',name:'Animais',icon:'🐱'},{id:'food',name:'Comidas',icon:'🍎'},{id:'travel',name:'Passeios',icon:'🚲'},{id:'mixed',name:'Um pouco de tudo',icon:'🌈'}] as const;
export function validPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== 'object') return false;
  const p = value as Preferences;
  return themes.some(t => t.id === p.theme) && ['model','hint'].includes(p.support) && (p.palette === undefined || palettes.some(item => item.id === p.palette));
}
const key='neurolearn-preferences-v1'; let session='';
export function getPreferencesSnapshot() {
  if (isAccountMode()) { const p=currentChild()?.preferences; return validPreferences(p) ? JSON.stringify(p) : ''; }
  try { const p=JSON.parse(localStorage.getItem(key)||'null'); return validPreferences(p) ? JSON.stringify(p) : session; } catch { return session; }
}
export function readPreferences(): Preferences | null { const value=getPreferencesSnapshot(); return value ? JSON.parse(value) : null; }
export function savePreferences(preferences: Preferences) {
  if (!validPreferences(preferences)) return false;
  if (isAccountMode()) return updateChild({preferences});
  session=JSON.stringify(preferences); let saved=true;
  try { localStorage.setItem(key,session); } catch { saved=false; }
  window.dispatchEvent(new Event('neurolearn-preferences')); return saved;
}
export function subscribePreferences(callback:()=>void) {
  window.addEventListener('storage',callback);window.addEventListener('neurolearn-preferences',callback);
  return ()=>{window.removeEventListener('storage',callback);window.removeEventListener('neurolearn-preferences',callback);};
}
