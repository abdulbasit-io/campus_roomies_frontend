'use client';

import Link from 'next/link';
import { Bookmark, ChevronDown, CircleUserRound, FileText, Home, LogOut, Plus, UserRound } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Logo() {
  return <Link className="brand" href="/" aria-label="Campus Roomies home"><span className="brand-mark"><Home size={19} strokeWidth={2.4} /></span><strong>Campus <span>Roomies</span></strong></Link>;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/browse">Browse rooms</Link>
          <Link href="/how-it-works">How it works</Link>
        </nav>
        <div className="header-actions">
          <Link className="text-link desktop-only" href="/login">Log in</Link>
          <Link className="button button-small" href="/listings/new">List a room</Link>
          <ThemeToggle />
          <button className="account-trigger" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((open) => !open)}><span className="avatar-button"><CircleUserRound size={18} /></span><ChevronDown size={14} className="desktop-only" /></button>
          {menuOpen && <div className="account-menu" role="menu">
            <div className="account-menu-heading"><span className="avatar-button">A</span><div><strong>Your account</strong><small>Student profile</small></div></div>
            <Link role="menuitem" href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={16} /> Profile</Link>
            <Link role="menuitem" href="/listings/new" onClick={() => setMenuOpen(false)}><Plus size={16} /> Create a listing</Link>
            <Link role="menuitem" href="/profile/listings" onClick={() => setMenuOpen(false)}><FileText size={16} /> My listings</Link>
            <Link role="menuitem" href="/profile/saved" onClick={() => setMenuOpen(false)}><Bookmark size={16} /> Saved rooms</Link>
            <button role="menuitem" onClick={() => setMenuOpen(false)}><LogOut size={16} /> Log out</button>
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
