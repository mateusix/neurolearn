export type SoundCue = 'click' | 'success' | 'retry' | 'complete' | 'achievement';
import { isAccountMode } from './family-store';
import { readPreferences, savePreferences } from './preferences';
const key = 'neurolearn-comfort-v1';
let session = '01';
export function getComfortSnapshot() {
  if (isAccountMode()) return readPreferences()?.comfort || session;
  try { const value=localStorage.getItem(key); return value && /^[01]{2}$/.test(value) ? value : session; } catch { return session; }
}
export const getServerComfortSnapshot = () => '01';
export function saveComfort(value:string) {
  if (!/^[01]{2}$/.test(value)) return false;
  session=value;
  if (isAccountMode()) {
    const preferences = readPreferences();
    if (!preferences) return false;
    const saved = savePreferences({...preferences,comfort:value as '00'|'01'|'10'|'11'});
    if (saved) window.dispatchEvent(new Event('neurolearn-comfort'));
    return saved;
  }
  let saved=true;try {localStorage.setItem(key,value);}catch{saved=false;}
  window.dispatchEvent(new Event('neurolearn-comfort'));return saved;
}
export function subscribeComfort(callback:()=>void) {
  window.addEventListener('storage',callback);window.addEventListener('neurolearn-comfort',callback);
  return ()=>{window.removeEventListener('storage',callback);window.removeEventListener('neurolearn-comfort',callback);};
}
export function requestSound(cue:SoundCue) { window.dispatchEvent(new CustomEvent('neurolearn-sound',{detail:cue})); }
