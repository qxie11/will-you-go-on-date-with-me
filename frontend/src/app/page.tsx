'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AppConfig, FoodItem, FlowerItem, DateItem, DateResponse } from '@/types';
import { sound } from '@/lib/sound';
import { getConfetti } from '@/lib/confetti';
import { useTranslation } from 'react-i18next';



export default function DatePage() {
  const { t, i18n } = useTranslation();

  const [step, setStep] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateItem | null>(null);
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [note, setNote] = useState<string>('');
  
  // Dodging button state
  const [noPos, setNoPos] = useState<{ x: number; y: number; rot: number }>({ x: 0, y: 0, rot: 0 });
  const [noIndex, setNoIndex] = useState<number>(0);
  
  // Audio & Theme
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<string>('rose-champagne');
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Check subdomain (injected via layout.tsx)
    const win = window as any;
    const locale = win.__LOCALE__ || 'ru';
    const subdomain = win.__SUBDOMAIN__ || 'default';

    // Load config from backend
    fetch(`/api/config?id=${subdomain}&lang=${locale}&t=${Date.now()}`)
      .then((res) => res.json())
      .then((data: AppConfig) => {
        setConfig(data);
        if (data.general?.theme) {
          applyTheme(data.general.theme);
        }
        if (data.general?.language) {
          i18n.changeLanguage(data.general.language);
        }
        if (data.general?.partnerName && data.general.partnerName.trim() !== '') {
          setPartnerName(data.general.partnerName.trim());
        }
        setIsLoaded(true);
      })
      .catch((err) => {
        console.warn('Could not fetch config:', err);
        setIsLoaded(true);
      });

    // Check query params for custom name e.g. ?to=Kate or ?name=Anna
    const params = new URLSearchParams(window.location.search);
    let to = params.get('to') || params.get('name');

    if (!to && win.__SUBDOMAIN__) {
      // capitalize first letter
      to = win.__SUBDOMAIN__.charAt(0).toUpperCase() + win.__SUBDOMAIN__.slice(1);
    }
    
    if (to) {
      setPartnerName(to);
    }

    const t = params.get('theme');
    if (t) {
      applyTheme(t);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const applyTheme = (themeName: string) => {
    setTheme(themeName);
    if (themeName === 'cozy') {
      document.body.setAttribute('data-theme', 'cozy');
    } else if (themeName === 'midnight') {
      document.body.setAttribute('data-theme', 'midnight');
    } else {
      document.body.removeAttribute('data-theme');
    }
  };

  // Dodging "No" button handler
  const handleNoDodge = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    sound.dodge();

    const dodgeTexts = t('public.dodgingButtons', { returnObjects: true }) as string[];
    setNoIndex((prev) => Math.min(prev + 1, dodgeTexts.length - 1));
    const maxOffset = Math.min(window.innerWidth * 0.35, 180);
    const x = (Math.random() - 0.5) * (maxOffset * 2);
    const y = (Math.random() - 0.5) * (maxOffset * 1.5);
    const rot = (Math.random() - 0.5) * 20;

    setNoPos({ x, y, rot });

    const confetti = getConfetti();
    if (confetti) {
      const clientX = 'clientX' in e ? (e as React.MouseEvent).clientX : (e as React.TouchEvent).touches[0]?.clientX || window.innerWidth / 2;
      const clientY = 'clientY' in e ? (e as React.MouseEvent).clientY : (e as React.TouchEvent).touches[0]?.clientY || window.innerHeight / 2;
      confetti.burst({ x: clientX, y: clientY, count: 12 });
    }
  };

  // Yes button handler
  const handleYes = (e: React.MouseEvent<HTMLButtonElement>) => {
    sound.sparkle();
    const rect = e.currentTarget.getBoundingClientRect();
    const confetti = getConfetti();
    confetti?.burst({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      count: 60,
    });
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit answers to NestJS backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      partnerName: partnerName || config?.general?.partnerName || '',
      food: selectedFood ? { id: selectedFood.id, title: selectedFood.title } : undefined,
      flowers: selectedFlowers ? { id: selectedFlowers.id, title: selectedFlowers.title } : undefined,
      date: selectedDate ? { id: selectedDate.id, label: selectedDate.label } : undefined,
      customDateTime,
      contact,
      note,
    };

    try {
      await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to submit response:', err);
    } finally {
      setSubmitting(false);
      setStep(6);
      sound.celebrate();
      const confetti = getConfetti();
      confetti?.burst({ count: 140 });
      setTimeout(() => confetti?.burst({ count: 80 }), 400);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Download .ics calendar file
  const downloadCalendar = () => {
    const title = `Date with ${partnerName || t('admin.misc.myFavorite')} 💖`;
    const desc = `Food: ${selectedFood?.title || t('admin.misc.tbd')}\\nFlowers: ${selectedFlowers?.title || t('admin.misc.tbd')}\\nNotes: ${note || t('admin.misc.none')}`;
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Date App//Special Invitation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'our-date.ics';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Calendar invite downloaded! 🗓️');
  };

  // Copy plan
  const copyPlan = () => {
    const text = `Our Date Plan 💖:\n🍽️ ${t('public.step6.summary.food')}: ${selectedFood?.title || t('public.step6.summary.surpriseMe')}\n💐 ${t('public.step6.summary.flowers')}: ${selectedFlowers?.title || t('public.step6.summary.surpriseMe')}\n🗓️ ${t('public.step6.summary.when')}: ${selectedDate?.label || t('public.step6.summary.surpriseMe')} ${customDateTime ? `(${customDateTime})` : ''}\n💌 ${t('public.step6.summary.note')}: ${note || ''}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Date plan copied to clipboard! 📋✨');
    });
  };

  // Foods and flowers fallback if config not yet loaded
  const foodsList: FoodItem[] = config?.foods?.length
    ? config.foods
    : [
        { id: 'pasta', title: t('public.defaultFoods.pastaTitle'), subtitle: t('public.defaultFoods.pastaSub'), image: '/images/food_pasta.jpg' },
        { id: 'sushi', title: t('public.defaultFoods.sushiTitle'), subtitle: t('public.defaultFoods.sushiSub'), image: '/images/food_sushi.jpg' },
        { id: 'tacos', title: t('public.defaultFoods.tacosTitle'), subtitle: t('public.defaultFoods.tacosSub'), image: '/images/food_tacos.jpg' },
        { id: 'pizza', title: t('public.defaultFoods.pizzaTitle'), subtitle: t('public.defaultFoods.pizzaSub'), image: '/images/food_pizza.jpg' },
      ];

  const flowersList: FlowerItem[] = config?.flowers?.length
    ? config.flowers
    : [
        { id: 'pink_peonies', title: t('public.defaultFlowers.pinkTitle'), subtitle: t('public.defaultFlowers.pinkSub'), image: '/images/flowers_pink.jpg' },
        { id: 'white_tulips', title: t('public.defaultFlowers.yellowTitle'), subtitle: t('public.defaultFlowers.yellowSub'), image: '/images/flowers_white.jpg' },
        { id: 'blue_hydrangeas', title: t('public.defaultFlowers.blueTitle'), subtitle: t('public.defaultFlowers.blueSub'), image: '/images/flowers_blue.jpg' },
        { id: 'red_roses', title: t('public.defaultFlowers.redTitle'), subtitle: t('public.defaultFlowers.redSub'), image: '/images/flowers_red.jpg' },
      ];

  const datesList: DateItem[] = config?.dates?.length
    ? config.dates
    : [
        { id: 'friday_night', label: t('public.defaultDates.fridayLabel'), sublabel: t('public.defaultDates.fridaySub') },
        { id: 'saturday_eve', label: t('public.defaultDates.saturdayLabel'), sublabel: t('public.defaultDates.saturdaySub') },
        { id: 'sunday_brunch', label: t('public.defaultDates.sundayLabel'), sublabel: t('public.defaultDates.sundaySub') },
        { id: 'custom', label: t('public.defaultDates.customLabel'), sublabel: t('public.defaultDates.customSub') },
      ];

  const progressPercent = step <= 5 ? (step / 5) * 100 : 100;
  const proposalTitle = partnerName
    ? `${partnerName}, ${config?.general?.proposalTitle || t('public.proposalDefault')}`
    : config?.general?.proposalTitle || t('public.proposalDefault');

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '3rem', animation: 'pulse 1.5s infinite' }}>
        💖
      </div>
    );
  }

  return (
    <>
      {/* Ambient background glows */}
      <div className="ambient-glow blob-1" />
      <div className="ambient-glow blob-2" />
      <div className="ambient-glow blob-3" />

      {/* Floating Controls */}
      <div className="top-controls">
        <button
          className="ctrl-btn"
          title="Toggle audio effects"
          onClick={() => {
            const next = sound.toggle();
            setSoundEnabled(next);
            showToast(next ? t('public.controls.soundOn') : t('public.controls.soundOff'));
          }}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        <div className="theme-dropdown">
          <button
            className="ctrl-btn"
            title="Switch aesthetic theme"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
          >
            🎨
          </button>
          {showThemeMenu && (
            <div className="theme-menu show">
              <button
                className="theme-option"
                onClick={() => {
                  applyTheme('rose-champagne');
                  setShowThemeMenu(false);
                  showToast(t('public.controls.themeRose'));
                }}
              >
                🌸 Rose Champagne
              </button>
              <button
                className="theme-option"
                onClick={() => {
                  applyTheme('cozy');
                  setShowThemeMenu(false);
                  showToast(t('public.controls.themeCozy'));
                }}
              >
                🧸 Cozy Editorial
              </button>
              <button
                className="theme-option"
                onClick={() => {
                  applyTheme('midnight');
                  setShowThemeMenu(false);
                  showToast(t('public.controls.themeMidnight'));
                }}
              >
                🌌 Midnight Twilight
              </button>
            </div>
          )}
        </div>

        <Link href="/admin" className="ctrl-btn" title="Admin Panel">
          ⚙️
        </Link>
      </div>

      {/* Top Header Progress Bar */}
      <header className="app-header">
        <div className="progress-meta">
          <span className="meta-badge">{config?.general?.topBadgeText || t('public.metaBadge')}</span>
          <span className="meta-step-label">
            {step <= 5 ? t('public.stepLabel', { step }) : t('public.allDone')}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* STEP 1: Proposal Screen */}
        {step === 1 && (
          <div className="step-pane active">
            <div className="hero-wrapper">
              <span className="handwritten-annotation note-top-left"> {t('public.important')} </span>
              <div className="hero-polaroid">
                <img src="/images/hero_cat.jpg" alt="Cute Kitten" />
              </div>
            </div>

            <div className="note-sub">{config?.general?.shyNoteText || t('public.shyNote')}</div>
            <h1 className="proposal-heading">{proposalTitle}</h1>
            <p className="proposal-subtitle">
              {config?.general?.proposalSubtitle || t('public.subtitle')}
            </p>

            <div className="action-buttons-zone">
              <button className="btn-yes" onClick={handleYes}>
                {config?.general?.yesButtonText || t('public.yesButton')}
              </button>

              <button
                className="btn-no"
                style={{
                  transform: `translate(${noPos.x}px, ${noPos.y}px) rotate(${noPos.rot}deg)`,
                }}
                onMouseEnter={handleNoDodge}
                onTouchStart={handleNoDodge}
                onClick={handleNoDodge}
              >
                {(t('public.dodgingButtons', { returnObjects: true }) as string[])[noIndex]}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Food Choices */}
        {step === 2 && (
          <div className="step-pane active">
            <div className="step-header">
              <div className="step-pretitle"> {t('public.step2.pretitle')} </div>
              <h2 className="step-title"> {t('public.step2.title')} </h2>
              <div className="step-desc"> {t('public.step2.desc')} </div>
            </div>

            <div className="choices-grid">
              {foodsList.map((item) => {
                const isSelected = selectedFood?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      sound.pop();
                      setSelectedFood(item);
                    }}
                  >
                    <div className="card-thumb">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="card-content">
                      <div className="card-title">{item.title}</div>
                      <div className="card-sub">{item.subtitle}</div>
                      <div className="card-pick-badge">
                        {isSelected ? t('public.step2.yesThisOne') : t('public.step2.pickMe')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="step-nav">
              <button className="btn-back" onClick={() => setStep(1)}> {t('public.step2.back')} </button>
              <button
                className="btn-next"
                disabled={!selectedFood}
                onClick={() => {
                  sound.pop();
                  setStep(3);
                }}
              > {t('public.step2.next')} </button>
            </div>
          </div>
        )}

        {/* STEP 3: Flower Choices */}
        {step === 3 && (
          <div className="step-pane active">
            <div className="step-header">
              <div className="step-pretitle"> {t('public.step3.pretitle')} </div>
              <h2 className="step-title"> {t('public.step3.title')} </h2>
              <div className="step-desc"> {t('public.step3.desc')} </div>
            </div>

            <div className="choices-grid">
              {flowersList.map((item) => {
                const isSelected = selectedFlowers?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      sound.pop();
                      setSelectedFlowers(item);
                    }}
                  >
                    <div className="card-thumb">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="card-content">
                      <div className="card-title">{item.title}</div>
                      <div className="card-sub">{item.subtitle}</div>
                      <div className="card-pick-badge">
                        {isSelected ? t('public.step3.theseArePerfect') : t('public.step2.pickMe')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="step-nav">
              <button className="btn-back" onClick={() => setStep(2)}> {t('public.step2.back')} </button>
              <button
                className="btn-next"
                disabled={!selectedFlowers}
                onClick={() => {
                  sound.pop();
                  setStep(4);
                }}
              > {t('public.step2.next')} </button>
            </div>
          </div>
        )}

        {/* STEP 4: Date Selection */}
        {step === 4 && (
          <div className="step-pane active">
            <div className="step-header">
              <div className="step-pretitle"> {t('public.step4.pretitle')} </div>
              <h2 className="step-title"> {t('public.step4.title')} </h2>
              <div className="step-desc"> {t('public.step4.desc')} </div>
            </div>

            <div className="dates-grid">
              {datesList.map((item) => {
                const isSelected = selectedDate?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`date-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      sound.pop();
                      setSelectedDate(item);
                    }}
                  >
                    <div className="date-title">
                      <span>{item.label}</span>
                      <span>🗓️</span>
                    </div>
                    <div className="date-sub">{item.sublabel}</div>
                  </div>
                );
              })}
            </div>

            {selectedDate?.id === 'custom' && (
              <div className="custom-date-box">
                <label> {t('public.step4.customLabel')} </label>
                <input
                  type="text"
                  className="custom-date-input"
                  placeholder={t('public.step4.customPlaceholder')}
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                />
              </div>
            )}

            <div className="step-nav">
              <button className="btn-back" onClick={() => setStep(3)}> {t('public.step2.back')} </button>
              <button
                className="btn-next"
                disabled={!selectedDate}
                onClick={() => {
                  sound.pop();
                  setStep(5);
                }}
              > {t('public.step2.next')} </button>
            </div>
          </div>
        )}

        {/* STEP 5: Contact & Final Wishes */}
        {step === 5 && (
          <div className="step-pane active">
            <div className="step-header">
              <div className="step-pretitle"> {t('public.step5.pretitle')} </div>
              <h2 className="step-title"> {t('public.step5.title')} </h2>
              <div className="step-desc"> {t('public.step5.desc')} </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label> {t('public.step5.phoneLabel')} </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder={t('public.step5.phonePlaceholder')}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label> {t('public.step5.noteLabel')} </label>
                <textarea
                  className="form-textarea"
                  placeholder={t('public.step5.notePlaceholder')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="step-nav">
                <button type="button" className="btn-back" onClick={() => setStep(4)}> {t('public.step2.back')} </button>
                <button type="submit" className="btn-next" disabled={submitting || !contact}>
                  {submitting ? t('public.step5.sending') : t('public.step5.send')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 6: Confirmation Screen */}
        {step === 6 && (
          <div className="step-pane active">
            <div className="confirmation-wrapper">
              <div className="celebrate-polaroid">
                <img src="/images/celebrate_cat.jpg" alt="Celebration Cat" />
              </div>

              <h2 className="confirm-heading"> {t('public.step6.success')} </h2>
              <div className="confirm-handwritten"> {t('public.step6.happiest')} </div>

              <div className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">🍽️ Food</span>
                  <span className="summary-val">{selectedFood?.title || t('public.step6.summary.surpriseMe')}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">💐 Flowers</span>
                  <span className="summary-val">{selectedFlowers?.title || t('public.step6.summary.surpriseMe')}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">🗓️ When</span>
                  <span className="summary-val">
                    {selectedDate?.label} {customDateTime ? `(${customDateTime})` : ''}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">📱 Contact</span>
                  <span className="summary-val">{contact}</span>
                </div>
                {note && (
                  <div className="summary-item">
                    <span className="summary-label">💌 Note</span>
                    <span className="summary-val">{note}</span>
                  </div>
                )}
              </div>

              <div className="confirm-actions">
                <button className="btn-secondary" onClick={downloadCalendar}>
                  <span>🗓️</span> {t('public.step6.addToCalendar')}
                </button>
                <button className="btn-secondary" onClick={copyPlan}>
                  <span>📋</span> {t('public.step6.copyPlan')}
                </button>
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  <span>🔄</span> {t('public.step6.startOver')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMsg && <div className="toast-msg">{toastMsg}</div>}
    </>
  );
}
