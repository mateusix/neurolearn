const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
let motion='on',reduced=false,frame,ghost,queries=[],flights=[];const events=new Map();
const animate=(frames,options)=>{const a={frames,options,cancel(){a.cancelled=true}};flights.push(a);return a;};
const nodes={};
for(const [type,left,top]of [['bank',20,200],['piece',100,50]])for(const index of [0,1])nodes[`[data-${type}="${index}"]`]={textContent:'NA',getBoundingClientRect:()=>({left:left+index*40,top,width:60,height:44}),animate};
const root={isConnected:true,closest:()=>({getAttribute:()=>motion}),querySelector:s=>{queries.push(s);return nodes[s];},append:g=>{ghost=g}};
const context={exports:{},window:{matchMedia:()=>({matches:reduced,addEventListener(){},removeEventListener(){}}),addEventListener:(n,fn)=>events.set(n,fn),removeEventListener:n=>events.delete(n)},getComputedStyle:()=>({}),requestAnimationFrame:fn=>{frame=fn;return 1},cancelAnimationFrame(){frame=null},document:{createElement:()=>({style:{},setAttribute(){},remove(){this.removed=true},animate})}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/piece-motion.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
const {movePiece,cancelPieceTransfers}=context.exports;
movePiece(root,1,false);frame();assert.deepEqual(queries,['[data-bank="1"]','[data-piece="1"]']);assert.ok(flights.at(-1).frames[1].transform.includes('translate(80px,-150px)'));flights.at(-1).onfinish();assert.equal(ghost.removed,true);
queries=[];movePiece(root,0,true);frame();assert.deepEqual(queries,['[data-piece="0"]','[data-bank="0"]']);assert.ok(flights.at(-1).frames[1].transform.includes('translate(-80px,150px)'));events.get('neurolearn-comfort')();assert.equal(ghost.removed,true);assert.equal(flights.at(-1).cancelled,true);
movePiece(root,0,false);cancelPieceTransfers(root);assert.equal(frame,null);
frame=null;motion='off';movePiece(root,1,false);assert.equal(frame,null);motion='on';reduced=true;movePiece(root,1,false);assert.equal(frame,null);
for(const name of ['correct','retry']){const data=fs.readFileSync(`public/sounds/${name}.wav`);assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WAVE');assert.ok(data.length>1000&&data.length<70000);}
console.log('QA do movimento: ida, volta, sílabas repetidas independentes, cancelamento, movimento reduzido e arquivos sonoros passaram.');
