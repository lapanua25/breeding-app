import React, { useState } from 'react';
import { signInAsGuest, signInWithGoogle } from '../lib/supabase';
import Icon from './Icon';

function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ゲストモードでサインイン
  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInAsGuest();
    } catch (err) {
      setError('ゲストモードでのサインイン中にエラーが発生しました');
      console.error(err);
      setLoading(false);
    }
  };

  // Google OAuth でサインイン
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError('Google ログイン中にエラーが発生しました');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '16px'}}>
      <div className="card" style={{width: '100%', maxWidth: '400px', padding: '32px'}}>
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <Icon name="feather" size={48} color="var(--primary-color)" />
          <h1 style={{marginTop: '16px'}}>Botanical Breed</h1>
          <p className="text-secondary" style={{fontSize: '0.875rem'}}>植物育種管理アプリ</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'rgb(220, 38, 38)',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {/* Google OAuth ボタン */}
          <button
            type="button"
            className="btn btn-primary"
            style={{width: '100%'}}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Icon name="globe" size={16} style={{marginRight: '8px'}} />
            {loading ? '通信中...' : 'Google でログイン'}
          </button>

          {/* ゲストモードボタン */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{width: '100%'}}
            onClick={handleGuestLogin}
            disabled={loading}
          >
            <Icon name="user" size={16} style={{marginRight: '8px'}} />
            {loading ? '通信中...' : 'ゲストで試す'}
          </button>
        </div>

        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginTop: '16px',
          textAlign: 'center'
        }}>
          ゲストモードでアプリを試した後、Google アカウントでいつでも登録できます。
        </p>
      </div>
    </div>
  );
}

export default Auth;
