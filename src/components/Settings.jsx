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
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          {[
            {id: 'emerald', label: 'エメラルド (Dark)'},
            {id: 'light-leaf', label: 'ボタニカル (Light)'},
            {id: 'amber', label: 'アンバー (Dark)'},
            {id: 'ocean', label: 'オーシャン (Dark)'}
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onChangeTheme(t.id)}
              className={`btn ${currentTheme === t.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{flex: '1 1 calc(50% - 8px)', padding: '12px', fontSize: '0.875rem'}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;
