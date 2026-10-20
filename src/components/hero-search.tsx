'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Institution, listInstitutions } from '@/lib/frontend-api';

export function HeroSearch() {
  const router = useRouter();
  const [area, setArea] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionId, setInstitutionId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    listInstitutions().then((items) => {
      setInstitutions(items);
      if (items.length === 1) setInstitutionId(items[0].id);
    }).catch((cause: Error) => setError(cause.message));
  }, []);

  return (
    <form className="hero-search" onSubmit={(event) => { event.preventDefault(); const params = new URLSearchParams(); if (institutionId) params.set('institutionId', institutionId); if (area.trim()) params.set('area', area.trim()); router.push(`/browse${params.size ? `?${params.toString()}` : ''}`); }}>
      <label><span>Where are you studying?</span><select value={institutionId} onChange={(event) => setInstitutionId(event.target.value)}><option value="">All institutions</option>{institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}</select></label>
      <label><span>Search by area or landmark</span><input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Camp, Harmony, Isolu..." /></label>
      <button className="button" type="submit">Find rooms <span>→</span></button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}
