import React from 'react';
import { supabase, isGuestUser } from '../lib/supabase';
import Icon from './Icon';

function Settings({ currentTheme, onChangeTheme, session }) {

  return (
    <div className="container p-4">
      {isGuestUser(session) && (
        <div className="card mb-4" style={{background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', color: 'rgb(180, 83, 9)'}}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
            <Icon name="alert-circle" size={20} style={{marginTop: '2px', flexShrink: 0}} />
            <div>
              <h3 style={{marginTop: 0, marginBottom: '8px'}}>ゲストモードについて</h3>
              <p style={{margin: 0, fontSize: '0.875rem', marginBottom: '12px'}}>
                ゲストモードでのデータ保存は一時的です。ブラウザのキャッシュをクリアするとデータが失われます。
              </p>
              <p style={{margin: 0, fontSize: '0.875rem', marginBottom: '12px'}}>
                データを安全に保存するため、Googleアカウントでログインすることをお勧めします。
              </p>
              <button
                className="btn btn-primary"
                style={{width: 'auto', padding: '8px 12px', fontSize: '0.75rem'}}
                onClick={() => supabase.auth.signOut()}
              >
                ログイン画面に戻る
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass card" style={{padding: '24px'}}>
        <h2 className="mb-2">デザインテーマ設定</h2>
        <p className="text-secondary mb-4" style={{fontSize: '0.875rem'}}>お好みのカラーテーマを選択してください。</p>
        <div style={{display: 'flex', gap: '12px'}}>
          {[
            {id: 'light', label: 'Ivory White', sub: 'Light', bg: '#ffffff', fg: '#111827', accent: '#059669'},
            {id: 'dark',  label: 'Onyx Black',  sub: 'Dark',  bg: '#0f172a', fg: '#f1f5f9', accent: '#10b981'},
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onChangeTheme(t.id)}
              style={{
                flex: 1,
                padding: '24px 16px',
                borderRadius: '14px',
                border: currentTheme === t.id ? `2px solid ${t.accent}` : '2px solid transparent',
                background: t.bg,
                color: t.fg,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
                boxShadow: currentTheme === t.id
                  ? `0 0 0 4px ${t.accent}33, 0 4px 16px rgba(0,0,0,0.15)`
                  : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: t.accent,
              }}>{t.sub}</span>
              <span style={{fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em'}}>{t.label}</span>
              <div style={{display: 'flex', gap: '4px', marginTop: '4px'}}>
                {[t.bg === '#ffffff' ? '#f9fafb' : '#1e293b', t.bg === '#ffffff' ? '#e5e7eb' : '#334155', t.accent].map((c, i) => (
                  <div key={i} style={{width: 12, height: 12, borderRadius: '50%', background: c, border: '1px solid rgba(128,128,128,0.2)'}} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;
