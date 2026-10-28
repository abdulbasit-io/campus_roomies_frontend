'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const enabled = window.localStorage.getItem('campus-roomies-theme') === 'dark';
    setDark(enabled);
    document.documentElement.classList.toggle('dark', enabled);
  }, []);

  return <button className="theme-toggle" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={() => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem('campus-roomies-theme', next ? 'dark' : 'light');
  }}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>;
}
