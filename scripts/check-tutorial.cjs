const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
let states=[],cursor=0,effects=[],timer;
const storage=new Map();
const context={exports:{},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},setTimeout(fn){timer=fn;return 1;},clearTimeout(){},require(name){
 if(name==='react')return {...React,useState(initial){const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return [states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v;}];},useRef(initial){const i=cursor++;if(!(i in states))states[i]={current:initial};return states[i];},useEffect(fn){effects.push(fn);}};
 if(name==='@/lib/family-store')return {getFamilySnapshot:()=>({userId:null,selected:''})};
 if(name==='next/image')return {default:({src,alt})=>React.createElement('img',{src,alt})};
 if(name.endsWith('.css'))return {default:new Proxy({},{get:(_,key)=>key})};
 return require(name);
}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/(marketing)/mini-tutorial.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
function find(node,label){if(!node)return;if(Array.isArray(node)){for(const x of node){const found=find(x,label);if(found)return found;}return;}if(typeof node!=='object')return;if(node.type==='button'&&renderToStaticMarkup(node).includes(label))return node;return find(node.props?.children,label);}
for(const kind of ['choice','write','order','sentence','listening','memory']){
 states=[];storage.clear();
 const render=()=>{cursor=0;effects=[];const tree=context.exports.default({kind,children:React.createElement('button',{},'REAL EXERCISE')});for(const effect of effects)effect();return tree;};
 let tree=render();let html=renderToStaticMarkup(tree);
 assert.ok(html.includes('TUTORIAL'));assert.ok(html.includes('SÓ OBSERVE'));assert.ok(!html.includes('REAL EXERCISE'));
 find(tree,'Pausar o tutorial').props.onClick();tree=render();assert.ok(renderToStaticMarkup(tree).includes('Exemplo pausado'));
 find(tree,'Continuar o tutorial').props.onClick();tree=render();
 for(let i=0;i<5;i++){timer();tree=render();}
 assert.ok(renderToStaticMarkup(tree).includes('Exemplo terminado'));
 find(tree,'Ir para o exercício').props.onClick();tree=render();html=renderToStaticMarkup(tree);
 assert.ok(html.includes('REAL EXERCISE'));assert.ok(!html.includes('SÓ OBSERVE'));
 assert.equal(storage.size,1);assert.ok([...storage.keys()][0].startsWith('neurolearn-demo-v2:'));
 find(tree,'Ver o tutorial de novo').props.onClick();tree=render();assert.ok(!renderToStaticMarkup(tree).includes('REAL EXERCISE'));
}
console.log('QA do tutorial: seis tipos, demonstração isolada, pausa, término, exercício e reabertura passaram.');
