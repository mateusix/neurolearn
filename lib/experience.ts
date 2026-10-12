import {currentChild,isAccountMode,updateChild} from './family-store';
import {lessons,getProgress} from './lessons';
import {accessories,emptyExperience,validExperience,cleanExperience,type Experience} from './experience-values';
const key='neurolearn-experience-v1';let session='';
export function getExperienceSnapshot(){
 if(isAccountMode()){const value=currentChild()?.experience;return JSON.stringify(validExperience(value,lessons.length)?value:emptyExperience());}
 try{const value=JSON.parse(localStorage.getItem(key)||'null');return validExperience(value,lessons.length)?JSON.stringify(value):session||JSON.stringify(emptyExperience());}catch{return session||JSON.stringify(emptyExperience());}
}
export const getServerExperienceSnapshot=()=>JSON.stringify(emptyExperience());
export const readExperience=():Experience=>JSON.parse(getExperienceSnapshot());
export function saveExperience(value:Experience){
 if(!validExperience(value,lessons.length)||!accessories.some(a=>a.id===value.accessory&&a.at<=getProgress()))return false;
 if(isAccountMode())return updateChild({experience:cleanExperience(value)});
 session=JSON.stringify(cleanExperience(value));let saved=true;
 try{localStorage.setItem(key,session);}catch{saved=false;}
 window.dispatchEvent(new Event('neurolearn-experience'));return saved;
}
export function recordAttempt(stage:number,correct:boolean){
 const value=readExperience();const n=value.stats[stage]||[0,0];
 return saveExperience({...value,stats:{...value.stats,[stage]:[Math.min(9999,n[0]+1),Math.min(9999,n[1]+(correct?1:0))]}});
}
export function toggleFavorite(stage:number){
 if(!Number.isInteger(stage)||stage<0||stage>=lessons.length||stage>getProgress())return false;
 const value=readExperience();return saveExperience({...value,favorites:value.favorites.includes(stage)?value.favorites.filter(i=>i!==stage):[...value.favorites,stage]});
}
export function subscribeExperience(callback:()=>void){window.addEventListener('storage',callback);window.addEventListener('neurolearn-experience',callback);return()=>{window.removeEventListener('storage',callback);window.removeEventListener('neurolearn-experience',callback);};}
