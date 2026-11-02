'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article';
};

export function Reveal({ children, className = '', delay = 0, as = 'div' }: RevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    setReady(true);

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const props = {
    ref: (element: HTMLElement | null) => {
      elementRef.current = element;
    },
    className: `reveal ${ready ? 'reveal-ready' : ''} ${visible ? 'is-visible' : ''} ${className}`,
    style: { '--reveal-delay': `${delay}ms` } as CSSProperties,
  };

  if (as === 'section') return <section {...props}>{children}</section>;
  if (as === 'article') return <article {...props}>{children}</article>;
  return <div {...props}>{children}</div>;
}
