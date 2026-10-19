'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SessionProfile = {
  userId?: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
  firstName: string;
  lastNameInitial: string;
  email: string;
  phoneConfirmed: boolean;
  profileComplete: boolean;
};

type SessionContextValue = {
  profile: SessionProfile | null;
  ready: boolean;
  signIn: (profile: SessionProfile) => void;
  signOut: () => void;
  updateProfile: (profile: SessionProfile) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);
const storageKey = 'campus-roomies-session';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setProfile(JSON.parse(saved) as SessionProfile);
    setReady(true);
  }, []);

  const value = useMemo(() => ({
    profile,
    ready,
    signIn: (next: SessionProfile) => { setProfile(next); window.localStorage.setItem(storageKey, JSON.stringify(next)); },
    signOut: () => { setProfile(null); window.localStorage.removeItem(storageKey); },
    updateProfile: (next: SessionProfile) => { setProfile(next); window.localStorage.setItem(storageKey, JSON.stringify(next)); },
  }), [profile, ready]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
