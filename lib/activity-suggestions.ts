import type { Experience } from './experience-values';
export type ActivityCandidate = { index:number; title:string; description:string };
export type ActivitySuggestion = ActivityCandidate & { reason:string };
export const interestQueries = {
 animals:'Aprender palavras sobre animais, gato, pato, sapo, vaca e seus sons.',
 food:'Aprender palavras sobre comidas, frutas, banana, maçã, suco e piquenique.',
 travel:'Aprender palavras sobre passeios, carro, bicicleta, ônibus e avião.',
 mixed:'Aprender letras, sílabas, palavras, frases, histórias e jogos de memória.',
} as const;
export function activitySuggestions(candidates:ActivityCandidate[], completed:number, stats:Experience['stats'], scores?:number[]):ActivitySuggestion[] {
 const allowed=candidates.filter(c=>Number.isInteger(c.index)&&c.index>=0&&c.index<=completed);
 const result:ActivitySuggestion[]=[];
 const add=(c:ActivityCandidate|undefined,reason:string)=>{if(c&&!result.some(r=>r.index===c.index))result.push({...c,reason});};
 add(allowed.find(c=>c.index===completed),'Sua próxima descoberta');
 const reviews=allowed.filter(c=>c.index<completed);
 const needsPractice=reviews.filter(c=>{const n=stats[c.index];return n&&n[0]>=2&&n[1]/n[0]<.8;}).sort((a,b)=>stats[a.index][1]/stats[a.index][0]-stats[b.index][1]/stats[b.index][0]||a.index-b.index);
 add(needsPractice[0],'Uma oportunidade de praticar com calma');
 const ranked=[...reviews].sort((a,b)=>{
  if(scores?.length===candidates.length){const x=scores[candidates.indexOf(a)],y=scores[candidates.indexOf(b)];if(Number.isFinite(x)&&Number.isFinite(y))return y-x||b.index-a.index;}
  return b.index-a.index;
 });
 for(const c of ranked){if(result.length===3)break;add(c,scores?'Combina com o tema escolhido':'Uma descoberta para revisitar');}
 return result;
}
