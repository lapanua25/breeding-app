import React, { useState, useEffect } from 'react';
import { supabase, isGuestUser, migrateGuestToAuth } from './lib/supabase';
import Icon from './components/Icon';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import IndividualDetail from './components/IndividualDetail';
import IndividualForm from './components/IndividualForm';
import Settings from './components/Settings';

function App() {
  const [session, setSession] = useState(null);
  const [previousSession, setPreviousSession] = useState(null);
  const [currentTab, setCurrentTab] = useState("dashboard"); // dashboard, new, detail, settings
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // ゲストから認証済みユーザーへの自動移行を検出
      if (_event === 'SIGNED_IN' &&
          session?.user &&
          !isGuestUser(session) &&
          previousSession?.user?.is_anonymous) {
        try {
          console.log('ゲスト → 認証済みユーザーへの移行を検出');
          await migrateGuestToAuth(previousSession.user.id, session.user.id);
          console.log('マイグレーション完了');
        } catch (error) {
          console.error('マイグレーション失敗:', error);
        }
      }
      setPreviousSession(session);
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // UI Theme Setting
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app_ui_theme');
    // 旧テーマ名を新テーマ名に移行
    if (saved === 'emerald' || saved === 'amber' || saved === 'ocean') return 'dark';
    if (saved === 'light-leaf') return 'light';
    return saved || 'light';
  });
  useEffect(() => {
     localStorage.setItem('app_ui_theme', theme);
     document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [individuals, setIndividuals] = useState([]);

  const fetchData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const indRes = await supabase.from('individuals').select('*').order('created_at', { ascending: false });
    if (indRes.data) {
      setIndividuals(indRes.data.map(i => ({...i, manageId: i.manage_id, sowingDate: i.sowing_date, motherId: i.mother_id, fatherId: i.father_id, imageUrl: i.image_url})));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);


  const saveIndividual = async (data) => {
    const dbData = {
      name: data.name,
      manage_id: data.manageId || null,
      category: data.category,
      breed: data.breed || null,
      status: data.status,
      sowing_date: data.sowingDate || null,
      mother_id: data.motherId || null,
      father_id: data.fatherId || null,
      memo: data.memo,
      image_url: data.imageUrl,
      user_id: session.user.id
    };

    if (data.id) {
       await supabase.from('individuals').update(dbData).eq('id', data.id);
       await fetchData();
    } else {
       await supabase.from('individuals').insert(dbData);
       await fetchData();
       setCurrentTab("dashboard");
    }
  };

  if (!session) {
     return <Auth />;
  }

  if (loading && individuals.length === 0) {
    return <div style={{display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center'}}>データを読み込み中...</div>;
  }


  return (
    <div>
      <div style={{
        padding: '16px',
        background: 'var(--surface-color)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
         <button
           onClick={() => setCurrentTab("dashboard")}
           style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-primary)'}}
         >
           <Icon name="cross-breed" color="var(--accent-color)" />
           <span style={{fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.03em'}}>
             Botanical Breed
           </span>
         </button>
         {session && !isGuestUser(session) ? (
           <button className="btn btn-secondary" style={{width: 'auto', padding: '6px 12px', fontSize: '0.75rem'}} onClick={() => supabase.auth.signOut()}>
             ログアウト
           </button>
         ) : isGuestUser(session) ? (
           <button className="btn btn-primary" style={{width: 'auto', padding: '6px 12px', fontSize: '0.75rem'}} onClick={() => setCurrentTab('settings')}>
             アカウント作成
           </button>
         ) : null}
      </div>

      {/* Main Content Area */}
      <div style={{minHeight: '100vh', paddingBottom: '90px', animation: 'fadeIn 0.3s ease'}}>
        {currentTab === "dashboard" && <Dashboard individuals={individuals} onSelect={id => { setSelectedId(id); setCurrentTab("detail"); }} onNew={() => setCurrentTab("new")} />}
        {currentTab === "settings" && <Settings currentTheme={theme} onChangeTheme={setTheme} session={session} />}
        {currentTab === "new" && (
           <div className="container" style={{paddingTop: '24px'}}>
             <IndividualForm onSave={saveIndividual} onCancel={() => setCurrentTab("dashboard")} individuals={individuals} />
           </div>
        )}
        {currentTab === "detail" && selectedId && (
           <IndividualDetail
             id={selectedId}
             individuals={individuals}
             updateIndividual={saveIndividual}
             goBack={() => setCurrentTab("dashboard")}
           />
        )}

      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-item ${currentTab === "dashboard" || currentTab === "detail" || currentTab === "new" ? "active" : ""}`} onClick={() => setCurrentTab("dashboard")}>
          <Icon name="home" />
          ホーム
        </button>
        <button className={`bottom-nav-item ${currentTab === "settings" ? "active" : ""}`} onClick={() => setCurrentTab("settings")}>
          <Icon name="settings" />
          設定
        </button>
      </nav>
    </div>
  );
}

export default App;
