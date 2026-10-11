import { lessons, type Exercise } from './lessons';
import type { Preferences } from './preferences';
const banks = {
 animals:[['GATO','🐱'],['PATO','🦆'],['SAPO','🐸'],['VACA','🐮']],
 food:[['BOLO','🍰'],['SUCO','🧃'],['PERA','🍐'],['SOPA','🍲']],
 travel:[['MOTO','🏍️'],['BOTE','🚣'],['JIPE','🚙'],['RODA','🛞']],
};
export function personalizedLesson(index:number, preferences:Preferences|null) {
 const base=lessons[index]; if (!preferences) return base;
 const themed=[2,3,5,6,9,10,11,13].includes(index) && preferences.theme!=='mixed';
 const bank=preferences.theme==='mixed'?banks.animals:banks[preferences.theme];
 const exercises=base.exercises.map((original,i):Exercise=>{
   let exercise={...original};
   if(themed) {
     const [word,picture]=bank[i%bank.length]; const first=word.slice(0,2),last=word.slice(2);
     const kind=original.kind;
     exercise={...original,id:`personal-${preferences.theme}-${index}-${i}`,word,picture,answer:word,pictureAudioId:undefined,optionAudio:undefined,
      spoken:`Vamos descobrir a palavra ${word.toLocaleLowerCase('pt-BR')}.`,
      hint:`A palavra é ${word}. Primeiro ${first}, depois ${last}.`};
     if(kind==='order') exercise={...exercise,options:[last,first],prompt:original.hideModel?'Monte o nome da imagem':`Monte a palavra ${word}`};
     if(kind==='write') exercise={...exercise,prompt:original.hideModel?'Escreva o nome da imagem':`Escreva ${word}`};
     if(kind==='choice' && index===9) exercise={...exercise,word:`${first}__`,answer:last,options:[last,first,'FA'].filter((v,k,a)=>a.indexOf(v)===k),prompt:`Qual pedacinho completa ${first}__?`};
     else if(kind==='choice') exercise={...exercise,options:[bank[(i+1)%4][0],word,bank[(i+2)%4][0]],prompt:'Qual palavra combina com a imagem?',hideModel:true};
   }
   // Models support word assembly/writing without revealing image-choice answers or listening transcripts.
   if(preferences.support==='model' && ['order','write'].includes(exercise.kind) && !exercise.listening && !exercise.separator && exercise.word) exercise={...exercise,hideModel:false,prompt:exercise.kind==='order'?`Monte a palavra ${exercise.word}`:`Escreva ${exercise.word}`};
   return exercise;
 });
 return {...base,exercises};
}
