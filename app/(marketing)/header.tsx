"use client";

import Image from 'next/image';
import styles from './header.module.css';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { avatars, getAvatar, subscribeAvatar } from '@/lib/avatars';
import {
  SignInButton,
  UserButton,
  useAuth
} from "@clerk/nextjs";
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const avatarId = useSyncExternalStore(subscribeAvatar, getAvatar, () => "");
  const avatar = avatars.find(item => item.id === avatarId);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" priority />
          <span className="text-xl sm:text-2xl font-extrabold text-[var(--nl-text)] tracking-wide">
            NeuroLearn
          </span>
        </div>

        <div className={styles.account}>
          {avatar && <div className={styles.avatar} title={`Meu bichinho: ${avatar.name}`}>
            <Image src={`/avatars/${avatar.id}.svg`} width={42} height={42} alt={`Meu bichinho: ${avatar.name}`} />
          </div>}
          {isLoaded && isSignedIn && <Link className="min-h-11 px-2 text-xs sm:text-sm font-bold text-[var(--nl-text)] flex items-center" href="/responsavel">Meus perfis</Link>}
          {!isLoaded ? (
            // Enquanto o Clerk inicializa, não trava a tela (opcionalmente pode colocar um loader simples se quiser)
            null
          ) : isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button size="lg" variant="ghost" aria-label="Acesso do responsável" className={`px-2 sm:px-4 text-xs sm:text-sm text-[var(--nl-text)] ${styles.signIn}`}>
                <span className={styles.desktopLabel}>Acesso do responsável</span><span className={styles.mobileLabel}>Responsável</span>
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
};
