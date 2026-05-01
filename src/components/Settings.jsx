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

      <div className="glass card">
        <h2 className="mb-2">デザインテーマ設定</h2>
        <p className="text-secondary mb-4" style={{fontSize: '0.875rem'}}>お好みのカラーテーマを選択してください。</p>
        <div style={{display: 'flex', gap: '12px'}}>
          {[
            {id: 'light', label: 'ライト', desc: '白ベース', bg: '#ffffff', fg: '#111827'},
            {id: 'dark',  label: 'ダーク',  desc: '黒ベース', bg: '#0f172a', fg: '#f1f5f9'},
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onChangeTheme(t.id)}
              style={{
                flex: 1,
                padding: '20px 12px',
                borderRadius: '12px',
                border: currentTheme === t.id ? '2px solid var(--accent-color)' : '2px solid var(--border-color)',
                background: t.bg,
                color: t.fg,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                boxShadow: currentTheme === t.id ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
              }}
            >
              <span style={{fontSize: '1.5rem'}}>{t.id === 'light' ? '☀️' : '🌙'}</span>
              <span style={{fontWeight: 700, fontSize: '0.9375rem'}}>{t.label}</span>
              <span style={{fontSize: '0.75rem', opacity: 0.6}}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;
