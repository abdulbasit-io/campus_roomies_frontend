'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, ChevronDown, CircleUserRound, FileText, Home, LogOut, Plus, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { logout } from '@/lib/frontend-api';
import { useSession } from '@/lib/session';
import { authLink } from '@/lib/redirect';

export function Logo() {
  return <Link className="brand" href="/" aria-label="Campus Roomies home"><span className="brand-mark"><Home size={19} strokeWidth={2.4} /></span><strong>Campus <span>Roomies</span></strong></Link>;
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const { profile, signOut } = useSession();

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') {
      setCurrentPath(null);
      return;
    }
    setCurrentPath(`${pathname}${window.location.search}`);
  }, [pathname]);

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
      signOut();
      setMenuOpen(false);
      window.location.assign('/');
    } catch (cause) {
      setLogoutError(cause instanceof Error ? cause.message : 'Unable to sign out. Please try again.');
    }
  }

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/browse">Browse rooms</Link>
          <Link href="/how-it-works">How it works</Link>
        </nav>
        <div className="header-actions">
          {!profile && <Link className="text-link desktop-only" href={authLink('/login', currentPath)}>Log in</Link>}
          <Link className="button button-small" href="/listings/new">List a room</Link>
          <ThemeToggle />
          <button className="account-trigger" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((open) => !open)}><span className="avatar-button"><CircleUserRound size={18} /></span><ChevronDown size={14} className="desktop-only" /></button>
          {menuOpen && <div className="account-menu" role="menu">
            <div className="account-menu-heading"><span className="avatar-button">{profile?.firstName.slice(0, 1) ?? 'A'}</span><div><strong>{profile ? `${profile.firstName} ${profile.lastNameInitial}.` : 'Your account'}</strong><small>{profile ? 'Student profile' : 'Sign in to manage your account'}</small></div></div>
            {profile ? <>
              <Link role="menuitem" href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={16} /> Profile</Link>
              <Link role="menuitem" href="/listings/new" onClick={() => setMenuOpen(false)}><Plus size={16} /> Create a listing</Link>
              <Link role="menuitem" href="/profile/listings" onClick={() => setMenuOpen(false)}><FileText size={16} /> My listings</Link>
              <Link role="menuitem" href="/profile/saved" onClick={() => setMenuOpen(false)}><Bookmark size={16} /> Saved rooms</Link>
              <button role="menuitem" onClick={handleLogout}><LogOut size={16} /> Log out</button>
            </> : <Link role="menuitem" href={authLink('/login', currentPath)} onClick={() => setMenuOpen(false)}>Log in or create an account</Link>}
            {logoutError && <p className="form-error" role="alert">{logoutError}</p>}
          </div>}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p className="footer-copy">A calmer way to find a room and a living situation that feels like it could work.</p>
        </div>
        <div><h3>Explore</h3><Link href="/browse">Browse rooms</Link><Link href="/how-it-works">How it works</Link></div>
        <div><h3>Host</h3><Link href="/listings/new">List a room</Link><Link href="/profile">My profile</Link></div>
        <div><h3>Trust &amp; care</h3><Link href="/report">Safety guidelines</Link><Link href="/privacy">Privacy</Link></div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 Campus Roomies</span><span>Built for student life.</span></div>
    </footer>
  );
}
