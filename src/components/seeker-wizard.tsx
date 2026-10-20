'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Footer, Header } from '@/components/site-chrome';
import {
  createDraft,
  getDraft,
  Institution,
  InstitutionArea,
  listAreas,
  listInstitutions,
  ListingDraftInput,
  publishDraft,
  updateDraft,
} from '@/lib/frontend-api';
import { useSession } from '@/lib/session';

const steps = ['Your search', 'Preferences', 'About you', 'Review'];
const preferenceGroups: Array<[string, string[]]> = [
  ['Roommate gender', ['Male only', 'Female only']],
  ['Study atmosphere', ['Quiet study hours', 'Social and reading friendly', 'Flexible routine']],
  ['Power and utilities', ['Reliable power matters', 'Flexible about utilities', 'I can share costs']],
  ['Daily rhythm', ['Early riser', 'Night owl', 'No strong preference']],
];
const accommodationOptions = [
  ['SELF_CONTAINED', 'Self-contained'],
  ['SINGLE_ROOM_SHARED_FLAT', 'Single room in a shared flat'],
  ['SHARED_ROOM', 'Shared room'],
  ['TWO_BEDROOM_FLAT', '2-bedroom flat'],
  ['OTHER', 'Other'],
] as const;
const availabilityOptions = [
  ['AVAILABLE_NOW', 'As soon as possible'],
  ['NEXT_SESSION', 'By the next session'],
  ['SPECIFIC_DATE', 'On a specific date'],
] as const;

export function SeekerWizard() {
  const searchParams = useSearchParams();
  const { profile, ready } = useSession();
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<'YEAR' | 'SESSION'>('YEAR');
  const [institutionId, setInstitutionId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [areas, setAreas] = useState<InstitutionArea[]>([]);
  const [accommodationType, setAccommodationType] = useState('');
  const [accommodationTypeOther, setAccommodationTypeOther] = useState('');
  const [title, setTitle] = useState('');
  const [availabilityType, setAvailabilityType] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [about, setAbout] = useState('');
  const [draftId, setDraftId] = useState(searchParams.get('draft') ?? '');
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    listInstitutions().then(setInstitutions).catch((cause: Error) => setError(cause.message));
  }, []);

  useEffect(() => {
    if (!institutionId) {
      setAreas([]);
      return;
    }
    listAreas(institutionId).then(setAreas).catch((cause: Error) => setError(cause.message));
  }, [institutionId]);

  useEffect(() => {
    if (!ready || !profile) return;
    getDraft().then((draft) => {
      const requestedId = searchParams.get('draft');
      if (!draft || draft.intent !== 'ROOM_NEEDED' || (requestedId && draft.id !== requestedId)) return;
      setDraftId(draft.id);
      setBudget(draft.target_budget_amount ? String(draft.target_budget_amount) : '');
      if (draft.target_budget_period) setBudgetPeriod(draft.target_budget_period);
      setInstitutionId(draft.institution_id ?? '');
      setAreaId(draft.target_area_id ?? draft.area_id ?? '');
      setAccommodationType(draft.accommodation_type ?? '');
      setAccommodationTypeOther(draft.accommodation_type_other ?? '');
      setTitle(draft.title ?? '');
      setAvailabilityType(draft.availability_type ?? '');
      setAvailabilityDate(draft.availability_date ?? '');
      setAbout(draft.about ?? '');
      const preferences = draft.preferences;
      if (preferences) {
        const gender = preferences.roommate_gender === 'MALE' ? 'Male only' : preferences.roommate_gender === 'FEMALE' ? 'Female only' : undefined;
        const utility = typeof preferences.utility_preference === 'string'
          ? preferences.utility_preference
          : undefined;
        setSelected({
          ...(gender ? { 'Roommate gender': gender } : {}),
          ...(typeof preferences.study_atmosphere === 'string' ? { 'Study atmosphere': preferences.study_atmosphere } : {}),
          ...(utility ? { 'Power and utilities': utility } : {}),
          ...(Array.isArray(preferences.lifestyle_traits) && typeof preferences.lifestyle_traits[0] === 'string' ? { 'Daily rhythm': preferences.lifestyle_traits[0] } : {}),
        });
      }
    }).catch((cause: Error) => setError(cause.message));
  }, [ready, profile, searchParams]);

  const draftInput: ListingDraftInput = {
    intent: 'ROOM_NEEDED',
    ...(institutionId ? { institutionId } : {}),
    ...(areaId ? { areaId, targetAreaId: areaId } : {}),
    ...(title.trim() ? { title: title.trim() } : {}),
    ...(accommodationType ? { accommodationType } : {}),
    ...(accommodationType === 'OTHER' && accommodationTypeOther.trim()
      ? { accommodationTypeOther: accommodationTypeOther.trim() }
      : {}),
    ...(budget && Number(budget) > 0 ? { priceAmount: Number(budget), targetBudgetAmount: Number(budget) } : {}),
    pricePeriod: budgetPeriod,
    targetBudgetPeriod: budgetPeriod,
    ...(availabilityType ? { availabilityType: availabilityType as ListingDraftInput['availabilityType'] } : {}),
    availabilityDate: availabilityType === 'SPECIFIC_DATE' ? availabilityDate || null : null,
    ...(about.trim() ? { about: about.trim(), description: about.trim() } : {}),
    preferences: {
      ...(selected['Roommate gender'] === 'Male only' ? { roommateGender: 'MALE' as const } : {}),
      ...(selected['Roommate gender'] === 'Female only' ? { roommateGender: 'FEMALE' as const } : {}),
      ...(selected['Study atmosphere'] ? { studyAtmosphere: selected['Study atmosphere'] } : {}),
      ...(selected['Power and utilities'] ? { utilityPreference: selected['Power and utilities'] } : {}),
      ...(selected['Daily rhythm'] ? { lifestyleTraits: [selected['Daily rhythm']] } : {}),
    },
  };

  function getMissingFields(stepToValidate: number): string[] {
    if (stepToValidate === 0) {
      return [
        ...(!title.trim() ? ['Search title'] : []),
        ...(!institutionId ? ['Institution'] : []),
        ...(!areaId ? ['Target area'] : []),
        ...(!accommodationType ? ['Preferred accommodation'] : []),
        ...(accommodationType === 'OTHER' && !accommodationTypeOther.trim()
          ? ['Describe the accommodation']
          : []),
        ...(!budget || Number(budget) <= 0 ? ['Target budget'] : []),
        ...(!availabilityType ? ['Move-in timing'] : []),
        ...(availabilityType === 'SPECIFIC_DATE' && !availabilityDate
          ? ['Move-in date']
          : []),
      ];
    }
    if (stepToValidate === 1) {
      return preferenceGroups
        .filter(([label]) => !selected[label])
        .map(([label]) => label);
    }
    if (stepToValidate === 2 && !about.trim()) return ['About you'];
    return [];
  }

  function continueToNextStep() {
    const missing = getMissingFields(step);
    setMissingFields(missing);
    setError('');
    if (missing.length) return;
    setStep((current) => current + 1);
  }

  async function persistDraft(): Promise<string> {
    const result = draftId
      ? await updateDraft(draftId, draftInput)
      : await createDraft(draftInput);
    setDraftId(result.id);
    return result.id;
  }

  async function saveDraft() {
    if (!profile) {
      window.location.assign(`/login?next=${encodeURIComponent('/listings/new/room-needed')}`);
      return;
    }
    setPending(true);
    setError('');
    try {
      await persistDraft();
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this draft.');
    } finally {
      setPending(false);
    }
  }

  async function publishListing() {
    if (!profile) {
      window.location.assign(`/login?next=${encodeURIComponent('/listings/new/room-needed')}`);
      return;
    }
    setPending(true);
    setError('');
    const incompleteStep = [0, 1, 2].find((stepToValidate) => getMissingFields(stepToValidate).length > 0);
    if (incompleteStep !== undefined) {
      setStep(incompleteStep);
      setMissingFields(getMissingFields(incompleteStep));
      setPending(false);
      return;
    }
    try {
      const id = await persistDraft();
      await publishDraft(id);
      setPublished(true);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to publish this listing.');
    } finally {
      setPending(false);
    }
  }

  if (ready && profile && !profile.photoUrl) {
    return <><Header /><main className="wizard-page shell"><div className="profile-photo-required"><h1>Add a profile picture to create a listing.</h1><p>Your profile picture will be used as the poster image for your room-needed listing.</p><Link className="button" href={`/profile/complete?next=${encodeURIComponent('/listings/new/room-needed')}`}>Add profile picture</Link></div></main><Footer /></>;
  }

  if (saved) {
    return (
      <>
        <Header />
        <main className="success-page shell">
          <div className="success-icon">✓</div>
          <p className="eyebrow">{published ? 'Room-needed listing published' : 'Room-needed draft saved'}</p>
          <h1>{published ? 'Your search is now visible to potential roommates.' : 'The right room may find you next.'}</h1>
          <p>{published ? 'Students with suitable rooms can now discover your search.' : 'Your progress is saved. Complete your profile when you are ready to publish and become visible to people with suitable rooms.'}</p>
          <div className="success-actions"><Link className="button" href="/profile/listings">Manage my listings</Link><Link className="button button-secondary" href="/browse">Browse rooms</Link></div>
        </main>
        <Footer />
      </>
    );
  }

  const selectedArea = areas.find((area) => area.id === areaId)?.name ?? 'Choose an area';
  const selectedInstitution = institutions.find((institution) => institution.id === institutionId)?.name ?? 'Choose an institution';
  const budgetPeriodLabel = budgetPeriod === 'YEAR' ? 'year' : 'session';

  return (
    <>
      <Header />
      <main className="wizard-page shell">
        <div className="wizard-top">
          <Link className="back-link" href="/listings/new">← Change listing type</Link>
          <div className="progress-steps">{steps.map((item, index) => <button className={index === step ? 'current' : index < step ? 'complete' : ''} key={item} onClick={() => index <= step && setStep(index)}><span>{index + 1}</span>{item}</button>)}</div>
        </div>
        <div className="wizard-layout">
          <div className="wizard-main">
            {step === 0 && <><p className="eyebrow">Step 1 of 4 · Your search</p><h1>Start with what you need.</h1><p className="wizard-lede">A useful room search begins with a budget and a place that works for your everyday.</p><div className="form-card">
              <label>Search title<input maxLength={60} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Looking for a quiet room near campus" /></label>
              <label>Institution<select value={institutionId} onChange={(event) => { setInstitutionId(event.target.value); setAreaId(''); }}><option value="">Choose your institution</option>{institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}</select></label>
              <label>Target area<select value={areaId} onChange={(event) => setAreaId(event.target.value)} disabled={!institutionId}><option value="">Choose an area</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>
              <label>Preferred accommodation<select value={accommodationType} onChange={(event) => setAccommodationType(event.target.value)}><option value="">Choose an accommodation type</option>{accommodationOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              {accommodationType === 'OTHER' && <label>Describe the accommodation<input maxLength={120} value={accommodationTypeOther} onChange={(event) => setAccommodationTypeOther(event.target.value)} placeholder="e.g. Studio apartment" /></label>}
              <div className="split-fields"><label>Target budget<input value={budget} onChange={(event) => setBudget(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="e.g. 250000" /></label><label>Pricing period<select value={budgetPeriod} onChange={(event) => setBudgetPeriod(event.target.value as 'YEAR' | 'SESSION')}><option value="YEAR">Per year</option><option value="SESSION">Per session</option></select></label></div>
              <label>When do you need a place?<select value={availabilityType} onChange={(event) => setAvailabilityType(event.target.value)}><option value="">Choose timing</option>{availabilityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              {availabilityType === 'SPECIFIC_DATE' && <label>Move-in date<input type="date" value={availabilityDate} onChange={(event) => setAvailabilityDate(event.target.value)} /></label>}
            </div></>}
            {step === 1 && <><p className="eyebrow">Step 2 of 4 · Preferences</p><h1>What makes a home work for you?</h1><p className="wizard-lede">There is no perfect answer. Honest preferences help the right people recognise a good fit.</p><div className="form-card">{preferenceGroups.map(([label, options]) => <fieldset key={label}><legend>{label}</legend><div className="chip-options">{options.map((option) => <button className={selected[label] === option ? 'chip selected' : 'chip'} key={option} onClick={() => setSelected((current) => ({ ...current, [label]: option }))} type="button">{option}{selected[label] === option && ' ✓'}</button>)}</div></fieldset>)}</div></>}
            {step === 2 && <><p className="eyebrow">Step 3 of 4 · About you</p><h1>Give a future roommate a reason to say hello.</h1><p className="wizard-lede">A little context makes it easier for people with a room to picture living well together.</p><div className="form-card"><label>About you <small>{about.length}/300</small><textarea maxLength={300} value={about} onChange={(event) => setAbout(event.target.value)} placeholder="Your course, year, routine, or anything that matters in a shared home." /></label><div className="review-note">Your public name will use your first name and last-name initial. Your phone number stays private until an eligible contact handoff.</div></div></>}
            {step === 3 && <><p className="eyebrow">Step 4 of 4 · Final check</p><h1>Make sure it sounds like you.</h1><p className="wizard-lede">This is what people will see when they are looking for someone who might fit their room.</p><div className="seeker-preview"><div className="owner-avatar owner-avatar-large seeker-preview-avatar" style={profile?.photoUrl ? { backgroundImage: `url("${profile.photoUrl}")` } : undefined}>{!profile?.photoUrl && (profile?.firstName?.slice(0, 1) ?? 'A')}</div><div><span className="soft-badge">Looking for a room</span><h2>{title || 'Your search title'}</h2><p>{selectedInstitution} · {selectedArea}</p><p>{accommodationOptions.find(([value]) => value === accommodationType)?.[1] === 'Other' ? accommodationTypeOther || 'Other accommodation' : accommodationOptions.find(([value]) => value === accommodationType)?.[1] ?? 'Preferred accommodation'} · {availabilityType === 'AVAILABLE_NOW' ? 'Looking now' : availabilityType === 'SPECIFIC_DATE' && availabilityDate ? `Looking from ${new Date(`${availabilityDate}T00:00:00`).toLocaleDateString()}` : availabilityOptions.find(([value]) => value === availabilityType)?.[1] ?? 'Move-in timing'}</p><p>Budget · {budget ? `₦${Number(budget).toLocaleString('en-NG')}` : 'Your target budget'} / {budgetPeriodLabel}</p><div className="tag-row">{Object.values(selected).slice(0, 3).map((value) => <span className="tag" key={value}>{value}</span>)}</div><p className="preview-about">{about || 'Your short introduction will appear here.'}</p></div></div></>}
            {missingFields.length > 0 && <div className="wizard-validation" role="alert"><strong>Complete these required items to continue:</strong><ul>{missingFields.map((field) => <li key={field}>{field}</li>)}</ul></div>}
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="wizard-actions"><button className="button button-secondary" disabled={step === 0 || pending} onClick={() => setStep((current) => current - 1)}>← Back</button>{step < 3 ? <button className="button" disabled={pending} onClick={continueToNextStep}>Continue →</button> : <div className="admin-row-actions"><button className="button button-secondary" disabled={pending} onClick={saveDraft}>{pending ? 'Saving…' : 'Save draft'}</button><button className="button" disabled={pending} onClick={publishListing}>{pending ? 'Publishing…' : 'Publish search'}</button></div>}</div>
          </div>
          <aside className="wizard-aside"><div className="aside-card"><p className="eyebrow">Your privacy matters</p><h2>Be visible without oversharing.</h2><p>People can understand your preferences without seeing your phone number or private account details.</p></div><div className="aside-card aside-card-muted"><strong>{step + 1} of 4</strong><span> steps completed in this draft</span><div className="mini-progress"><i style={{ width: `${((step + 1) / 4) * 100}%` }} /></div></div></aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
