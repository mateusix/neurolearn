import texts from '@/content/exercise-guidance.pt-BR.json';
import type { Exercise } from './lessons';
export function exerciseGuidance(exercise:Exercise):{id:string;text:string}|null {
 let id:keyof typeof texts;
 if(exercise.kind==='speak')return null;
 if(exercise.kind==='memory')id='guia-memoria';
 else if(exercise.passage)id='guia-historia';
 else if(exercise.id.startsWith('combinar-imagem-'))id='guia-combinar-imagens';
 else if(exercise.listening)id='guia-ouvir-frase';
 else if(exercise.id==='ler-frase-gato')id='guia-frase-gato';
 else if(exercise.id==='ler-frase-pato')id='guia-frase-pato';
 else if(exercise.id==='ler-frase-bola')id='guia-frase-bola';
 else if(exercise.id==='ler-frase-vaca')id='guia-frase-vaca';
 else if(exercise.kind==='order')id=exercise.separator?'guia-montar-frase':exercise.hideModel?'guia-montar-imagem':'guia-montar-modelo';
 else if(exercise.kind==='write')id=exercise.hideModel?'guia-escrever-imagem':'guia-escrever-modelo';
 else if(exercise.id.startsWith('animal-'))id='guia-sons-animais';
 else if(exercise.id.startsWith('minuscula-'))id='guia-minusculas';
 else if(exercise.prompt.startsWith('Qual pedacinho completa'))id='guia-completar-silaba';
 else if(exercise.prompt.startsWith('Com qual letra'))id='guia-letra-inicial';
 else if(exercise.picture)id='guia-imagem-palavra';
 else id='guia-vogais';
 return {id,text:texts[id]};
}
