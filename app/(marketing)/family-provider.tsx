"use client";
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { loadFamily, syncFamily, reportAuthUnavailable } from '@/lib/family-store';
export default function FamilyProvider({children}:{children:React.ReactNode}) {
  const {userId,isLoaded} = useAuth();
  useEffect(() => {
    if (isLoaded) { void loadFamily(userId || null); return; }
    const timer = setTimeout(reportAuthUnavailable, 8000);
    return () => clearTimeout(timer);
  },[isLoaded,userId]);
  useEffect(() => {
    const sync = () => { void syncFamily(); };
    const hidden = () => { if (document.visibilityState === 'hidden') sync(); };
    window.addEventListener('online',sync); window.addEventListener('pagehide',sync); document.addEventListener('visibilitychange',hidden);
    return () => { window.removeEventListener('online',sync); window.removeEventListener('pagehide',sync); document.removeEventListener('visibilitychange',hidden); };
  },[]);
  return children;
}
