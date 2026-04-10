import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Icon from './Icon';

function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    let error;
    if (isLogin) {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    } else {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
      if (!error) alert("アカウントが作成されました！");
    }
    setLoading(false);
    if (error) alert("エラー: " + error.message);
  };

  return (
    <div style={{display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '16px'}}>
       <div className="card" style={{width: '100%', maxWidth: '400px', padding: '32px'}}>
          <div style={{textAlign: 'center', marginBottom: '32px'}}>
             <Icon name="feather" size={48} color="var(--primary-color)" />
             <h1 style={{marginTop: '16px'}}>Botanical Breed</h1>
             <p className="text-secondary" style={{fontSize: '0.875rem'}}>商用SaaS版プロトタイプ</p>
          </div>
          <form onSubmit={handleAuth}>
             <div className="form-group">
                <label className="form-label">メールアドレス</label>
                <input required type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
             </div>
             <div className="form-group">
                <label className="form-label">パスワード (6文字以上)</label>
                <input required type="password" minLength="6" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
             </div>
             <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '8px'}} disabled={loading}>
                {loading ? "通信中..." : (isLogin ? "ログインして始める" : "新規アカウント作成")}
             </button>
          </form>
          <div style={{textAlign: 'center', marginTop: '24px'}}>
             <button style={{background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem'}} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "パスワードを作って新規登録する" : "すでにアカウントをお持ちの方はこちら"}
             </button>
          </div>
       </div>
    </div>
  );
}

export default Auth;
