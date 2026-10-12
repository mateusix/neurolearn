const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const {webcrypto} = require('node:crypto');
let owner = 'parent-a';
let offline = false;let stalled = false;const timers = new Map();let timerId=0;
const accounts = new Map();
const local = new Map();
const events = [];
const modules = new Map();
const clerk = {auth:async()=>({userId:owner}),clerkClient:async()=>({users:{
 getUser:async(id)=>({privateMetadata:structuredClone(accounts.get(id)||{other:'preserved'})}),
 updateUserMetadata:async(id,{privateMetadata})=>{
  const existing = accounts.get(id)||{other:'preserved'};
  const old = existing.neurolearn||{version:1,children:{}};
  accounts.set(id,{...existing,...privateMetadata,neurolearn:{version:1,children:{...old.children,...privateMetadata.neurolearn.children}}});
 },
}})};
function load(file) {
 if(modules.has(file)) return modules.get(file);
 const exports={}; modules.set(file,exports);
 const context={exports,require(name){
  if(name==='@clerk/nextjs/server')return clerk;
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts');
  if(name.startsWith('./'))return load('lib/'+name.slice(2)+'.ts');
  return require(name);
 },RangeError,SyntaxError,AbortController,structuredClone,Response,Request,URL,Buffer,crypto:webcrypto,Event,Date,setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;},clearTimeout:id=>timers.delete(id),
 localStorage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,value),removeItem:key=>local.delete(key)},
 window:{dispatchEvent:e=>events.push(e.type),addEventListener(){},removeEventListener(){}},
 fetch:async(url,options)=>{if(stalled)return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('timeout'))));if(offline)throw new Error('offline');return options?.method==='POST'?route.POST(new Request('http://localhost/api/family',{...options,headers:{...options.headers,origin:'http://localhost'}})):route.GET();},
 };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);
 return exports;
}
const route=load('app/api/family/route.ts');
const store=load('lib/family-store.ts');
const lessons=load('lib/lessons.ts');
const avatars=load('lib/avatars.ts');
const preferences=load('lib/preferences.ts');
async function post(body,origin='http://localhost') {return route.POST(new Request('http://localhost/api/family',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)}));}
(async()=>{
 store.reportAuthUnavailable();assert.equal(store.getFamilySnapshot().loading,false);assert.ok(store.getFamilySnapshot().error);await store.loadFamily(null);assert.equal(store.getFamilySnapshot().error,'');
 stalled=true;const waiting=store.loadFamily('slow-account');assert.equal(store.getFamilySnapshot().loading,true);for(const timer of [...timers.values()])if(timer.delay===10000)timer.fn();await waiting;assert.equal(store.getFamilySnapshot().loading,false);assert.ok(store.getFamilySnapshot().error);stalled=false;
 owner=null;assert.equal((await route.GET()).status,401);assert.equal((await post({action:'create',name:'Teste',avatar:'panda'})).status,401);
 owner='parent-a';assert.equal((await post({action:'create',name:'Teste',avatar:'panda'},'https://other.test')).status,403);
 assert.equal((await post({action:'create',name:'',avatar:'panda'})).status,400);
 assert.equal((await post({action:'create',name:'<script>',avatar:'panda'})).status,400);
 assert.equal((await route.POST(new Request('http://localhost/api/family',{method:'POST',headers:{origin:'http://localhost','Content-Type':'text/plain'},body:'{}'}))).status,415);
 assert.equal((await route.POST(new Request('http://localhost/api/family',{method:'POST',headers:{origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify({name:'á'.repeat(9000)})}))).status,413);
 const first=await (await post({action:'create',name:'Teste A',avatar:'panda'})).json();
 const second=await (await post({action:'create',name:'Teste B',avatar:'coelho'})).json();
 await store.loadFamily(owner);store.selectChild(first.id);assert.equal(avatars.getAvatar(),'panda');assert.equal(lessons.getProgress(),0);
 assert.equal(lessons.saveProgress(3),true);assert.equal(lessons.saveLessonPosition(3,1),true);assert.equal(avatars.saveAvatar('gato'),true);
 store.selectChild(second.id);assert.equal(lessons.getProgress(),0);assert.equal(lessons.readLessonPosition(3),0);assert.equal(avatars.getAvatar(),'coelho');
 await store.syncFamily();
 assert.equal(accounts.get(owner).other,'preserved');
 await store.loadFamily(owner);store.selectChild(first.id);assert.equal(lessons.getProgress(),3);assert.equal(lessons.readLessonPosition(3),1);assert.equal(avatars.getAvatar(),'gato');
 assert.equal((await post({action:'progress',childId:first.id,avatar:'gato',completed:1,positions:{}})).status,200);
 assert.equal((await route.GET()).status,200);assert.equal(accounts.get(owner).neurolearn.children[first.id].completed,3);
 assert.equal((await post({action:'progress',childId:first.id,avatar:'panda',completed:99,positions:{}})).status,400);
 assert.equal((await post({action:'progress',childId:first.id,avatar:'panda',completed:3,positions:{'3':99}})).status,400);
 await store.loadFamily(owner);store.selectChild(first.id);lessons.saveProgress(4);offline=true;await store.syncFamily();assert.equal(store.getFamilySnapshot().pending,true);assert.ok(store.getFamilySnapshot().error);assert.equal(accounts.get(owner).neurolearn.children[first.id].completed,3);offline=false;await store.syncFamily();assert.equal(store.getFamilySnapshot().pending,false);assert.equal(accounts.get(owner).neurolearn.children[first.id].completed,4);
 preferences.savePreferences({theme:'food',support:'model'});await store.syncFamily();await store.loadFamily(owner);store.selectChild(first.id);assert.equal(preferences.readPreferences().theme,'food');store.selectChild(second.id);assert.equal(preferences.readPreferences(),null);assert.equal((await post({action:'progress',childId:first.id,avatar:'gato',completed:4,positions:{},preferences:{theme:'invalid',support:'model'}})).status,400);
 owner='parent-b';assert.equal((await post({action:'progress',childId:first.id,avatar:'panda',completed:3,positions:{}})).status,404);
 assert.equal(Object.keys((await (await route.GET()).json()).children).length,0);
 await store.loadFamily(owner);assert.equal(lessons.getProgress(),0);assert.equal(avatars.getAvatar(),'');
 owner='parent-a';for(let i=0;i<3;i++)assert.equal((await post({action:'create',name:'Teste '+i,avatar:'urso'})).status,200);
 assert.equal((await post({action:'create',name:'Sexto',avatar:'urso'})).status,400);
 await store.loadFamily(null);assert.equal(store.isAccountMode(),false);
 const React=require('react'); const {renderToStaticMarkup}=require('react-dom/server');
 const family=accounts.get('parent-a').neurolearn;
 const preview={userId:'parent-a',family:{version:1,children:{[first.id]:family.children[first.id],[second.id]:family.children[second.id]}},selected:first.id,loading:false,error:'',saving:false,pending:false};
 const panel={exports:{},require(name){
  if(name==='@clerk/nextjs')return {useAuth:()=>({isSignedIn:true}),SignInButton:({children})=>children};
  if(name==='@/lib/family-store')return {...store,getServerFamilySnapshot:()=>preview};
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts');
  if(name==='./family.module.css')return {default:new Proxy({},{get:(_,key)=>String(key)})};
  if(name==='next/image')return {default:({src,alt})=>React.createElement('img',{src,alt})};
  return require(name);
 }};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/(marketing)/family-panel.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,panel);
 const html=renderToStaticMarkup(React.createElement(panel.exports.default,{onContinue(){},onClose(){}}));
 assert.ok(html.includes('Teste A'));assert.ok(html.includes('Teste B'));assert.ok(html.includes(`4 de ${lessons.lessons.length} etapas concluídas`));assert.ok(html.includes('Ver etapas concluídas'));assert.ok(html.includes('Novo perfil infantil'));assert.ok(html.includes('/avatars/coelho.svg'));
 const legacy=accounts.get('parent-a').neurolearn.children[first.id];legacy.completed=23;legacy.positions['22']=1;owner='parent-a';const migrated=await (await route.GET()).json();assert.equal(migrated.children[first.id].completed,21);assert.equal(migrated.children[first.id].positions['22'],undefined);
 console.log('QA de carregamento: login indisponível, requisição travada com limite de espera e histórico de fases removidas passaram.');
 console.log('QA do painel: perfis, etapas concluídas, próximo passo e criação renderizados.');
 console.log('QA de perfis: autenticação, origem, isolamento entre responsáveis/crianças, retomada, avatar, limite de perfis, falha de conexão/retentativa e progresso monotônico passaram.');
})().catch(error=>{console.error(error);process.exitCode=1;});
