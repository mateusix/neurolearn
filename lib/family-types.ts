import type { Experience } from "./experience-values";
import type { Preferences } from "./preferences";
export type ChildProfile = { id: string; name: string; avatar: string; completed: number; positions: Record<string, number>; updatedAt: string; preferences?: Preferences; experience?: Experience };
export type Family = { version: 2; children: Record<string, ChildProfile> };
export const emptyFamily = (): Family => ({ version: 2, children: {} });
export const MAX_CHILDREN = 5;
