const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const data = new Map();
const context = {require:name=>{if(name==="./family-store")return {isAccountMode:()=>false,currentChild:()=>undefined,updateChild:()=>false};throw new Error(name);},exports:{},localStorage:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)},window:{dispatchEvent(){},addEventListener(){},removeEventListener(){}},Event};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/lessons.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);
const api=context.exports;
assert.equal(api.lessons.length,21);
assert.equal(api.lessons.reduce((total,lesson)=>total+lesson.exercises.length,0),82);
const ids=api.lessons.flatMap(lesson=>lesson.exercises.map(ex=>ex.id));
assert.equal(new Set(ids).size,ids.length);
for(const lesson of api.lessons) for(const ex of lesson.exercises) {
 assert.equal(api.isAnswerReady(ex,'',[]),false);
 assert.equal(api.isAnswerReady(ex,'   ',[]),false);
 if(ex.kind==='choice') {assert.equal(api.isAnswerReady(ex,ex.options[0],[]),true);assert.ok(ex.options.some(option=>api.normalizeAnswer(option)===ex.answer));}
 if(ex.kind==='write') {assert.equal(api.isAnswerReady(ex,'X',[]),true);assert.equal(api.normalizeAnswer(' '+ex.answer.toLowerCase()+' '),ex.answer);}
 if(ex.kind==='order') {assert.equal(api.isAnswerReady(ex,'',[0]),true);assert.ok(ex.options.length>1);const ordered = [...ex.options.keys()].reverse(); if(ex.id.startsWith('tres-silabas') || ex.id.startsWith('frase-')) assert.equal(api.assembleAnswer(ex,ordered),ex.answer); else if(ex.listening) assert.equal([...ex.options].sort().join(' '),ex.answer.split(' ').sort().join(' ')); else assert.equal([...ex.options].sort().join(''),ex.answer.match(/.{1,2}/g).sort().join(''));}
}
assert.equal(api.assembleAnswer(api.lessons[14].exercises[0],[2,1,0]),'O GATO MIA');
assert.equal(api.assembleAnswer(api.lessons[12].exercises[0],[2,1,0]),'BANANA');
data.set(api.progressKey,'8'); assert.equal(api.readProgress(),8);
assert.equal(api.learningBlocks.length,6);
assert.equal(api.saveProgress(NaN),false);
assert.equal(api.saveProgress(99),false);
data.set(api.progressKey,'2');assert.equal(api.getProgress(),2);api.saveProgress(1);assert.equal(api.getProgress(),2);
api.saveProgress(3);assert.equal(api.getProgress(),3);
assert.equal(api.saveLessonPosition(2,1),true);assert.equal(api.readLessonPosition(2),1);
assert.equal(api.saveLessonPosition(2,99),false);assert.equal(api.readLessonPosition(2),1);
data.set('neurolearn-resume-v1','broken');assert.equal(api.readLessonPosition(2),1);
console.log('QA: 21 etapas, 82 exercícios, validação de resposta, retomada e progresso verificados.');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const guidanceContext={exports:{},require:name=>name==='@/content/exercise-guidance.pt-BR.json'?{default:JSON.parse(fs.readFileSync('content/exercise-guidance.pt-BR.json','utf8'))}:require(name)};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/exercise-guidance.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,guidanceContext);
const lessonModule = {exports:{}, require(name) {
 if(name==='@/lib/lessons') return api;
 if(name==='@/lib/exercise-guidance') return guidanceContext.exports;
 if(name==='@/lib/luna-dialogue') return {chooseDialogue:()=>null};
 if(name==='@/lib/comfort') return {requestSound(){}};
 if(name==='@/lib/personalized-lessons') return {personalizedLesson:index=>api.lessons[index]};
 if(name==='@/lib/achievements') return {achievements:[]};
 if(name==='@/lib/use-narration') return {useNarration:()=>({speak(){},stop(){},message:'',hasAudio:()=>true})};
 if(name==='./mini-tutorial') return {default:({children})=>children,tutorialKind:exercise=>exercise.listening?'listening':exercise.kind};
 if(name==='./speaking-exercise') return {default:()=>null};
 if(name==='./lesson.module.css') return {default:new Proxy({}, {get:(_,key)=>String(key)})};
 if(name==='next/image') return {default:({src,alt})=>React.createElement('img',{src,alt})};
 return require(name);
}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/(marketing)/lesson.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,lessonModule);
for(let position=0;position<3;position++) {
 data.set('neurolearn-resume-v1',JSON.stringify({'Ouvir e montar':position}));
 const html = renderToStaticMarkup(React.createElement(lessonModule.exports.default,{index:16,onBack(){},onComplete(){}}));
 assert.ok(html.includes('Ouvir a frase'));
 assert.ok(html.includes('Ver a frase'));
 assert.ok(!html.includes(api.lessons[16].exercises[position].answer));
 assert.ok(/disabled=""[^>]*>Confirmar/.test(html));
}
console.log('QA de escuta: modelo escondido, apoio em texto e confirmação vazia verificados nos três exercícios.');
assert.equal(api.lessons[17].exercises[0].answer,'MIAU');
assert.equal(api.lessons[17].exercises[1].answer,'AU AU');
assert.equal(api.lessons[17].exercises[2].answer,'MUU');
for(let index=17;index<21;index++) {
 data.set('neurolearn-resume-v1','{}');
 const html=renderToStaticMarkup(React.createElement(lessonModule.exports.default,{index,onBack(){},onComplete(){}}));
 assert.ok(html.includes('Confirmar'));
 assert.ok(!html.includes('undefined'));
 if(index===17) {assert.ok(html.includes('Nina imita'));assert.ok(html.includes('Ouvir gato'));}
}
console.log('QA de temas: respostas dos animais, associação de palavras e controles sonoros verificados.');
// Speaking feedback must reveal the next exercise without a second confirmation.
let speechStates=[],speechCursor=0;
const interactive={exports:{},require(name){if(name==='react')return {...React,useState(initial){const i=speechCursor++;if(!(i in speechStates))speechStates[i]=typeof initial==='function'?initial():initial;return [speechStates[i],value=>speechStates[i]=typeof value==='function'?value(speechStates[i]):value];},useRef(initial){const i=speechCursor++;if(!(i in speechStates))speechStates[i]={current:initial};return speechStates[i];},useEffect(){},useMemo(fn){return fn();}};return lessonModule.require(name);},requestAnimationFrame:callback=>callback()};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/(marketing)/lesson.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,interactive);
function findVoiceNode(node,predicate){if(!node)return;if(Array.isArray(node)){for(const item of node){const found=findVoiceNode(item,predicate);if(found)return found;}return;}if(typeof node!=='object')return;if(predicate(node))return node;return findVoiceNode(node.props?.children,predicate);}
// Identical syllables remain separate selectable pieces, and selected pieces toggle off.
speechStates=[];data.set('neurolearn-resume-v1','{}');
function orderRender(){speechCursor=0;return interactive.exports.default({index:12,onBack(){},onComplete(){}});}
const bankButton=(tree,i)=>findVoiceNode(tree,n=>n.type==='button'&&n.props['aria-label']===`${api.lessons[12].exercises[0].options[i]}, opção ${i+1}`);
const confirmButton=tree=>findVoiceNode(tree,n=>n.type==='button'&&n.props.children==='Confirmar');
let orderTree=orderRender();assert.equal(confirmButton(orderTree).props.disabled,true);
for(const i of [2,0,1]){bankButton(orderTree,i).props.onClick();orderTree=orderRender();assert.equal(bankButton(orderTree,i).props['aria-pressed'],true);assert.equal(bankButton(orderTree,i).props.disabled,false);}
assert.equal(confirmButton(orderTree).props.disabled,false);
bankButton(orderTree,0).props.onClick();orderTree=orderRender();assert.equal(bankButton(orderTree,0).props['aria-pressed'],false);assert.equal(bankButton(orderTree,1).props['aria-pressed'],true);
findVoiceNode(orderTree,n=>n.type==='button'&&n.props['aria-label']==='Retirar NA, posição 2').props.onClick();orderTree=orderRender();assert.equal(bankButton(orderTree,1).props['aria-pressed'],false);
bankButton(orderTree,2).props.onClick();orderTree=orderRender();assert.equal(confirmButton(orderTree).props.disabled,true);
for(const i of [2,1,0]){bankButton(orderTree,i).props.onClick();orderTree=orderRender();}
assert.equal(findVoiceNode(orderTree,n=>n.props?.src==='/mascotes/feliz.svg'),undefined);confirmButton(orderTree).props.onClick();orderTree=orderRender();assert.ok(findVoiceNode(orderTree,n=>n.props?.src==='/mascotes/feliz.svg'));
assert.equal(bankButton(orderTree,0).props.disabled,true);
console.log('QA de montagem: selecionar/desselecionar na origem e na palavra, sílabas NA independentes, confirmação vazia bloqueada e acerto somente após Confirmar passaram.');
