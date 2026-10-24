'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const retryDelays = [1000, 2500];

export function ResilientImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(!src);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAttempt(0);
    setFailed(!src);
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [src]);

  function retry() {
    if (attempt >= retryDelays.length) {
      setFailed(true);
      return;
    }
    retryTimer.current = setTimeout(
      () => setAttempt((current) => current + 1),
      retryDelays[attempt],
    );
  }

  return (
    <div className={`resilient-image ${className ?? ''}`}>
      {!failed && (
        <Image
          key={`${src}-${attempt}`}
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          onError={retry}
        />
      )}
      {failed && <span className="image-unavailable">Image unavailable</span>}
    </div>
  );
}
