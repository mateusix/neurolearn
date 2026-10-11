"use client";
import { useRouter } from 'next/navigation';
import FamilyPanel from '../family-panel';
export default function ResponsiblePage() {
  const router = useRouter();
  return <FamilyPanel onContinue={() => router.push('/')} onClose={() => router.push('/')} />;
}
