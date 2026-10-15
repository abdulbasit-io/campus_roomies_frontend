'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Footer, Header } from '@/components/site-chrome';

const steps = ['Your search', 'Preferences', 'About you', 'Review'];
const preferenceGroups: Array<[string, string[]]> = [
  ['Roommate gender', ['Any preference', 'Male only', 'Female only']],
  ['Study atmosphere', ['Quiet study hours', 'Social and reading friendly', 'Flexible routine']],
  ['Power and utilities', ['Reliable power matters', 'Flexible about utilities', 'I can share costs']],
  ['Daily rhythm', ['Early riser', 'Night owl', 'No strong preference']],
];

export function SeekerWizard() {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState('');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [about, setAbout] = useState('');
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <>
        <Header />
        <main className="success-page shell">
          <div className="success-icon">✓</div>
          <p className="eyebrow">Room-needed draft saved</p>
          <h1>The right room may find you next.</h1>
          <p>Your preferences are ready. Complete your profile when you are ready to publish and become visible to people with suitable rooms.</p>
          <div className="success-actions"><Link className="button" href="/browse">Browse rooms</Link><Link className="button button-secondary" href="/">Back home</Link></div>
        </main>
        <Footer />
      </>
    );
  }

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
            {step === 0 && <><p className="eyebrow">Step 1 of 4 · Your search</p><h1>Start with what you need.</h1><p className="wizard-lede">A useful room search begins with a budget and a place that works for your everyday.</p><div className="form-card"><label>Institution<select defaultValue="initial"><option value="initial">Choose your institution</option><option>Federal University of Agriculture, Abeokuta</option></select></label><label>Target area or landmark<input placeholder="Camp, Harmony, near the main gate..." /></label><div className="split-fields"><label>Target budget<input value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="numeric" placeholder="e.g. 250000" /></label><label>Pricing period<select defaultValue="YEAR"><option value="YEAR">Per year</option><option value="SESSION">Per session</option></select></label></div><label>When do you need a place?<select defaultValue="NEXT_SESSION"><option value="NOW">As soon as possible</option><option value="NEXT_SESSION">By the next session</option><option value="FLEXIBLE">I am flexible</option></select></label></div></>}
            {step === 1 && <><p className="eyebrow">Step 2 of 4 · Preferences</p><h1>What makes a home work for you?</h1><p className="wizard-lede">There is no perfect answer. Honest preferences help the right people recognise a good fit.</p><div className="form-card">{preferenceGroups.map(([label, options]) => <fieldset key={label}><legend>{label}</legend><div className="chip-options">{options.map((option) => <button className={selected[label] === option ? 'chip selected' : 'chip'} key={option} onClick={() => setSelected((current) => ({ ...current, [label]: option }))} type="button">{option}{selected[label] === option && ' ✓'}</button>)}</div></fieldset>)}</div></>}
            {step === 2 && <><p className="eyebrow">Step 3 of 4 · About you</p><h1>Give a future roommate a reason to say hello.</h1><p className="wizard-lede">A little context makes it easier for people with a room to picture living well together.</p><div className="form-card"><label>About you <small>{about.length}/300</small><textarea maxLength={300} value={about} onChange={(event) => setAbout(event.target.value)} placeholder="Your course, year, routine, or anything that matters in a shared home." /></label><div className="review-note">Your public name will use your first name and last-name initial. Your phone number stays private until an eligible contact handoff.</div></div></>}
            {step === 3 && <><p className="eyebrow">Step 4 of 4 · Final check</p><h1>Make sure it sounds like you.</h1><p className="wizard-lede">This is what people will see when they are looking for someone who might fit their room.</p><div className="seeker-preview"><div className="owner-avatar owner-avatar-large">A</div><div><span className="soft-badge">Looking for a room</span><h2>Student looking for a thoughtful shared home</h2><p>Target area · Your selected area</p><p>Budget · {budget || 'Your target budget'} / year</p><div className="tag-row">{Object.values(selected).slice(0, 3).map((value) => <span className="tag" key={value}>{value}</span>)}</div><p className="preview-about">{about || 'Your short introduction will appear here.'}</p></div></div></>}
            <div className="wizard-actions"><button className="button button-secondary" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>← Back</button>{step < 3 ? <button className="button" onClick={() => setStep((current) => current + 1)}>Continue →</button> : <button className="button" onClick={() => setSaved(true)}>Save draft &amp; finish later</button>}</div>
          </div>
          <aside className="wizard-aside"><div className="aside-card"><p className="eyebrow">Your privacy matters</p><h2>Be visible without oversharing.</h2><p>People can understand your preferences without seeing your phone number or private account details.</p></div><div className="aside-card aside-card-muted"><strong>{step + 1} of 4</strong><span> steps completed in this draft</span><div className="mini-progress"><i style={{ width: `${((step + 1) / 4) * 100}%` }} /></div></div></aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
