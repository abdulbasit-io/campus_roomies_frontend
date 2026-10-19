'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Building2, LayoutDashboard, LogOut } from 'lucide-react';
import { Logo } from '@/components/site-chrome';
import { ApiRequestError, apiMutation, apiRequest } from '@/lib/api';
import { useSession } from '@/lib/session';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSession();
  const loginPage = pathname === '/admin/login';
  const [authorized, setAuthorized] = useState(loginPage ? true : false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loginPage) {
      setAuthorized(true);
      return;
    }
    let active = true;
    apiRequest<{
      userId: string;
      role: 'USER' | 'MODERATOR' | 'ADMIN';
      firstName: string;
      lastNameInitial: string;
      email: string;
      phoneConfirmed: boolean;
      profileComplete: boolean;
    }>('/auth/session').then((profile) => {
      if (!active) return;
      if (profile.role !== 'ADMIN') {
        setError('This account does not have administrator access.');
        return;
      }
      setAuthorized(true);
    }).catch((cause: unknown) => {
      if (!active) return;
      if (cause instanceof ApiRequestError && cause.status === 401) {
        router.replace('/admin/login');
        return;
      }
      setError(cause instanceof Error ? cause.message : 'Unable to verify administrator access.');
    });
    return () => { active = false; };
  }, [loginPage, router]);

  async function logout() {
    try {
      await apiMutation('/auth/logout', 'POST');
      signOut();
      router.replace('/admin/login');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign out.');
    }
  }

  if (loginPage) return <>{children}</>;
  if (!authorized) {
    return (
      <main className="admin-access-state" role={error ? 'alert' : 'status'}>
        {error || 'Checking administrator access…'}
        {error && <>
          <Link className="button button-small" href="/admin/login">Sign in as administrator</Link>
          <button className="admin-action-link" onClick={logout}>Sign out of this account</button>
        </>}
      </main>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Logo />
        <p className="admin-sidebar-label">Administration</p>
        <nav aria-label="Admin navigation">
          <Link href="/admin"><LayoutDashboard size={17} /> Overview</Link>
          <Link href="/admin/institutions"><Building2 size={17} /> Institutions</Link>
          <Link href="/admin/audit"><Activity size={17} /> Audit history</Link>
        </nav>
        <button className="admin-logout" onClick={logout}><LogOut size={17} /> Sign out</button>
      </aside>
      <main className="admin-main">
        {error && <p className="admin-alert" role="alert">{error}</p>}
        {children}
      </main>
    </div>
  );
}
