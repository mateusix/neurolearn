// Only explicitly named recordings are imported; timestamp-only downloads are never guessed.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname,'..');
const catalogPath = path.join(root,'content/narration.pt-BR.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath,'utf8'));
const ids = catalog.phrases.map(phrase=>phrase.id);
let imported = 0;
for(const id of ids) {
 const source = path.join(os.homedir(),'Downloads',`${id}.mp3`);
 if(!fs.existsSync(source)) continue;
 const bytes=fs.readFileSync(source);
 if(bytes.length<100 || !(bytes.subarray(0,3).toString()==='ID3' || (bytes[0]===255 && (bytes[1]&224)===224))) {console.error(`Arquivo MP3 inválido: ${id}`);continue;}
 const phrase=catalog.phrases.find(item=>item.id===id);
 if(!phrase) continue;
 const directory=path.join(root,'public/audio/pt-BR/nina');
 fs.mkdirSync(directory,{recursive:true});fs.copyFileSync(source,path.join(directory,`${id}.mp3`));
 phrase.status='generated';phrase.recordingState='downloaded';imported++;
}
if(imported) fs.writeFileSync(catalogPath,JSON.stringify(catalog,null,2)+'\n');
console.log(`${imported} gravações importadas. Downloads sem o nome da frase são preservados.`);
