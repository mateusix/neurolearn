"use client";
import Image from 'next/image';
import {useSyncExternalStore} from 'react';
import {getExperienceSnapshot,getServerExperienceSnapshot,subscribeExperience} from '@/lib/experience';
import {accessories,type Experience} from '@/lib/experience-values';
export default function AvatarBuddy({id,size=80,alt='',accessory}:{id:string;size?:number;alt?:string;accessory?:string}){
 const snapshot=useSyncExternalStore(subscribeExperience,getExperienceSnapshot,getServerExperienceSnapshot);
 const chosen=accessory??(JSON.parse(snapshot) as Experience).accessory;
 const item=accessories.find(a=>a.id===chosen);
 return <span className="avatar-buddy" style={{width:size,height:size,fontSize:size*.25}}><Image src={`/avatars/${id}.svg`} width={size} height={size} alt={alt}/>{item&&item.id!=='none'&&<span className={`avatar-accessory avatar-accessory-${item.id}`} aria-hidden="true">{item.icon}</span>}</span>;
}
