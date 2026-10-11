// This checks recognized text, not pronunciation or language development.
export function normalizeSpeech(text:string) {
 return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
}
const variants:Record<string,string[]>={bola:['boa','bola'],gato:['gatu','gato'],pato:['patu','pato'],banana:['banana','ban ana']};
export function matchesSpeech(target:string,transcripts:string[]) {
 const expected=normalizeSpeech(target);
 return transcripts.some(text=>{
  const actual=normalizeSpeech(text);
  if(actual===expected)return true;
  const words=expected.split(' '),heard=actual.split(' ');
  // No unrestricted fuzzy matching: BOLA/BOTA and GATO/PATO must stay distinct.
  if(words.length!==heard.length)return words.length===1&&(variants[expected]||[]).includes(actual);
  return words.every((word,i)=>word===heard[i]||(variants[word]||[]).includes(heard[i]));
 });
}
