import { lessons, type Exercise } from './lessons';
import type { Preferences } from './preferences';

// Explicit syllables avoid splitting words such as PEIXE or CARRO by character count.
type Word = readonly [word: string, picture: string, first: string, last: string];
const banks: Record<'animals' | 'food' | 'travel', readonly (readonly Word[])[]> = {
 animals: [
  [['GATO','🐱','GA','TO'],['PATO','🦆','PA','TO'],['SAPO','🐸','SA','PO'],['VACA','🐮','VA','CA'],['FOCA','🦭','FO','CA']],
  [['LOBO','🐺','LO','BO'],['RATO','🐭','RA','TO'],['GALO','🐓','GA','LO'],['PERU','🦃','PE','RU'],['GANSO','🪿','GAN','SO']],
  [['TIGRE','🐯','TI','GRE'],['LEÃO','🦁','LE','ÃO'],['URSO','🐻','UR','SO'],['ZEBRA','🦓','ZE','BRA'],['PEIXE','🐟','PEI','XE']],
 ],
 food: [
  [['BOLO','🍰','BO','LO'],['SUCO','🧃','SU','CO'],['PERA','🍐','PE','RA'],['SOPA','🍲','SO','PA'],['COCO','🥥','CO','CO']],
  [['PIZZA','🍕','PIZ','ZA'],['PUDIM','🍮','PU','DIM'],['QUEIJO','🧀','QUEI','JO'],['KIWI','🥝','KI','WI'],['MELÃO','🍈','ME','LÃO']],
  [['OVO','🥚','O','VO'],['UVA','🍇','U','VA'],['MAÇÃ','🍎','MA','ÇÃ'],['LEITE','🥛','LEI','TE'],['MILHO','🌽','MI','LHO']],
 ],
 travel: [
  [['MOTO','🏍️','MO','TO'],['BOTE','🚣','BO','TE'],['JIPE','🚙','JI','PE'],['RODA','🛞','RO','DA'],['MALA','🧳','MA','LA']],
  [['CARRO','🚗','CAR','RO'],['BARCO','🚤','BAR','CO'],['RUA','🛣️','RU','A'],['MAPA','🗺️','MA','PA'],['PONTE','🌉','PON','TE']],
  [['CASA','🏠','CA','SA'],['LAGO','🏞️','LA','GO'],['ILHA','🏝️','I','LHA'],['PISTA','🛣️','PIS','TA'],['PRAÇA','🛝','PRA','ÇA']],
 ],
};
const themedStages = [2,3,5,6,9,10,11,13];
export function personalizedLesson(index:number, preferences:Preferences|null) {
 const base=lessons[index]; if (!preferences) return base;
 const stage=themedStages.indexOf(index);
 const themed=stage>=0 && preferences.theme!=='mixed';
 const theme=preferences.theme==='mixed'?'animals':preferences.theme;
 const bank=banks[theme][Math.max(0,stage)%banks[theme].length];
 const exercises=base.exercises.map((original,i):Exercise=>{
   let exercise={...original};
   if(themed) {
     const [word,picture,first,last]=bank[i%bank.length];
     const kind=original.kind;
     exercise={...original,id:`personal-${preferences.theme}-${index}-${i}`,word,picture,answer:word,pictureAudioId:undefined,optionAudio:undefined,
      spoken:`Vamos descobrir a palavra ${word.toLocaleLowerCase('pt-BR')}.`,
      hint:`A palavra é ${word}. Primeiro ${first}, depois ${last}.`};
     if(kind==='order') exercise={...exercise,options:[last,first],prompt:original.hideModel?'Monte o nome da imagem':`Monte a palavra ${word}`};
     if(kind==='write') exercise={...exercise,prompt:original.hideModel?'Escreva o nome da imagem':`Escreva ${word}`};
     if(kind==='choice' && index===9) exercise={...exercise,word:`${first}__`,answer:last,options:[last,first,'FA'].filter((v,k,a)=>a.indexOf(v)===k),prompt:`Qual pedacinho completa ${first}__?`};
     else if(kind==='choice') exercise={...exercise,options:[bank[(i+1)%bank.length][0],word,bank[(i+2)%bank.length][0]],prompt:'Qual palavra combina com a imagem?',hideModel:true};
   }
   // Models support word assembly/writing without revealing image-choice answers or listening transcripts.
   if(preferences.support==='model' && ['order','write'].includes(exercise.kind) && !exercise.listening && !exercise.separator && exercise.word) exercise={...exercise,hideModel:false,prompt:exercise.kind==='order'?`Monte a palavra ${exercise.word}`:`Escreva ${exercise.word}`};
   return exercise;
 });
 return {...base,exercises};
}
