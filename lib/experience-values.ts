export const accessories = [
  {id:'none',name:'Sem acessório',icon:'○',at:0},
  {id:'hat',name:'Chapéu',icon:'🎩',at:4},
  {id:'cap',name:'Boné',icon:'🧢',at:6},
  {id:'glasses',name:'Óculos',icon:'👓',at:8},
  {id:'flower',name:'Flor',icon:'🌸',at:10},
  {id:'bow',name:'Laço',icon:'🎀',at:12},
  {id:'crown',name:'Coroa',icon:'👑',at:16},
  {id:'scarf',name:'Cachecol',icon:'🧣',at:20},
] as const;
export type Experience = {favorites:number[];accessory:string;fontSize:'small'|'standard'|'large';stats:Record<string,[number,number]>};
export const emptyExperience = ():Experience => ({favorites:[],accessory:'none',fontSize:'standard',stats:{}});
export function validExperience(value:unknown,stageCount:number):value is Experience {
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const v=value as Experience;
  return Array.isArray(v.favorites)&&v.favorites.length<=stageCount&&new Set(v.favorites).size===v.favorites.length&&v.favorites.every(i=>Number.isInteger(i)&&i>=0&&i<stageCount)&&accessories.some(a=>a.id===v.accessory)&&['small','standard','large'].includes(v.fontSize)&&!!v.stats&&typeof v.stats==='object'&&!Array.isArray(v.stats)&&Object.keys(v.stats).length<=stageCount&&Object.entries(v.stats).every(([i,n])=>/^\d+$/.test(i)&&String(Number(i))===i&&Number(i)<stageCount&&Array.isArray(n)&&n.length===2&&n.every(x=>Number.isInteger(x)&&x>=0&&x<=9999)&&n[1]<=n[0]);
}
export function cleanExperience(value:Experience):Experience {
 return {favorites:[...value.favorites],accessory:value.accessory,fontSize:value.fontSize,stats:Object.fromEntries(Object.entries(value.stats).map(([id,n])=>[id,[n[0],n[1]]]))};
}
export function mergeExperience(server:Experience,local:Experience):Experience {
 const stats={...server.stats};
 for(const [i,n]of Object.entries(local.stats)){const old=stats[i]||[0,0];stats[i]=[Math.max(old[0],n[0]),Math.max(old[1],n[1])];}
 return {...cleanExperience(local),stats};
}
