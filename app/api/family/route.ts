import { allowFamilyRequest, isRecord, validChildName, readLimitedJson, logFamilyFailure } from '@/lib/api-security';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { validPreferences } from '@/lib/preferences';
import { avatars } from '@/lib/avatars';
import { lessons } from '@/lib/lessons';
import { emptyFamily, MAX_CHILDREN, type ChildProfile, type Family } from '@/lib/family-types';
export const runtime = 'nodejs';
const locks = new Map<string,Promise<unknown>>();
function familyFrom(value: unknown): Family {
  if (!value || typeof value !== 'object' || !('children' in value) || !value.children || typeof value.children !== 'object' || Array.isArray(value.children)) return emptyFamily();
  const children: Record<string,ChildProfile> = Object.create(null);
  for (const [id, child] of Object.entries(value.children as Record<string,ChildProfile>)) {
    if (!child || child.id !== id || !Number.isInteger(child.completed) || child.completed < 0 || !avatars.some(item => item.id === child.avatar) || !validChildName(child.name)) continue;
    const completed = Math.min(child.completed, lessons.length);
    const positions: Record<string,number> = {};
    for (const [index,position] of Object.entries(isRecord(child.positions) ? child.positions : {})) {
      const stage = Number(index);
      if (/^\d+$/.test(index) && lessons[stage] && Number.isInteger(position) && position >= 0 && position < lessons[stage].exercises.length) positions[index] = stage < completed ? 0 : position;
    }
    if (!/^[a-zA-Z0-9-]{1,80}$/.test(id) || Object.keys(children).length >= MAX_CHILDREN) continue;
    children[id] = {id,name:child.name.trim(),avatar:child.avatar,completed,positions,updatedAt:typeof child.updatedAt === 'string' ? child.updatedAt : '',...(validPreferences(child.preferences) ? {preferences:child.preferences} : {})};
  }
  return {version:1,children};
}
const json = (value: unknown, status = 200) => Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
function limited(userId: string, method: 'GET' | 'POST') {
  const limit = allowFamilyRequest(userId,method);
  return limit.allowed ? null : Response.json({error:'Muitas tentativas. Aguarde um minuto e tente novamente.'},{status:429,headers:{'Cache-Control':'no-store','Retry-After':String(limit.retryAfter)}});
}
export async function GET() {
  const {userId} = await auth(); if (!userId) return json({error:'Faça login como responsável.'},401);
  const rejection = limited(userId,'GET'); if (rejection) return rejection;
  try { const client = await clerkClient(); const user = await client.users.getUser(userId); return json(familyFrom(user.privateMetadata.neurolearn)); }
  catch { logFamilyFailure('load'); return json({error:'Não foi possível carregar os perfis.'},503); }
}
export async function POST(request: Request) {
  const {userId} = await auth(); if (!userId) return json({error:'Faça login como responsável.'},401);
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error:'Origem não permitida.'},403);
  if ((request.headers.get('content-type') || '').toLowerCase().split(';')[0].trim() !== 'application/json') return json({error:'Envie dados em JSON.'},415);
  const rejection = limited(userId,'POST'); if (rejection) return rejection;
  let body: Record<string,unknown>;
  try { body = await readLimitedJson(request); } catch (error) { return json({error:error instanceof RangeError ? 'Dados muito grandes.' : 'Dados inválidos.'},error instanceof RangeError ? 413 : 400); }
  const previous = locks.get(userId) || Promise.resolve();
  const task = previous.catch(() => {}).then(async () => {
    const client = await clerkClient(); const user = await client.users.getUser(userId);
    const family = familyFrom(user.privateMetadata.neurolearn);
    let child: ChildProfile;
    if (body.action === 'create') {
      if (Object.keys(family.children).length >= MAX_CHILDREN) return json({error:'Esta versão permite até cinco perfis por responsável.'},400);
      if (!validChildName(body.name) || typeof body.avatar !== 'string' || !avatars.some(a => a.id === body.avatar)) return json({error:'Escolha um bichinho e um apelido com até 32 caracteres.'},400);
      child = {id:crypto.randomUUID(),name:body.name.trim(),avatar:body.avatar,completed:0,positions:{},updatedAt:new Date().toISOString()};
    } else if (body.action === 'progress') {
      if (typeof body.childId !== 'string' || !Object.hasOwn(family.children,body.childId)) return json({error:'Perfil não encontrado nesta conta.'},404);
      const existing = family.children[body.childId];
      if (typeof body.avatar !== 'string' || !avatars.some(a => a.id === body.avatar) || !Number.isInteger(body.completed) || Number(body.completed) < 0 || Number(body.completed) > lessons.length || !body.positions || typeof body.positions !== 'object' || Array.isArray(body.positions)) return json({error:'Progresso inválido.'},400);
      if (body.preferences !== undefined && !validPreferences(body.preferences)) return json({error:'Preferências inválidas.'},400);
      const completed = Math.max(existing.completed,Number(body.completed));
      const positions = {...existing.positions};
      for (const [index,value] of Object.entries(body.positions)) {
        const i = Number(index);
        if (!/^\d+$/.test(index) || !Number.isInteger(i) || !lessons[i] || !Number.isInteger(value) || value < 0 || value >= lessons[i].exercises.length) return json({error:'Atividade inválida.'},400);
        positions[index] = i < completed ? 0 : Math.max(positions[index] || 0,value);
      }
      child = {...existing,avatar:body.avatar,...(validPreferences(body.preferences) ? {preferences:body.preferences} : {}),completed,positions,updatedAt:new Date().toISOString()};
    } else return json({error:'Ação inválida.'},400);
    // Send only the changed child: Clerk deep-merges metadata and preserves other profiles.
    const nextMetadata = {...user.privateMetadata,neurolearn:{...family,children:{...family.children,[child.id]:child}}};
    if (Buffer.byteLength(JSON.stringify(nextMetadata),'utf8') > 7500) return json({error:'O espaço desta conta está cheio. Não foi possível salvar.'},400);
    await client.users.updateUserMetadata(userId,{privateMetadata:{neurolearn:{version:1,children:{[child.id]:child}}}});
    return json(child);
  });
  locks.set(userId,task);
  try { return await task; } catch { logFamilyFailure('save'); return json({error:'Não foi possível salvar na conta. Tente novamente.'},503); }
  finally { if (locks.get(userId) === task) locks.delete(userId); }
}
