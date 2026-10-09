'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppConfig, DateResponse, FoodItem, FlowerItem, DateItem } from '@/types';
import { useTranslation } from 'react-i18next';

export default function AdminPage() {
  const { t } = useTranslation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'responses' | 'settings' | 'share'>('responses');
  const [responses, setResponses] = useState<DateResponse[]>([]);
  const [stats, setStats] = useState<{ totalResponses: number; topFood: string; topFlower: string } | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string>('default');
  const [settingsLang, setSettingsLang] = useState<string>('ru');
  const [profiles, setProfiles] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/config/profiles')
        .then(res => res.json())
        .then(data => setProfiles(data))
        .catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__SUBDOMAIN__) {
        setSettingsId(win.__SUBDOMAIN__);
      }
    }
  }, []);
  
  // Custom share link builder
  const [shareName, setShareName] = useState<string>('');
  const [shareLang, setShareLang] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    // Check if token exists in session
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin;
      const host = window.location.host.replace(/^www\./, '');
      const protocol = window.location.protocol;
      
      let url = base;
      if (shareName.trim()) {
        // If we are on localhost, we can easily prepend the name
        // E.g. localhost:3000 -> anna.localhost:3000
        const cleanName = shareName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        url = `${protocol}//${cleanName}.${host}`;
      }
      
      if (shareLang && shareLang !== 'ru') {
        url += `?lang=${shareLang}`;
      }
      
      setShareUrl(url);
    }
  }, [shareName, shareLang]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`/api/config?id=${settingsId}&lang=${settingsLang}`)
        .then(res => res.json())
        .then(data => setConfig(data))
        .catch(err => console.error(err));
    }
  }, [settingsId, settingsLang, isAuthenticated]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        fetchData();
      } else {
        setAuthError(data.message || t('admin.dashboard') + ' (Error)');
      }
    } catch {
      setAuthError(t('admin.toasts.errorConnect'));
    }
  };

  const fetchData = async () => {
    try {
      const [resResp, statsResp, cfgResp] = await Promise.all([
        fetch('/api/responses'),
        fetch('/api/responses/stats'),
        fetch(`/api/config?id=${settingsId}&lang=${settingsLang}`),
      ]);

      if (resResp.ok) setResponses(await resResp.json());
      if (statsResp.ok) setStats(await statsResp.json());
      if (cfgResp.ok) setConfig(await cfgResp.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/responses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setResponses((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        showToast(`Status updated to "${status}"`);
      }
    } catch {
      showToast(t('admin.toasts.errorUpdate'));
    }
  };

  const deleteResponse = async (id: string) => {
    if (!confirm(t('admin.confirm.delete'))) return;
    try {
      const res = await fetch(`/api/responses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResponses((prev) => prev.filter((r) => r.id !== id));
        showToast(t('admin.toasts.deleted'));
      }
    } catch {
      showToast('Failed to delete response');
    }
  };

  const clearAllResponses = async () => {
    if (!confirm(t('admin.confirm.clear'))) return;
    try {
      const res = await fetch('/api/responses', { method: 'DELETE' });
      if (res.ok) {
        setResponses([]);
        showToast(t('admin.toasts.cleared'));
      }
    } catch {
      showToast(t('admin.toasts.errorClear'));
    }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      const res = await fetch(`/api/config?id=${settingsId}&lang=${settingsLang}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        showToast(t('admin.toasts.saved'));
      } else {
        showToast(t('admin.toasts.errorSave'));
      }
    } catch {
      showToast(t('admin.toasts.errorSave'));
    }
  };

  // Login Modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}> {t('admin.dashboard')} </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            {t('admin.desc')}
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              required
              className="form-input"
              placeholder={t('admin.passPlaceholder')}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            {authError && <div style={{ color: '#ff3366', fontSize: '13px', fontWeight: 600 }}>{authError}</div>}
            <button type="submit" className="btn-next" style={{ width: '100%', marginTop: '6px' }}> {t('admin.unlock')} </button>
            <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'underline', marginTop: '10px' }}> {t('admin.return')} </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Top Admin Header */}
      <div className="admin-header">
        <div className="admin-title-box">
          <h1> {t('admin.title')} </h1>
          <p> {t('admin.subtitle')} </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/" target="_blank" className="btn-secondary"> {t('admin.openPublic')} </Link>
          <button
            className="btn-secondary"
            onClick={() => {
              sessionStorage.removeItem('adminToken');
              setIsAuthenticated(false);
            }}
          > {t('admin.logout')} </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-number">{responses.length}</div>
          <div className="stat-label"> {t('admin.stats.total')} </div>
        </div>
        <div className="stat-card">
          <div className="stat-number">100%</div>
          <div className="stat-label"> {t('admin.stats.yes')} </div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ fontSize: '20px' }}>
            {stats?.topFood || 'Pasta / Sushi'}
          </div>
          <div className="stat-label"> {t('admin.stats.topFood')} </div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ fontSize: '20px' }}>
            {stats?.topFlower || 'Pink Peonies'}
          </div>
          <div className="stat-label"> {t('admin.stats.topFlower')} </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'responses' ? 'active' : ''}`}
          onClick={() => setActiveTab('responses')}
        > 💌 {t('admin.tabs.inbox')} ({responses.length}) </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        > {t('admin.tabs.settings')} </button>
        <button
          className={`tab-btn ${activeTab === 'share' ? 'active' : ''}`}
          onClick={() => setActiveTab('share')}
        > {t('admin.tabs.share')} </button>
      </div>

      {/* TAB 1: Responses Inbox */}
      {activeTab === 'responses' && (
        <div className="admin-card">
          <div className="admin-card-title">
            <span> {t('admin.inbox.title')} </span>
            {responses.length > 0 && (
              <button
                className="btn-action-sm"
                style={{ color: '#ff3366', borderColor: 'rgba(255,51,102,0.4)' }}
                onClick={clearAllResponses}
              > {t('admin.inbox.clearAll')} </button>
            )}
          </div>

          {responses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}> {t('admin.inbox.empty')} </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="responses-table">
                <thead>
                  <tr>
                    <th> {t('admin.inbox.thDate')} </th>
                    <th> {t('admin.inbox.thPartner')} </th>
                    <th> {t('admin.inbox.thContact')} </th>
                    <th> {t('admin.inbox.thFood')} </th>
                    <th> {t('admin.inbox.thFlowers')} </th>
                    <th> {t('admin.inbox.thWhen')} </th>
                    <th> {t('admin.inbox.thNotes')} </th>
                    <th> {t('admin.inbox.thStatus')} </th>
                    <th> {t('admin.inbox.thActions')} </th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((resp) => (
                    <tr key={resp.id}>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(resp.createdAt).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {resp.partnerName || t('admin.misc.specialSomeone')}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{resp.contact}</span>
                      </td>
                      <td>{resp.food?.title || '—'}</td>
                      <td>{resp.flowers?.title || '—'}</td>
                      <td>
                        {resp.date?.label} {resp.customDateTime && `(${resp.customDateTime})`}
                      </td>
                      <td style={{ fontStyle: 'italic', maxWidth: '180px' }}>
                        {resp.note || '—'}
                      </td>
                      <td>
                        <select
                          className="btn-action-sm"
                          value={resp.status}
                          onChange={(e) => updateStatus(resp.id, e.target.value)}
                        >
                          <option value="Accepted 💖"> {t('admin.misc.accepted')} </option>
                          <option value="Confirmed 🥂"> {t('admin.misc.confirmed')} </option>
                          <option value="Need to text 📱"> {t('admin.misc.needText')} </option>
                          <option value="Archived"> {t('admin.misc.archived')} </option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn-action-sm"
                          style={{ color: '#e02456' }}
                          onClick={() => deleteResponse(resp.id)}
                        > {t('admin.inbox.btnDelete')} </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Settings & Customization */}
      {activeTab === 'settings' && config && (
        <form onSubmit={saveConfig}>
          <div className="admin-card">
            <div className="admin-card-title" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('admin.settings.title')}</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Настройка профиля:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <select
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: '13px', background: '#f8fafc', width: '160px' }}
                      value={profiles.includes(settingsId) ? settingsId : 'new'}
                      onChange={(e) => {
                        if (e.target.value !== 'new') setSettingsId(e.target.value);
                      }}
                    >
                      <option value="default">Базовый профиль</option>
                      {profiles.filter(p => p !== 'default').map(p => (
                        <option key={p} value={p}>Профиль: {p}</option>
                      ))}
                      <option value="new" disabled>──────────</option>
                      <option value="new">Ввести другой ID ↓</option>
                    </select>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '160px', padding: '4px 12px', fontSize: '14px', background: '#fff' }}
                      placeholder="ID (напр. katy)"
                      value={settingsId === 'default' ? '' : settingsId}
                      onChange={(e) => setSettingsId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') || 'default')}
                    />
                  </div>
                  <select 
                    className="form-input" 
                    style={{ width: 'auto', padding: '4px 12px', fontSize: '14px', minWidth: '130px', background: '#fff', alignSelf: 'flex-end' }}
                    value={settingsLang} 
                    onChange={(e) => setSettingsLang(e.target.value)}
                  >
                    <option value="ru">🇷🇺 Русский</option>
                    <option value="uk">🇺🇦 Українська</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
              </div>
              {settingsId !== 'default' && (
                <div style={{ fontSize: '12px', color: '#f43f5e', background: '#fff1f2', padding: '6px 10px', borderRadius: '4px' }}>
                  Вы редактируете индивидуальные настройки для девушки <b>{settingsId}</b>. Сохраненные данные будут показаны только по ссылке <b>{settingsId}.ваша-ссылка.com</b>.
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div className="form-group">
                <label> {t('admin.settings.partnerName')} </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('admin.settings.partnerPlaceholder')}
                  value={config.general.partnerName || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: { ...config.general, partnerName: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label> {t('admin.settings.topBadge')} </label>
                <input
                  type="text"
                  className="form-input"
                  value={config.general.topBadgeText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: { ...config.general, topBadgeText: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label> {t('admin.settings.propTitle')} </label>
                <input
                  type="text"
                  className="form-input"
                  value={config.general.proposalTitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: { ...config.general, proposalTitle: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label> {t('admin.settings.propSubtitle')} </label>
                <input
                  type="text"
                  className="form-input"
                  value={config.general.proposalSubtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: { ...config.general, proposalSubtitle: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label> {t('admin.settings.yesText')} </label>
                <input
                  type="text"
                  className="form-input"
                  value={config.general.yesButtonText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: { ...config.general, yesButtonText: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label> {t('admin.settings.noText')} </label>
                <select
                  className="form-input"
                  value={config.general.noButtonDodges ? 'yes' : 'no'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: { ...config.general, noButtonDodges: e.target.value === 'yes' },
                    })
                  }
                >
                  <option value="yes"> {t('admin.settings.noDodge')} </option>
                  <option value="no"> {t('admin.settings.noNormal')} </option>
                </select>
              </div>

              <div className="form-group">
                <label> {t('admin.settings.theme')} </label>
                <select
                  className="form-input"
                  value={config.general.theme}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: { ...config.general, theme: e.target.value },
                    })
                  }
                >
                  <option value="rose-champagne">🌸 Rose Champagne & Glass</option>
                  <option value="cozy">🧸 Cozy Warm Editorial</option>
                  <option value="midnight">🌌 Midnight Twilight</option>
                </select>
              </div>

              <div className="form-group">
                <label> {t('admin.settings.adminPass')} </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('admin.settings.passPlaceholder')}
                  value={config.general.adminPassword || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: { ...config.general, adminPassword: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-title"> {t('admin.settings.foodOptions')} ({config.foods.length}) </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {config.foods.map((food, idx) => (
                <div
                  key={food.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 1fr 1fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.6)',
                    padding: '12px',
                    borderRadius: '14px',
                  }}
                >
                  <img
                    src={food.image}
                    alt={food.title}
                    style={{ width: '100px', height: '65px', objectFit: 'cover', borderRadius: '10px' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={food.title}
                    placeholder={t('admin.settings.foodTitle')}
                    onChange={(e) => {
                      const copy = [...config.foods];
                      copy[idx].title = e.target.value;
                      setConfig({ ...config, foods: copy });
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={food.subtitle}
                    placeholder={t('admin.settings.foodSubtitle')}
                    onChange={(e) => {
                      const copy = [...config.foods];
                      copy[idx].subtitle = e.target.value;
                      setConfig({ ...config, foods: copy });
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={food.image}
                    placeholder={t('admin.settings.foodImage')}
                    onChange={(e) => {
                      const copy = [...config.foods];
                      copy[idx].image = e.target.value;
                      setConfig({ ...config, foods: copy });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="submit" className="btn-next" style={{ padding: '16px 40px' }}> {t('admin.settings.saveAll')} </button>
          </div>
        </form>
      )}

      {/* TAB 3: Share & QR Code */}
      {activeTab === 'share' && (
        <div className="admin-card">
          <div className="admin-card-title"> {t('admin.share.title')} </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label> {t('admin.share.nameLabel')} </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('admin.share.namePlaceholder')}
                  value={shareName}
                  onChange={(e) => setShareName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label> Язык странички / Language: </label>
                <select 
                  className="form-input" 
                  value={shareLang}
                  onChange={(e) => setShareLang(e.target.value)}
                >
                  <option value="">Русский (По умолчанию)</option>
                  <option value="uk">Українська</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="form-group">
                <label> {t('admin.share.urlLabel')} </label>
                <input type="text" readOnly className="form-input" value={shareUrl} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    showToast(t('admin.toasts.copied'));
                  }}
                > {t('admin.share.copy')} </button>
                <a href={shareUrl} target="_blank" className="btn-secondary"> {t('admin.share.test')} </a>
              </div>
            </div>

            {/* Live QR Code */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.9)',
                padding: '20px',
                borderRadius: '24px',
                border: '1.5px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  shareUrl || 'http://localhost:3000'
                )}`}
                alt="Date Invite QR Code"
                style={{ width: '200px', height: '200px', borderRadius: '12px' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '10px' }}> {t('admin.share.scan')} </span>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && <div className="toast-msg">{toastMsg}</div>}
    </div>
  );
}
