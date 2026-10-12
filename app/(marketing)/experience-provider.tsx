"use client";
import {useSyncExternalStore} from 'react';
import {getExperienceSnapshot,getServerExperienceSnapshot,subscribeExperience} from '@/lib/experience';
export default function ExperienceProvider({children}:{children:React.ReactNode}){
 const snapshot=useSyncExternalStore(subscribeExperience,getExperienceSnapshot,getServerExperienceSnapshot);
 return <div data-reading-size={JSON.parse(snapshot).fontSize} style={{display:'contents'}}>{children}</div>;
}
