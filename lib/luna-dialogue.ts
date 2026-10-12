import catalog from '@/content/narration.pt-BR.json';
export type Dialogue = {id:string;text:string};
export type DialogueContext = 'success'|'support'|'finish'|'final'|'achievement'|'choice'|'order'|'write'|'words';
const groups:Record<DialogueContext,string[]>={success:['acerto-1','acerto-2','acerto-3','acerto'],support:['apoio-1','apoio-2','apoio-3','nova-tentativa'],finish:['conclusao-1','conclusao-2','conclusao'],final:['conclusao-final'],achievement:['conquista-1'],choice:['orientacao-escolha'],order:['orientacao-montagem'],write:['orientacao-escrita'],words:['palavras-boas-vindas']};
const extra:Partial<Record<DialogueContext,string[]>>={
 success:['Você observou com atenção. Mais uma descoberta!','As palavras estão ganhando sentido. Vamos no seu ritmo!','Que bom ver você tentando! Você encontrou a resposta.','Um passo de cada vez. Hoje você descobriu algo novo!'],
 support:['Você pode reler a pergunta. Eu continuo aqui com você.','Vamos olhar uma parte de cada vez? A dica pode ajudar.','Tudo bem tentar de novo. Você pode mudar sua resposta.'],
 finish:['Você descobriu mais um pedacinho desta aventura! Quer descansar ou continuar?','Uma etapa concluída. Seu esforço faz parte da aprendizagem. Vamos com calma!'],
};
const cursor:Partial<Record<DialogueContext,number>>={};
export function chooseDialogue(context:DialogueContext):Dialogue|null {
 const recorded=groups[context].map(id=>catalog.phrases.find(p=>p.id===id&&p.status==='generated')).filter(p=>!!p);
 const available=[...recorded,...(extra[context]||[]).map((text,i)=>({id:`luna-${context}-${i}`,text}))];
 if(!available.length)return null;
 const index=cursor[context]||0;cursor[context]=index+1;
 const phrase=available[index%available.length]!;return {id:phrase.id,text:phrase.text};
}
