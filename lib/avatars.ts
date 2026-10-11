import { currentChild, isAccountMode, updateChild } from "./family-store";
export const avatars = [
  { id: "panda", name: "Panda" }, { id: "urso", name: "Urso" },
  { id: "borboleta", name: "Borboleta" }, { id: "gato", name: "Gato" },
  { id: "coelho", name: "Coelho" }, { id: "raposa", name: "Raposa" },
] as const;
const key = "neurolearn-avatar-v1";
let sessionAvatar = "";
export function validAvatar(id: string) { return avatars.some(avatar => avatar.id === id); }
export function getAvatar() {
  if (isAccountMode()) return currentChild()?.avatar || "";
  if (typeof window === "undefined") return "";
  try { const stored = localStorage.getItem(key); return stored && validAvatar(stored) ? stored : sessionAvatar; }
  catch { return sessionAvatar; }
}
export function saveAvatar(id: string) {
  if (!validAvatar(id)) return false;
  if (isAccountMode()) return updateChild({avatar:id});
  sessionAvatar = id;
  let saved = true;
  try { localStorage.setItem(key, id); } catch { saved = false; }
  window.dispatchEvent(new Event("neurolearn-avatar-change"));
  return saved;
}
export function subscribeAvatar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("neurolearn-avatar-change", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("neurolearn-avatar-change", callback); };
}
