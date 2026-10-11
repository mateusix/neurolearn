const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const {execFileSync}=require('node:child_process');
const catalog=JSON.parse(fs.readFileSync('content/narration.pt-BR.json','utf8'));
const context={exports:{},require(name){if(name==='@/content/narration.pt-BR.json')return catalog;throw new Error(name);}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/luna-dialogue.ts','utf8'),{compilerOptions:{esModuleInterop:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);
const choose=context.exports.chooseDialogue;
const success=Array.from({length:4},()=>choose('success').id);assert.equal(new Set(success.slice(0,3)).size,3);assert.equal(success[0],success[3]);
const support=Array.from({length:4},()=>choose('support').id);assert.equal(new Set(support.slice(0,3)).size,3);assert.equal(support[0],support[3]);
for(const group of ['choice','order','write','finish','final','achievement','words'])assert.ok(choose(group));
const ids=new Set();let count=0;
for(const phrase of catalog.phrases){assert.ok(!ids.has(phrase.id));ids.add(phrase.id);if(phrase.status!=='generated')continue;
 const file=`public/audio/pt-BR/nina/${phrase.id}.mp3`;assert.ok(fs.existsSync(file),file);
 const info=execFileSync('/usr/bin/afinfo',[file],{encoding:'utf8'});const duration=Number(info.match(/estimated duration:\s*([\d.]+)/)?.[1]);assert.ok(duration>0&&duration<30,file);count++;
}
assert.equal(count,catalog.phrases.filter(phrase=>phrase.status==='generated').length);
console.log(`QA de narração: ${count} MP3s decodificáveis; variações de acerto/apoio alternam sem repetir imediatamente, e cada gravação cadastrada tem arquivo válido.`);
