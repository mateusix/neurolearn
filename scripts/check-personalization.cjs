const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
const modules=new Map();
function load(file){if(modules.has(file))return modules.get(file);const exports={};modules.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,{exports,require(name){if(name==='./family-store')return {isAccountMode:()=>false,currentChild:()=>undefined,updateChild:()=>false};return load('lib/'+name.slice(2)+'.ts');},localStorage:{getItem:()=>null},window:{dispatchEvent(){}}});return exports;}
const {lessons,normalizeAnswer,assembleAnswer}=load('lib/lessons.ts');const {personalizedLesson}=load('lib/personalized-lessons.ts');const {validPreferences}=load('lib/preferences.ts');const {achievements,earnedAchievements}=load('lib/achievements.ts');
assert.equal(validPreferences({theme:'animals',support:'model'}),true);assert.equal(validPreferences({theme:'unknown',support:'model'}),false);assert.equal(validPreferences({theme:'animals',support:'unknown'}),false);
for(const theme of ['animals','food','travel','mixed'])for(const support of ['model','hint'])for(let index=0;index<lessons.length;index++){
 const stage=personalizedLesson(index,{theme,support});assert.equal(stage.exercises.length,lessons[index].exercises.length);assert.equal(stage.title,lessons[index].title);
 for(const exercise of stage.exercises){
  if(exercise.kind==='choice')assert.ok(exercise.options.some(option=>normalizeAnswer(option)===exercise.answer));
  if(exercise.kind==='order') {if(exercise.id.startsWith('personal-'))assert.equal(assembleAnswer(exercise,[1,0]),exercise.answer);assert.equal(exercise.options.length,lessons[index].exercises[stage.exercises.indexOf(exercise)].options.length);}
  if(exercise.listening)assert.equal(exercise.hideModel,true);
 }
}
assert.equal(personalizedLesson(2,{theme:'food',support:'model'}).exercises[0].word,'BOLO');assert.equal(personalizedLesson(2,{theme:'travel',support:'hint'}).exercises[0].word,'MOTO');
assert.equal(personalizedLesson(11,{theme:'animals',support:'model'}).exercises[0].hideModel,false);assert.equal(personalizedLesson(11,{theme:'animals',support:'hint'}).exercises[0].hideModel,true);
assert.equal(personalizedLesson(10,{theme:'food',support:'model'}).exercises[0].hideModel,true);
assert.equal(personalizedLesson(2,{theme:'food',support:'hint'}).exercises[0].optionAudio,undefined);
assert.equal(earnedAchievements(2).length,0);assert.equal(earnedAchievements(3).length,1);assert.equal(earnedAchievements(10).length,3);assert.equal(earnedAchievements(21).length,7);assert.equal(new Set(achievements.map(a=>a.id)).size,7);
console.log('QA: 8 combinações de preferências × 21 etapas; respostas válidas, retomada com mesmos tamanhos, modelos, transcrições e conquistas graduais passaram.');
