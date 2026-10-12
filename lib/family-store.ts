import { emptyExperience, validExperience, mergeExperience } from './experience-values';
import { lessons } from './lessons';
import type { ChildProfile, Family } from './family-types';
import { emptyFamily } from './family-types';
type Snapshot = { userId: string | null; family: Family; selected: string; loading: boolean; error: string; saving: boolean; pending: boolean };
const initial: Snapshot = { userId: null, family: emptyFamily(), selected: '', loading: true, error: '', saving: false, pending: false };
let state = initial;
let revision = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let queue: Promise<void> = Promise.resolve();
const dirty = new Set<string>();
const listeners = new Set<() => void>();
export const getFamilySnapshot = () => state;
export const getServerFamilySnapshot = () => initial;
export function subscribeFamily(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function emit() { for (const listener of listeners) listener(); if (typeof window !== 'undefined') { window.dispatchEvent(new Event('neurolearn-progress')); window.dispatchEvent(new Event('neurolearn-avatar-change')); window.dispatchEvent(new Event('neurolearn-preferences')); window.dispatchEvent(new Event('neurolearn-experience')); } }
function set(patch: Partial<Snapshot>) { state = { ...state, ...patch }; emit(); }
const cacheKey = (user: string, child: string) => `neurolearn-pending:${user}:${child}`;
function cache(child: ChildProfile) { try { localStorage.setItem(cacheKey(state.userId!, child.id), JSON.stringify(child)); } catch { set({error:'Não foi possível guardar uma cópia neste navegador. Mantenha a página aberta até salvar na conta.'}); } }
function merge(server: ChildProfile, local: ChildProfile): ChildProfile {
  const completed = Math.min(lessons.length, Math.max(server.completed, local.completed));
  const positions = { ...server.positions };
  for (const [index, value] of Object.entries(local.positions)) {
    const stage = Number(index);
    if (/^\d+$/.test(index) && lessons[stage] && Number.isInteger(value) && value >= 0 && value < lessons[stage].exercises.length) positions[index] = stage < completed ? 0 : Math.max(positions[index] || 0, value);
  }
  return { ...server, ...(validExperience(local.experience,lessons.length) ? {experience:mergeExperience(validExperience(server.experience,lessons.length)?server.experience:emptyExperience(),local.experience)} : {}), avatar: local.avatar, preferences:local.preferences ?? server.preferences, completed, positions };
}
export function currentChild() { return state.family.children[state.selected]; }
export function isAccountMode() { return state.userId !== null; }
export function reportAuthUnavailable() {
  if (state.loading && !state.userId) set({loading:false,error:'A conexão com o acesso do responsável demorou mais que o esperado. Tente novamente.'});
}
async function familyRequest(options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('/api/family', {...options,signal:controller.signal});
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Não foi possível acessar os perfis.');
    return body;
  } finally { clearTimeout(timeout); }
}
export async function loadFamily(userId: string | null) {
  revision++; const generation = revision;
  clearTimeout(timer);
  set({ userId, family: emptyFamily(), selected: '', loading: !!userId, error: '', saving:false, pending:false });
  if (!userId) return;
  try {
    const family: Family = await familyRequest({cache:'no-store'});
    if (generation !== revision) return;
    let pending = false;
    for (const child of Object.values(family.children)) {
      try {
        const local = JSON.parse(localStorage.getItem(cacheKey(userId,child.id)) || 'null');
        if (local && local.id === child.id && Number.isInteger(local.completed) && local.completed >= 0 && typeof local.avatar === 'string' && local.positions && typeof local.positions === 'object') { family.children[child.id] = merge(child,local); dirty.add(cacheKey(userId,child.id)); pending = true; }
      } catch {}
    }
    let selected = '';
    try { selected = localStorage.getItem(`neurolearn-child:${userId}`) || ''; } catch {}
    if (!family.children[selected]) selected = Object.keys(family.children)[0] || '';
    set({family, selected, loading:false, pending});
    if (pending) void syncFamily();
  } catch { if (generation === revision) set({loading:false,error:'Não conseguimos carregar os perfis. Tente novamente para continuar com segurança.'}); }
}
export function selectChild(id: string) {
  if (!state.family.children[id]) return;
  set({selected:id});
  try { localStorage.setItem(`neurolearn-child:${state.userId}`,id); } catch {}
}
export function updateChild(patch: Partial<Pick<ChildProfile,'avatar'|'completed'|'positions'|'preferences'|'experience'>>) {
  const child = currentChild(); if (!child) return false;
  const updated = {...child,...patch,updatedAt:new Date().toISOString()};
  set({family:{...state.family,children:{...state.family.children,[child.id]:updated}},pending:true,error:''});
  dirty.add(cacheKey(state.userId!,child.id));
  cache(updated);
  clearTimeout(timer); timer = setTimeout(() => { void syncFamily(); },1500);
  return true;
}
export function syncFamily() {
  const generation = revision; const userId = state.userId;
  if (!userId || !Object.values(state.family.children).some(child => dirty.has(cacheKey(userId,child.id)))) return queue;
  queue = queue.catch(() => {}).then(async () => {
    if (!userId || generation !== revision) return;
    const children = Object.values(state.family.children).filter(child => dirty.has(cacheKey(userId,child.id))).map(child => structuredClone(child));
    if (!children.length) return;
    set({saving:true,error:''});
    try {
      for (const child of children) {
        const remote: ChildProfile = await familyRequest({method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'progress',childId:child.id,avatar:child.avatar,completed:child.completed,positions:child.positions,preferences:child.preferences,experience:child.experience})});
        if (generation !== revision) return;
        const latest = state.family.children[child.id];
        // Preserve edits made while this request was in flight.
        if (latest && JSON.stringify(latest) === JSON.stringify(child)) {
          set({family:{...state.family,children:{...state.family.children,[child.id]:remote}}});
          dirty.delete(cacheKey(userId,child.id));
          try { localStorage.removeItem(cacheKey(userId,child.id)); } catch {}
        }
      }
      if (generation === revision) {
        const pending = Object.values(state.family.children).some(child => dirty.has(cacheKey(userId,child.id)));
        set({saving:false,pending});
      }
    } catch { if (generation === revision) set({saving:false,pending:true,error:'O salvamento na conta está pendente. Confira a conexão e toque em Salvar novamente.'}); }
  });
  return queue;
}
export async function createChild(name: string, avatar: string, importCompleted = 0) {
  const generation = revision;
  const result = await familyRequest({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',name,avatar})});
  if (generation !== revision) return;
  const child: ChildProfile = result;
  set({family:{...state.family,children:{...state.family.children,[child.id]:child}}});
  selectChild(child.id);
  if (importCompleted > 0) { updateChild({completed:importCompleted}); await syncFamily(); }
}
