const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/activity-suggestions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,mod);
const {activitySuggestions}=mod.exports;
const catalog=Array.from({length:26},(_,index)=>({index,title:`Etapa ${index}`,description:'Praticar'}));
assert.deepEqual(Array.from(activitySuggestions(catalog,0,{}),x=>x.index),[0]);
for(let completed=0;completed<=26;completed++){
 const r=activitySuggestions(catalog,completed,{'0':[4,1],'1':[5,5]},Array.from({length:26},(_,i)=>i===25?100:i));
 assert.ok(r.every(s=>s.index<=completed&&s.index<26));assert.ok(r.length<=3);assert.equal(new Set(r.map(s=>s.index)).size,r.length);
 if(completed<26)assert.equal(r[0].index,completed);
 if(completed>0)assert.ok(r.some(s=>s.index===0));
}
assert.deepEqual(Array.from(activitySuggestions(catalog,5,{},[NaN]),x=>x.index),[5,4,3]);
assert.deepEqual(Array.from(activitySuggestions(catalog,5,{},catalog.map(c=>c.index===2?10:0)),x=>x.index),[5,2,4]);
const events=[];let disposed=false,failed=false;const context={exports:{},self:{postMessage:x=>events.push(x)},require(name){assert.equal(name,'@huggingface/transformers');return {env:{backends:{onnx:{wasm:{}}}},pipeline:async()=>{if(failed)throw Error('unavailable');const extract=async()=>({tolist:()=>[[1,0],[0,1],[1,0]]});extract.dispose=async()=>{disposed=true};return extract;}};}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/(marketing)/suggestions.worker.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
(async()=>{await context.self.onmessage({data:{query:'animais',descriptions:['frutas','gato']}});assert.equal(events[0].type,'complete');assert.deepEqual(Array.from(events[0].scores),[0,1]);assert.equal(disposed,true);failed=true;await context.self.onmessage({data:{query:'animais',descriptions:[]}});assert.equal(events.at(-1).type,'error');console.log('QA das sugestões: acesso, próxima etapa, revisão, ranking local, resultado inválido e falha do modelo passaram.');})();
