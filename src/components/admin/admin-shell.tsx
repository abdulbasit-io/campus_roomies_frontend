'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Building2, ClipboardList, Flag, LayoutDashboard, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/site-chrome';
import { ApiRequestError, apiMutation, apiRequest } from '@/lib/api';
import { useSession } from '@/lib/session';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useSession();
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');
  const [adminIdentity, setAdminIdentity] = useState('');

  useEffect(() => {
    setAuthorized(false);
    setError('');
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
        router.replace('/');
        return;
      }
      setAdminIdentity(`${profile.firstName} ${profile.lastNameInitial}`);
      setAuthorized(true);
    }).catch((cause: unknown) => {
      if (!active) return;
      if (cause instanceof ApiRequestError && cause.status === 401) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setError(cause instanceof Error ? cause.message : 'Unable to verify administrator access.');
    });
    return () => { active = false; };
  }, [pathname, router]);

  async function logout() {
    try {
      await apiMutation('/auth/logout', 'POST');
      signOut();
      router.replace('/login');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign out.');
    }
  }

  if (!authorized) {
    return (
      <main className="admin-access-state" role={error ? 'alert' : 'status'}>
        {error || 'Checking access…'}
        {error && <>
          <Link className="button button-small" href={`/login?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
          <button className="admin-action-link" onClick={logout}>Sign out</button>
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
          <Link href="/admin/moderation" aria-current={pathname === '/admin/moderation' || pathname.startsWith('/admin/moderation/reports') ? 'page' : undefined} aria-label="Moderation"><Flag size={17} /><span>Moderation</span></Link>
          <Link href="/admin/moderation/audit" aria-current={pathname === '/admin/moderation/audit' ? 'page' : undefined} aria-label="Moderation audit"><ClipboardList size={17} /><span>Moderation audit</span></Link>
          <Link href="/admin/communications" aria-current={pathname.startsWith('/admin/communications') ? 'page' : undefined} aria-label="Communications"><Mail size={17} /><span>Communications</span></Link>
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
