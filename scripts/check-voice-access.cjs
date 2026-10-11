const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function compile(file,require){const context={exports:{},require};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);return context.exports;}
const lessons=compile('lib/lessons.ts',name=>name==='./family-store'?{isAccountMode:()=>false}:require(name));
const access=compile('lib/learning-access.ts',name=>name==='./lessons'?lessons:require(name));
const {canOpenStage,firstSpeakingStage}=access;assert.equal(firstSpeakingStage,21);
for(const completed of [0,11,20])assert.equal(canOpenStage(21,completed),false);
assert.equal(canOpenStage(21,21),true);assert.equal(canOpenStage(22,21),false);assert.equal(canOpenStage(22,22),true);
for(const [index,completed] of [[-1,21],[23,23],[21,NaN],[21,-1],[21,24],[1.5,21]])assert.equal(canOpenStage(index,completed),false);
let completed=0,family={userId:null,selected:'',loading:false,family:{children:{}}},preferences=JSON.stringify({theme:'mixed',support:'hint',palette:'blue'}),state=[],cursor=0,lessonProps;
const route=compile('app/(marketing)/fala/page.tsx',name=>{
 if(name==='react')return {...React,useSyncExternalStore:(_subscribe,get)=>get(),useState(initial){const i=cursor++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],v=>state[i]=v];}};
 if(name==='next/navigation')return {useRouter:()=>({push(){}})};
 if(name==='next/link')return {default:props=>React.createElement('a',props,props.children)};
 if(name==='../lesson')return {default:props=>{lessonProps=props;return React.createElement('div',{'data-voice-stage':props.index},'Exercício de fala');}};
 if(name==='@/lib/preferences')return {getPreferencesSnapshot:()=>preferences,subscribePreferences(){}};
 if(name==='@/lib/lessons')return {getProgress:()=>completed,saveProgress:value=>{completed=Math.max(completed,value);return true;},subscribeProgress(){}};
 if(name==='@/lib/family-store')return {getFamilySnapshot:()=>family,getServerFamilySnapshot:()=>family,subscribeFamily(){}};
 if(name==='@/lib/learning-access')return access;
 if(name.endsWith('.css'))return {default:new Proxy({}, {get:(_,key)=>String(key)})};
 return require(name);
});
function render(reset=true){if(reset)state=[];cursor=0;lessonProps=null;return renderToStaticMarkup(React.createElement(route.default));}
for(const progress of [0,11,20]){completed=progress;const html=render();assert.ok(html.includes('A fala ainda está guardada'));assert.equal(lessonProps,null);assert.ok(!html.includes('Exercício de fala'));}
completed=21;render();assert.equal(lessonProps.index,21);lessonProps.onNext();render(false);assert.equal(lessonProps.index,21);
lessonProps.onComplete();assert.equal(completed,22);lessonProps.onNext();render(false);assert.equal(lessonProps.index,22);lessonProps.onComplete();assert.equal(completed,23);
family={userId:'parent',selected:'a',loading:false,family:{children:{a:{}}}};completed=21;render();assert.ok(lessonProps);const keyA=route.default().key;family={...family,selected:'b',family:{children:{a:{},b:{}}}};completed=0;const keyB=route.default().key;assert.notEqual(keyA,keyB);render();assert.equal(lessonProps,null);
family.loading=true;assert.ok(render().includes('Preparando sua aprendizagem'));assert.equal(lessonProps,null);
family.loading=false;family.selected='missing';completed=23;render();assert.equal(lessonProps,null);
console.log('QA de acesso: URL direta bloqueada antes da etapa 22, segunda etapa protegida, conclusão salva, próximo desbloqueado, carregamento e perfis isolados passaram.');
