'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSearch() {
  const router = useRouter();
  const [area, setArea] = useState('');

  return (
    <form className="hero-search" onSubmit={(event) => { event.preventDefault(); router.push(area ? `/browse?area=${encodeURIComponent(area)}` : '/browse'); }}>
      <label><span>Where are you studying?</span><select defaultValue="FUNAAB"><option>Federal University of Agriculture, Abeokuta</option><option>Choose another institution</option></select></label>
      <label><span>Search by area or landmark</span><input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Camp, Harmony, Isolu..." /></label>
      <button className="button" type="submit">Find rooms <span>→</span></button>
    </form>
  );
}
