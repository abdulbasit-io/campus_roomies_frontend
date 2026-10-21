'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Building2, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
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
  const [adminIdentity, setAdminIdentity] = useState('');

  useEffect(() => {
    if (loginPage) {
      setAuthorized(true);
      return;
    }
    let active = true;
    apiRequest<{
      userId: string;
      role: 'USER' | 'ADMIN';
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
      setAdminIdentity(`${profile.firstName} ${profile.lastNameInitial}`);
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
          <Link href="/admin" aria-current={pathname === '/admin' ? 'page' : undefined} aria-label="Overview"><LayoutDashboard size={17} /><span>Overview</span></Link>
          <Link href="/admin/institutions" aria-current={pathname.startsWith('/admin/institutions') ? 'page' : undefined} aria-label="Institutions"><Building2 size={17} /><span>Institutions</span></Link>
          <Link href="/admin/audit" aria-current={pathname.startsWith('/admin/audit') ? 'page' : undefined} aria-label="Audit history"><Activity size={17} /><span>Audit history</span></Link>
        </nav>
        <div className="admin-sidebar-account">
          <span className="admin-sidebar-account-icon"><ShieldCheck size={16} /></span>
          <span className="admin-sidebar-account-copy"><strong>{adminIdentity || 'Administrator'}</strong><small>Admin account</small></span>
          <button className="admin-logout" onClick={logout} aria-label="Sign out"><LogOut size={17} /><span>Sign out</span></button>
        </div>
      </aside>
      <main className="admin-main">
        {error && <p className="admin-alert" role="alert">{error}</p>}
        {children}
      </main>
    </div>
  );
}
