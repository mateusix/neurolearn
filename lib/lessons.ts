import { currentChild, isAccountMode, updateChild } from "./family-store";
export type Exercise = {
  id: string;
  kind: "choice" | "order" | "write" | "speak";
  prompt: string;
  spoken: string;
  answer: string;
  options?: string[];
  picture?: string;
  word?: string;
  hint: string;
  hideModel?: boolean;
  separator?: string;
  listening?: boolean;
  optionAudio?: Record<string, string>;
  pictureAudioId?: string;
};
export const lessons: { title: string; exercises: Exercise[] }[] = [
  { title: "Conhecer as vogais", exercises: [
    { id: "vogal-a", kind: "choice", prompt: "Encontre a vogal A", spoken: "Encontre a vogal A. Olhe as opções e toque na letra A.", answer: "A", options: ["E", "A", "U"], hint: "A letra A tem duas linhas inclinadas e um tracinho no meio." },
    { id: "vogal-e", kind: "choice", prompt: "Encontre a vogal E", spoken: "Agora encontre a vogal E.", answer: "E", options: ["O", "I", "E"], hint: "A letra E tem uma linha em pé e três tracinhos para o lado." },
    { id: "vogal-i", kind: "choice", prompt: "Encontre a vogal I", spoken: "Encontre a vogal I.", answer: "I", options: ["I", "U", "A"], hint: "Procure a letra I, com sua linha em pé." },
    { id: "vogal-o", kind: "choice", prompt: "Encontre a vogal O", spoken: "Encontre a vogal O.", answer: "O", options: ["E", "O", "A"], hint: "A letra O é redondinha, como um círculo." },
    { id: "vogal-u", kind: "choice", prompt: "Encontre a vogal U", spoken: "Encontre a vogal U.", answer: "U", options: ["U", "I", "E"], hint: "A letra U é aberta em cima e tem uma curva embaixo." },
  ] },
  { title: "Letras e sons", exercises: [
    { id: "inicio-abelha", kind: "choice", prompt: "Com qual letra começa ABELHA?", spoken: "Abelha. Com qual letra começa a palavra abelha?", word: "ABELHA", picture: "🐝", answer: "A", options: ["E", "A", "O"], hint: "ABELHA começa com A. Olhe a primeira letra da palavra." },
    { id: "inicio-estrela", kind: "choice", prompt: "Com qual letra começa ESTRELA?", spoken: "Estrela. Com qual letra começa a palavra estrela?", word: "ESTRELA", picture: "⭐", answer: "E", options: ["I", "U", "E"], hint: "ESTRELA começa com E. Olhe a primeira letra da palavra." },
    { id: "inicio-uva", kind: "choice", prompt: "Com qual letra começa UVA?", spoken: "Uva. Com qual letra começa a palavra uva?", word: "UVA", picture: "🍇", answer: "U", options: ["U", "O", "A"], hint: "UVA começa com U. Olhe a primeira letra da palavra." },
  ] },
  { title: "Juntar sílabas", exercises: [
    { id: "montar-bola", kind: "order", prompt: "Monte a palavra BOLA", spoken: "Vamos montar a palavra bola. Toque nos pedacinhos na ordem da palavra.", word: "BOLA", picture: "⚽", answer: "BOLA", options: ["LA", "BO"], hint: "BOLA começa com BO. Depois vem LA." },
    { id: "montar-pato", kind: "order", prompt: "Monte a palavra PATO", spoken: "Vamos montar a palavra pato.", word: "PATO", picture: "🦆", answer: "PATO", options: ["TO", "PA"], hint: "PATO começa com PA. Depois vem TO." },
    { id: "montar-gato", kind: "order", prompt: "Monte a palavra GATO", spoken: "Vamos montar a palavra gato.", word: "GATO", picture: "🐱", answer: "GATO", options: ["TO", "GA"], hint: "GATO começa com GA. Depois vem TO." },
  ] },
  { title: "Minhas primeiras palavras", exercises: [
    { id: "escrever-bola", kind: "write", prompt: "Escreva BOLA", spoken: "Vamos escrever a palavra bola. Você pode olhar o modelo e digitar as letras.", word: "BOLA", picture: "⚽", answer: "BOLA", hint: "Você pode copiar o modelo: B, O, L, A." },
    { id: "escrever-gato", kind: "write", prompt: "Escreva GATO", spoken: "Agora vamos escrever a palavra gato.", word: "GATO", picture: "🐱", answer: "GATO", hint: "Você pode copiar o modelo: G, A, T, O." },
    { id: "escrever-uva", kind: "write", prompt: "Escreva UVA", spoken: "Vamos escrever a palavra uva.", word: "UVA", picture: "🍇", answer: "UVA", hint: "Você pode copiar o modelo: U, V, A." },
  ] },
];
// Extra practice stays in short sessions and preserves the original stage order.
const initialWords = [
  ["ILHA", "🏝️", "I"], ["OVO", "🥚", "O"], ["BOLA", "⚽", "B"], ["PATO", "🦆", "P"], ["GATO", "🐱", "G"],
];
lessons.push({ title: "Descobrir letras iniciais", exercises: initialWords.map(([word, picture, answer], i) => ({
  id: `inicial-extra-${i}`, kind: "choice", prompt: `Com qual letra começa ${word}?`, spoken: `Com qual letra começa a palavra ${word.toLowerCase()}?`,
  word, picture, answer, options: [answer, answer === "A" ? "E" : "A", answer === "O" ? "U" : "O"].sort((a,b) => a.localeCompare(b)),
  hint: `${word} começa com ${answer}. Observe a primeira letra do modelo.`,
})) });
const moreWords = [
  ["MALA", "🧳", "MA", "LA"], ["VACA", "🐮", "VA", "CA"], ["SAPO", "🐸", "SA", "PO"], ["BOTA", "🥾", "BO", "TA"], ["FADA", "🧚", "FA", "DA"],
];
lessons.push({ title: "Mais palavras com sílabas", exercises: moreWords.map(([word,picture,first,last],i) => ({
  id:`silaba-extra-${i}`, kind:"order", prompt:`Monte a palavra ${word}`, spoken:`Vamos montar a palavra ${word.toLowerCase()}.`,
  word,picture,answer:word,options:[last,first],hint:`${word} começa com ${first}. Depois vem ${last}.`,
})) });
lessons.push({ title: "Escrever novas palavras", exercises: moreWords.slice(0,4).map(([word,picture],i) => ({
  id:`escrita-extra-${i}`,kind:"write",prompt:`Escreva ${word}`,spoken:`Escreva a palavra ${word.toLowerCase()}. Você pode olhar o modelo.`,
  word,picture,answer:word,hint:`Você pode copiar as letras: ${word.split("").join(", ")}.`,
})) });
lessons.push({ title: "Revisar minhas descobertas", exercises: [
  {id:"revisao-vogal",kind:"choice",prompt:"Encontre a vogal O",spoken:"Encontre a vogal O.",answer:"O",options:["A","U","O"],hint:"O é a vogal redondinha."},
  {id:"revisao-bola",kind:"order",prompt:"Monte a palavra BOLA",spoken:"Monte a palavra bola.",word:"BOLA",picture:"⚽",answer:"BOLA",options:["LA","BO"],hint:"Primeiro BO. Depois LA."},
  {id:"revisao-pato",kind:"write",prompt:"Escreva PATO",spoken:"Escreva a palavra pato.",word:"PATO",picture:"🦆",answer:"PATO",hint:"Observe o modelo: P, A, T, O."},
] });
// Gradual transfer: matching forms, completing words, reading, then short sentences.
lessons.push({ title: "Vogais de outro jeito", exercises: ["A","E","I","O","U"].map((answer,i) => ({
  id:`minuscula-${answer.toLowerCase()}`,kind:"choice",prompt:`Qual letra pequena combina com ${answer}?`,spoken:`Qual letra minúscula corresponde à letra ${answer}?`,answer,
  options: [["a","e","o"],["i","u","e"],["i","a","u"],["e","o","a"],["u","i","e"]][i],hint:`${answer} e ${answer.toLowerCase()} são duas formas da mesma letra.`,
})) });
lessons.push({ title: "Complete os pedacinhos", exercises: [
  ["BOLA","⚽","BO","LA","BO__"],["PATO","🦆","PA","TO","PA__"],["GATO","🐱","GA","TO","GA__"],["MALA","🧳","MA","LA","MA__"],
].map(([word,picture,first,answer,model],i) => ({
  id:`completar-${i}`,kind:"choice",prompt:`Qual pedacinho completa ${model}?`,spoken:`Qual sílaba completa a palavra ${word.toLowerCase()}?`,word:model,picture,answer,
  options: [answer,first,"VA"],hint:`A palavra é ${word}: ${first} + ${answer}.`,
})) });
lessons.push({ title: "Ler e encontrar", exercises: [
  ["BOLA","⚽",["BOTA","BOLA","MALA"]],["PATO","🦆",["GATO","SAPO","PATO"]],["GATO","🐱",["GATO","PATO","VACA"]],["SAPO","🐸",["MALA","SAPO","GATO"]],
].map(([word,picture,options],i) => ({
  id:`ler-imagem-${i}`,kind:"choice",prompt:"Qual palavra combina com a imagem?",spoken:"Observe a imagem e escolha a palavra que combina com ela.",word:word as string,picture:picture as string,answer:word as string,options:options as string[],hideModel:true,
  hint:`Observe as letras de ${word}. Essa é a palavra da imagem.`,
})) });
lessons.push({ title: "Montar com menos apoio", exercises: [
  ["BOLA","⚽","BO","LA"],["PATO","🦆","PA","TO"],["GATO","🐱","GA","TO"],["SAPO","🐸","SA","PO"],
].map(([word,picture,first,last],i) => ({
  id:`montar-sem-modelo-${i}`,kind:"order",prompt:"Monte o nome da imagem",spoken:"Monte o nome da imagem usando as sílabas.",word,picture,answer:word,hideModel:true,options:[last,first],hint:`A palavra é ${word}. Primeiro ${first}, depois ${last}.`,
})) });
lessons.push({ title: "Palavras com três sílabas", exercises: [
  ["BANANA","🍌",["BA","NA","NA"]],["TOMATE","🍅",["TO","MA","TE"]],["PANELA","🍲",["PA","NE","LA"]],["CAVALO","🐴",["CA","VA","LO"]],
].map(([word,picture,parts],i) => ({
  id:`tres-silabas-${i}`,kind:"order",prompt:`Monte a palavra ${word}`,spoken:`Monte a palavra ${word}. Agora são três sílabas.`,word:word as string,picture:picture as string,answer:word as string,
  options:[...(parts as string[])].reverse(),hint:`Siga esta ordem: ${(parts as string[]).join(" → ")}.`,
})) });
lessons.push({ title: "Escrever com uma dica", exercises: [
  ["BOLA","⚽"],["PATO","🦆"],["GATO","🐱"],["MALA","🧳"],
].map(([word,picture],i) => ({
  id:`escrita-sem-modelo-${i}`,kind:"write",prompt:"Escreva o nome da imagem",spoken:"Escreva o nome da imagem. Você pode abrir uma dica se precisar.",word,picture,answer:word,hideModel:true,
  hint:`A palavra é ${word}. Você pode usar este modelo para escrever.`,
})) });
lessons.push({ title: "Minhas primeiras frases", exercises: [
  ["O GATO MIA", "🐱", ["O","GATO","MIA"]], ["O PATO NADA", "🦆", ["O","PATO","NADA"]],
  ["A BOLA ROLA", "⚽", ["A","BOLA","ROLA"]], ["A VACA MUGE", "🐮", ["A","VACA","MUGE"]],
].map(([word,picture,parts],i) => ({
  id:`frase-${i}`,kind:"order",prompt:"Monte a frase seguindo o modelo",spoken:`Monte a frase: ${word}.`,word:word as string,picture:picture as string,answer:word as string,separator:" ",
  options:[...(parts as string[])].reverse(),hint:`A ordem é: ${(parts as string[]).join(" → ")}.`,
})) });
lessons.push({ title: "Ler pequenas histórias", exercises: [
  {id:"ler-frase-gato",kind:"choice",prompt:"Quem mia?",spoken:"Leia: o gato mia. Quem mia?",word:"O GATO MIA.",answer:"GATO",options:["PATO","GATO","VACA"],hint:"A frase diz: o GATO mia."},
  {id:"ler-frase-pato",kind:"choice",prompt:"O que o pato faz?",spoken:"Leia: o pato nada. O que o pato faz?",word:"O PATO NADA.",answer:"NADA",options:["MIA","ROLA","NADA"],hint:"A frase diz que o pato NADA."},
  {id:"ler-frase-bola",kind:"choice",prompt:"O que rola?",spoken:"Leia: a bola rola. O que rola?",word:"A BOLA ROLA.",answer:"BOLA",options:["BOLA","GATO","MALA"],hint:"A frase diz: a BOLA rola."},
  {id:"ler-frase-vaca",kind:"choice",prompt:"Quem muge?",spoken:"Leia: a vaca muge. Quem muge?",word:"A VACA MUGE.",answer:"VACA",options:["GATO","VACA","PATO"],hint:"A frase diz: a VACA muge."},
] });
lessons.push({title:"Ouvir e montar",exercises:[
  {id:"ouvir-gato",kind:"order",prompt:"Ouça e monte a frase",spoken:"O gato mia.",answer:"O GATO MIA",word:"O GATO MIA",options:["MIA","O","GATO"],separator:" ",hideModel:true,listening:true,hint:"Você pode ouvir de novo ou tocar em Ver a frase para consultar um modelo."},
  {id:"ouvir-pato",kind:"order",prompt:"Ouça e monte a frase",spoken:"O pato nada.",answer:"O PATO NADA",word:"O PATO NADA",options:["PATO","NADA","O"],separator:" ",hideModel:true,listening:true,hint:"Ouça com calma. Use Ver a frase se quiser uma ajuda."},
  {id:"ouvir-bola",kind:"order",prompt:"Ouça e monte a frase",spoken:"A bola rola.",answer:"A BOLA ROLA",word:"A BOLA ROLA",options:["ROLA","BOLA","A"],separator:" ",hideModel:true,listening:true,hint:"Vamos tentar outra vez? Você pode ouvir novamente e consultar a frase."},
]});
const animalAudio: Record<string,string> = {"MIAU":"som-miau","AU AU":"som-au-au","MUU":"som-muu"};
lessons.push({title:"Os sons dos animais",exercises:[
  {id:"animal-gato",kind:"choice",prompt:"Que som o gato faz?",spoken:"Que som o gato faz?",word:"GATO",picture:"🐱",answer:"MIAU",options:["MUU","MIAU","AU AU"],optionAudio:animalAudio,pictureAudioId:"palavra-gato",hint:"O gato mia: MIAU. Você pode pensar com calma e tentar novamente."},
  {id:"animal-cachorro",kind:"choice",prompt:"Que som o cachorro faz?",spoken:"Que som o cachorro faz?",word:"CACHORRO",picture:"🐶",answer:"AU AU",options:["AU AU","MUU","MIAU"],optionAudio:animalAudio,hint:"O cachorro late: AU AU."},
  {id:"animal-vaca",kind:"choice",prompt:"Que som a vaca faz?",spoken:"Que som a vaca faz?",word:"VACA",picture:"🐮",answer:"MUU",options:["MIAU","AU AU","MUU"],optionAudio:animalAudio,hint:"A vaca muge: MUU."},
]});
const themedWords = [
  {title:"Frutas do meu dia", words:[["UVA","🍇"],["BANANA","🍌"],["MAÇÃ","🍎"],["PERA","🍐"]]},
  {title:"Na minha mochila", words:[["LÁPIS","✏️"],["LIVRO","📚"],["TESOURA","✂️"],["MOCHILA","🎒"]]},
  {title:"Vamos passear", words:[["CARRO","🚗"],["BICICLETA","🚲"],["ÔNIBUS","🚌"],["AVIÃO","✈️"]]},
];
for (const [themeIndex, theme] of themedWords.entries()) {
  lessons.push({title:theme.title,exercises:theme.words.map(([word,picture],i) => ({
    id:`tema-${themeIndex}-${i}`,kind:"choice",prompt:"Qual palavra combina com a imagem?",spoken:"Observe a imagem e escolha a palavra correspondente.",
    word,picture,hideModel:true,answer:word,options:[theme.words[(i+1)%4][0],word,theme.words[(i+2)%4][0]],
    hint:`A imagem mostra ${word}. Observe as letras desta palavra.`,
  }))});
}
// Recordings are reused across activities; no generation occurs while a child plays.
for (const lesson of lessons) for (const exercise of lesson.exercises) {
  if (exercise.picture === "🐱" && !exercise.listening) exercise.pictureAudioId = "palavra-gato";
  if (exercise.kind === "choice" && exercise.options?.includes("GATO")) exercise.optionAudio = {...exercise.optionAudio,GATO:"palavra-gato"};
}
export const learningBlocks = [
  { title:"Primeiras descobertas", detail:"Vogais, letras e palavras com modelos para consultar." },
  { title:"Praticar e reconhecer", detail:"Mais palavras conhecidas e pequenas revisões." },
  { title:"Experimentar com mais autonomia", detail:"Ler e montar com menos apoio; as dicas continuam disponíveis." },
  { title:"Das palavras às frases", detail:"Três sílabas, escrita e leitura de frases curtas." },
  { title:"Escutar e descobrir", detail:"Frases, sons dos animais e palavras do dia a dia." },
  { title:"Explorar novos lugares", detail:"Transportes e descobertas do nosso cotidiano." },
];
export function assembleAnswer(exercise: Exercise, pieces: number[]) {
  return pieces.map(i => exercise.options?.[i] ?? "").join(exercise.separator ?? "");
}
export function isAnswerReady(exercise: Exercise, choice: string, pieces: number[]) {
  return exercise.kind === "order" ? pieces.length > 0 : exercise.kind === "choice" ? !!exercise.options?.includes(choice) : normalizeAnswer(choice).length > 0;
}
const resumeKey = "neurolearn-resume-v1";
const sessionPositions: Record<string, number> = {};
export function readLessonPosition(index: number) {
  if (isAccountMode()) return currentChild()?.positions[String(index)] || 0;
  const lesson = lessons[index];
  if (!lesson) return 0;
  try {
    const positions = JSON.parse(localStorage.getItem(resumeKey) || "{}");
    const value = positions?.[lesson.title];
    return Number.isInteger(value) && value >= 0 && value < lesson.exercises.length ? value : 0;
  } catch { return sessionPositions[lesson.title] ?? 0; }
}
export function saveLessonPosition(index: number, position: number) {
  const lesson = lessons[index];
  if (!lesson || !Number.isInteger(position) || position < 0 || position >= lesson.exercises.length) return false;
  if (isAccountMode()) { const child = currentChild(); return child ? updateChild({positions:{...child.positions,[index]:position}}) : false; }
  sessionPositions[lesson.title] = position;
  try {
    let positions: Record<string,number> = {};
    try { const stored = JSON.parse(localStorage.getItem(resumeKey) || "{}"); if (stored && typeof stored === "object" && !Array.isArray(stored)) positions = stored; } catch {}
    localStorage.setItem(resumeKey, JSON.stringify({...positions,[lesson.title]:position}));
    return true;
  } catch { return false; }
}
export const progressKey = "neurolearn-progress-v1";
export function normalizeAnswer(value: string) { return value.trim().toLocaleUpperCase("pt-BR").normalize("NFC"); }
export function readProgress(): number {
  try { const value = JSON.parse(localStorage.getItem(progressKey) || "0"); return Number.isInteger(value) && value >= 0 && value <= 23 ? Math.min(value, lessons.length) : 0; } catch { return 0; }
}
let sessionProgress = 0;
export function getProgress() { return isAccountMode() ? Math.min(currentChild()?.completed || 0, lessons.length) : Math.min(lessons.length, Math.max(sessionProgress, readProgress())); }
export function saveProgress(completed: number) {
  if (!Number.isInteger(completed) || completed < 0 || completed > lessons.length) return false;
  if (isAccountMode()) return updateChild({completed:Math.max(getProgress(),completed)});
  sessionProgress = Math.max(getProgress(), completed);
  let saved = true;
  try { localStorage.setItem(progressKey, JSON.stringify(sessionProgress)); } catch { saved = false; }
  window.dispatchEvent(new Event("neurolearn-progress"));
  return saved;
}
export function subscribeProgress(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("neurolearn-progress", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("neurolearn-progress", listener); };
}
