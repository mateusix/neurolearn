import catalog from '@/content/narration.pt-BR.json';
export type Dialogue = {id:string;text:string};
export type DialogueContext = 'success'|'support'|'finish'|'final'|'achievement'|'choice'|'order'|'write'|'words';
const groups:Record<DialogueContext,string[]>={success:['acerto-1','acerto-2','acerto-3','acerto'],support:['apoio-1','apoio-2','apoio-3','nova-tentativa'],finish:['conclusao-1','conclusao-2','conclusao'],final:['conclusao-final'],achievement:['conquista-1'],choice:['orientacao-escolha'],order:['orientacao-montagem'],write:['orientacao-escrita'],words:['palavras-boas-vindas']};
const cursor:Partial<Record<DialogueContext,number>>={};
export function chooseDialogue(context:DialogueContext):Dialogue|null {
 const available=groups[context].map(id=>catalog.phrases.find(p=>p.id===id&&p.status==='generated')).filter(p=>!!p);
 if(!available.length)return null;
 const index=cursor[context]||0;cursor[context]=index+1;
 const phrase=available[index%available.length]!;return {id:phrase.id,text:phrase.text};
}
