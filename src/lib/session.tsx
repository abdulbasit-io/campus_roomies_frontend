'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiRequestError, apiRequest } from './api';

export type SessionProfile = {
  userId: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  firstName: string;
  lastNameInitial: string;
  email: string;
  phoneConfirmed: boolean;
  profileComplete: boolean;
  photoUrl: string | null;
};

type SessionContextValue = {
  profile: SessionProfile | null;
  sessionError: string | null;
  ready: boolean;
  signIn: (profile: SessionProfile) => void;
  signOut: () => void;
  updateProfile: (profile: SessionProfile) => void;
  refresh: () => Promise<SessionProfile | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const current = await apiRequest<SessionProfile>('/auth/session');
      setProfile(current);
      setSessionError(null);
      return current;
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.status === 401) {
        setProfile(null);
        setSessionError(null);
        return null;
      }
      setSessionError(cause instanceof Error
        ? `We could not verify your session: ${cause.message}`
        : 'We could not verify your session. Some account actions may be unavailable.');
      return null;
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({
    profile,
    sessionError,
    ready,
    signIn: (next: SessionProfile) => setProfile(next),
    signOut: () => setProfile(null),
    updateProfile: (next: SessionProfile) => setProfile(next),
    refresh,
  }), [profile, ready, refresh, sessionError]);

  return <SessionContext.Provider value={value}>
    {sessionError && <div className="session-warning" role="status">
      <span>{sessionError} Try refreshing the session.</span>
      <button type="button" onClick={() => { void refresh(); }}>Retry</button>
    </div>}
    {children}
  </SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
