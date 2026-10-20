'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/site-chrome';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DraftImage, Institution, InstitutionArea, createDraft, getDraft, listAreas, listInstitutions, ListingDraftInput, publishDraft, removeDraftImage, updateDraft, uploadDraftImage } from '@/lib/frontend-api';
import { useSession } from '@/lib/session';

const steps = ['Details', 'Preferences', 'Photos', 'Review'];
const roomTypes = ['Self-contained', 'Single room in a shared flat', 'Shared room', '2-bedroom flat'];
const preferenceGroups: Array<[string, string[]]> = [
  ['Roommate gender', ['Male only', 'Female only']],
  ['Academic level', ['Undergraduate', 'Postgraduate', 'Any level']],
  ['Study atmosphere', ['Quiet study hours', 'Social and reading friendly', 'Flexible routine']],
  ['Household rhythm', ['Early riser', 'Night owl', 'No strong preference']],
  ['Smoking rule', ['Non-smoking', 'No indoor smoking']],
  ['Utility preference', ['Shared utility costs', 'Utilities included', 'Flexible']],
];

export function ListingWizard() {
  const searchParams = useSearchParams();
  const { profile, ready } = useSession();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [roomType, setRoomType] = useState('SINGLE_ROOM_SHARED_FLAT');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<DraftImage[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [areas, setAreas] = useState<InstitutionArea[]>([]);
  const [institutionId, setInstitutionId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [landmark, setLandmark] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [pricePeriod, setPricePeriod] = useState<'YEAR' | 'SESSION'>('YEAR');
  const [availabilityType, setAvailabilityType] = useState<'AVAILABLE_NOW' | 'NEXT_SESSION' | 'SPECIFIC_DATE'>('AVAILABLE_NOW');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [description, setDescription] = useState('');
  const [draftId, setDraftId] = useState(searchParams.get('draft') ?? '');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [published, setPublished] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    listInstitutions().then(setInstitutions).catch((cause: Error) => setError(cause.message));
  }, []);

  useEffect(() => {
    if (!institutionId && institutions.length === 1) setInstitutionId(institutions[0].id);
  }, [institutionId, institutions]);

  useEffect(() => {
    if (!ready) return;
    if (!profile) return;
    getDraft().then((draft) => {
      if (!draft || draft.intent !== 'ROOM_AVAILABLE' || (searchParams.get('draft') && draft.id !== searchParams.get('draft'))) return;
      setDraftId(draft.id);
      setTitle(draft.title ?? '');
      setInstitutionId(draft.institution_id ?? '');
      setAreaId(draft.area_id ?? '');
      setLandmark(draft.landmark ?? '');
      setRoomType(draft.accommodation_type ?? 'SINGLE_ROOM_SHARED_FLAT');
      setPriceAmount(draft.price_amount ? String(draft.price_amount) : '');
      if (draft.price_period) setPricePeriod(draft.price_period);
      if (draft.availability_type) setAvailabilityType(draft.availability_type);
      setAvailabilityDate(draft.availability_date ?? '');
      setDescription(draft.description ?? '');
      const preferences = draft.preferences;
      if (preferences) {
        const gender = preferences.roommate_gender === 'MALE' ? 'Male only' : preferences.roommate_gender === 'FEMALE' ? 'Female only' : undefined;
        setSelected({
          ...(gender ? { 'Roommate gender': gender } : {}),
          ...(typeof preferences.academic_level === 'string' ? { 'Academic level': preferences.academic_level } : {}),
          ...(typeof preferences.study_atmosphere === 'string' ? { 'Study atmosphere': preferences.study_atmosphere } : {}),
          ...(typeof preferences.smoking_rule === 'string' ? { 'Smoking rule': preferences.smoking_rule } : {}),
          ...(typeof preferences.utility_preference === 'string' ? { 'Utility preference': preferences.utility_preference } : {}),
          ...(Array.isArray(preferences.lifestyle_traits) && typeof preferences.lifestyle_traits[0] === 'string' ? { 'Household rhythm': preferences.lifestyle_traits[0] } : {}),
        });
      }
      if (draft.images) setPhotos(draft.images);
    }).catch((cause: Error) => setError(cause.message));
  }, [ready, profile, searchParams]);

  useEffect(() => {
    if (!institutionId) {
      setAreas([]);
      return;
    }
    listAreas(institutionId).then(setAreas).catch((cause: Error) => setError(cause.message));
  }, [institutionId]);

  const draftInput: ListingDraftInput = {
    intent: 'ROOM_AVAILABLE',
    ...(institutionId ? { institutionId } : {}),
    ...(areaId ? { areaId } : {}),
    ...(landmark.trim() ? { landmark: landmark.trim() } : {}),
    ...(title.trim() ? { title: title.trim() } : {}),
    accommodationType: roomType as ListingDraftInput['accommodationType'],
    ...(priceAmount && Number(priceAmount) > 0 ? { priceAmount: Number(priceAmount) } : {}),
    pricePeriod,
    availabilityType,
    availabilityDate: availabilityType === 'SPECIFIC_DATE' ? availabilityDate || null : null,
    ...(description.trim() ? { description: description.trim() } : {}),
    preferences: {
      ...(selected['Roommate gender'] === 'Male only' ? { roommateGender: 'MALE' as const } : {}),
      ...(selected['Roommate gender'] === 'Female only' ? { roommateGender: 'FEMALE' as const } : {}),
      ...(selected['Study atmosphere'] ? { studyAtmosphere: selected['Study atmosphere'] } : {}),
      ...(selected['Academic level'] ? { academicLevel: selected['Academic level'] } : {}),
      ...(selected['Smoking rule'] ? { smokingRule: selected['Smoking rule'] } : {}),
      ...(selected['Household rhythm'] ? { lifestyleTraits: [selected['Household rhythm']] } : {}),
      ...(selected['Utility preference'] ? { utilityPreference: selected['Utility preference'] } : {}),
    },
  };

  async function persistDraft(): Promise<string> {
    const saved = draftId
      ? await updateDraft(draftId, draftInput)
      : await createDraft(draftInput);
    setDraftId(saved.id);
    return saved.id;
  }

  async function saveDraft() {
    if (!profile) {
      window.location.assign(`/login?next=${encodeURIComponent('/listings/new/room-available')}`);
      return;
    }
    setPending(true);
    setError('');
    try {
      await persistDraft();
      setPublished(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save the draft.');
    } finally {
      setPending(false);
    }
  }

  async function publishListing() {
    if (!profile) {
      window.location.assign(`/login?next=${encodeURIComponent('/listings/new/room-available')}`);
      return;
    }
    setPending(true);
    setError('');
    try {
      const id = await persistDraft();
      await publishDraft(id);
      setIsPublished(true);
      setPublished(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to publish this listing.');
    } finally {
      setPending(false);
    }
  }

  async function uploadPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;
    if (photos.length + files.length > 5) {
      setError('A listing can have no more than five photos.');
      return;
    }
    if (!profile) {
      window.location.assign(`/login?next=${encodeURIComponent('/listings/new/room-available')}`);
      return;
    }
    setPending(true);
    setError('');
    try {
      const id = await persistDraft();
      const uploaded: DraftImage[] = [];
      const firstPosition = Math.max(0, ...photos.map((photo) => photo.position)) + 1;
      for (const [index, file] of files.entries()) {
        uploaded.push(await uploadDraftImage(id, file, firstPosition + index));
      }
      setPhotos((current) => [...current, ...uploaded]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to upload photos.');
    } finally {
      setPending(false);
    }
  }

  async function removePhoto(photo: DraftImage) {
    if (!draftId) return;
    setPending(true);
    setError('');
    try {
      await removeDraftImage(draftId, photo.id);
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to remove this photo.');
    } finally {
      setPending(false);
    }
  }

  if (published) return <><Header /><main className="success-page shell"><div className="success-icon">✓</div><p className="eyebrow">{isPublished ? 'Listing published' : 'Draft saved'}</p><h1>{isPublished ? 'Your listing is now available to students.' : 'Your draft is ready for your next step.'}</h1><p>{isPublished ? 'Students can now find your listing in discovery. You can manage it from My listings.' : 'We have saved your progress. Return to My listings whenever you are ready to continue.'}</p><div className="success-actions"><Link className="button" href="/profile/listings">Manage my listings</Link><Link className="button button-secondary" href="/browse">Browse rooms</Link></div></main><Footer /></>;
  return <><Header /><main className="wizard-page shell"><div className="wizard-top"><Link className="back-link" href="/">← Back home</Link><div className="progress-steps">{steps.map((item, index) => <button className={index === step ? 'current' : index < step ? 'complete' : ''} key={item} onClick={() => index <= step && setStep(index)}><span>{index + 1}</span>{item}</button>)}</div></div><div className="wizard-layout"><div className="wizard-main">
    {step === 0 && <><p className="eyebrow">Step 1 of 4 · Listing details</p><h1>Tell us about the room.</h1><p className="wizard-lede">The small details help someone decide whether this could be the right fit for their everyday.</p><div className="form-card"><label>Listing title <small>{title.length}/60</small><input maxLength={60} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Self-contained near Camp" /></label><label>Institution<select value={institutionId} onChange={(event) => { setInstitutionId(event.target.value); setAreaId(''); }}><option value="">Choose an institution</option>{institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}</select></label><label>Area<select value={areaId} onChange={(event) => setAreaId(event.target.value)} disabled={!institutionId}><option value="">Choose an area</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label><label>Nearby landmark<input maxLength={160} value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="Optional landmark or directions" /></label><fieldset><legend>Room type</legend><div className="choice-grid">{roomTypes.map((type, index) => { const value = ['SELF_CONTAINED', 'SINGLE_ROOM_SHARED_FLAT', 'SHARED_ROOM', 'TWO_BEDROOM_FLAT'][index]; return <button className={roomType === value ? 'choice selected' : 'choice'} key={type} onClick={() => setRoomType(value)} type="button"><strong>{type}</strong><span>{type === 'Self-contained' ? 'Private bath & kitchen' : 'A practical shared arrangement'}</span></button>; })}</div></fieldset><div className="split-fields"><label>Price amount<input value={priceAmount} onChange={(event) => setPriceAmount(event.target.value.replace(/\\D/g, ''))} inputMode="numeric" placeholder="e.g. 250000" /></label><label>Pricing period<select value={pricePeriod} onChange={(event) => setPricePeriod(event.target.value as 'YEAR' | 'SESSION')}><option value="YEAR">Per year</option><option value="SESSION">Per session</option></select></label></div><label>Availability<select value={availabilityType} onChange={(event) => setAvailabilityType(event.target.value as typeof availabilityType)}><option value="AVAILABLE_NOW">Available now</option><option value="NEXT_SESSION">Next session</option><option value="SPECIFIC_DATE">Specific date</option></select></label>{availabilityType === 'SPECIFIC_DATE' && <label>Available from<input type="date" value={availabilityDate} onChange={(event) => setAvailabilityDate(event.target.value)} /></label>}<label>Description <small>{description.length}/500</small><textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should someone know before they come to see it?" /></label></div></>}
    {step === 1 && <><p className="eyebrow">Step 2 of 4 · Living preferences</p><h1>Who would make a good fit?</h1><p className="wizard-lede">There is no perfect roommate. There is a better fit for the way you actually live.</p><div className="form-card">{preferenceGroups.map(([label, options]) => <fieldset key={label}><legend>{label}</legend><div className="chip-options">{options.map((option) => <button className={selected[label] === option ? 'chip selected' : 'chip'} key={option} onClick={() => setSelected((current) => ({ ...current, [label]: option }))} type="button">{option}{selected[label] === option && ' ✓'}</button>)}</div></fieldset>)}<label>Anything else someone should know? <small>Optional</small><textarea maxLength={500} placeholder="Quiet after 10pm? Cooking often? Tell them what makes the home work." /></label></div></>}
    {step === 2 && <><p className="eyebrow">Step 3 of 4 · Photos</p><h1>Show people the space.</h1><p className="wizard-lede">A few honest photos can answer the questions a listing card cannot. Add at least 3 and up to 5.</p><div className="form-card photo-uploader"><label className="upload-box"><span>＋</span><strong>{pending ? 'Uploading…' : 'Add photos'}</strong><small>JPEG, PNG, or WebP · up to 5 MB each</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={pending || photos.length >= 5} onChange={uploadPhotos} /></label><div className="photo-count">{photos.length} of 5 photos added</div><div className="photo-grid">{photos.map((photo, index) => <div className="uploaded-photo" key={photo.id} style={{ backgroundImage: `url("${photo.url}")` }}><span>{index === 0 ? 'Cover photo' : `Photo ${index + 1}`}</span><button className="photo-remove" type="button" disabled={pending} onClick={() => removePhoto(photo)} aria-label={`Remove photo ${index + 1}`}>×</button></div>)}</div></div></>}
    {step === 3 && <><p className="eyebrow">Step 4 of 4 · Final check</p><h1>Review your listing.</h1><p className="wizard-lede">Read it once as someone who has never seen the place. Does it tell them enough to take the next step?</p><div className="review-card"><div className="review-photo" style={photos[0] ? { backgroundImage: `url("${photos[0].url}")` } : undefined} /><div className="review-copy"><span className="soft-badge">{roomTypes[['SELF_CONTAINED', 'SINGLE_ROOM_SHARED_FLAT', 'SHARED_ROOM', 'TWO_BEDROOM_FLAT'].indexOf(roomType)] ?? roomType}</span><h2>{title || 'Your listing title'}</h2><p>{institutions.find((item) => item.id === institutionId)?.name ?? 'Institution'} · {areas.find((item) => item.id === areaId)?.name ?? 'Area'}{landmark ? ` · ${landmark}` : ''}</p><strong>{priceAmount ? `₦${Number(priceAmount).toLocaleString('en-NG')}` : 'Price not set'} <small>/ {pricePeriod.toLowerCase()}</small></strong><div className="tag-row">{Object.values(selected).map((value) => <span className="tag" key={value}>{value}</span>)}</div></div></div><div className="review-note">Your contact details stay private. Eligible students will reach you through the WhatsApp handoff.</div></>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="wizard-actions"><button className="button button-secondary" disabled={step === 0 || pending} onClick={() => setStep((current) => current - 1)}>← Back</button>{step < 3 ? <button className="button" disabled={pending} onClick={() => setStep((current) => current + 1)}>Continue →</button> : <div className="admin-row-actions"><button className="button button-secondary" disabled={pending} onClick={saveDraft}>{pending ? 'Saving…' : 'Save draft'}</button><button className="button" disabled={pending} onClick={publishListing}>{pending ? 'Publishing…' : 'Publish listing'}</button></div>}</div>
  </div><aside className="wizard-aside"><div className="aside-card"><p className="eyebrow">A useful rule</p><h2>Clarity feels welcoming.</h2><p>Someone should be able to understand the cost, location, room type, and living rhythm before they ever message you.</p></div><div className="aside-card aside-card-muted"><strong>{step + 1} of 4</strong><span> steps completed in this draft</span><div className="mini-progress"><i style={{ width: `${((step + 1) / 4) * 100}%` }} /></div></div></aside></div></main><Footer /></>;
}
