import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import Icon from './components/Icon';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import IndividualDetail from './components/IndividualDetail';
import IndividualForm from './components/IndividualForm';
import Settings from './components/Settings';
import Pricing from './components/Pricing';

function App() {
  const [session, setSession] = useState(null);
  const [currentTab, setCurrentTab] = useState("dashboard"); // dashboard, new, detail, settings
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // UI Theme Setting
  const [theme, setTheme] = useState(() => localStorage.getItem('app_ui_theme') || 'emerald');
  useEffect(() => {
     localStorage.setItem('app_ui_theme', theme);
     document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [individuals, setIndividuals] = useState([]);
  const [traitLogs, setTraitLogs] = useState([]);
  const [individualImages, setIndividualImages] = useState([]);
  const [settings, setSettings] = useState([]);

  const fetchData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const [indRes, logRes, setRes, imgRes] = await Promise.all([
      supabase.from('individuals').select('*').order('created_at', { ascending: false }),
      supabase.from('trait_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*').order('created_at', { ascending: true }),
      supabase.from('individual_images').select('*').order('record_date', { ascending: false })
    ]);
    
    if (indRes.data) {
       setIndividuals(indRes.data.map(i => ({...i, breed: i.breed, manageId: i.manage_id, sowingDate: i.sowing_date, motherId: i.mother_id, fatherId: i.father_id, imageUrl: i.image_url})));
    }
    if (logRes.data) {
       setTraitLogs(logRes.data.map(l => ({...l, individualId: l.individual_id, recordDate: l.record_date, traitName: l.trait_name, note: l.notes})));
    }
    if (setRes.data) {
       if (setRes.data.length === 0) {
          // 初期設定データ
          const defaults = [
            { trait_name: "棘の鋭さ", is_active: true, category: "共通", user_id: session.user.id },
            { trait_name: "葉の色", is_active: true, category: "共通", user_id: session.user.id },
            { trait_name: "形のバランス", is_active: true, category: "共通", user_id: session.user.id }
          ];
          await supabase.from('settings').insert(defaults);
          fetchData(); 
          return;
       }
       setSettings(setRes.data.map(s => ({...s, traitName: s.trait_name, isActive: s.is_active})));
    }
    if (imgRes.data) {
       setIndividualImages(imgRes.data.map(img => ({...img, individualId: img.individual_id, recordDate: img.record_date})));
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

  const addTraitLog = async (data) => {
    const dbData = {
       individual_id: data.individualId,
       record_date: data.recordDate,
       trait_name: data.traitName,
       score: data.score,
       notes: data.note,
       user_id: session.user.id
    };
    await supabase.from('trait_logs').insert(dbData);
    await fetchData();
  };

  const addTimelineImage = async (data) => {
    const dbData = {
      individual_id: data.individualId,
      image_url: data.imageUrl,
      record_date: data.recordDate,
      notes: data.notes,
      user_id: session.user.id
    };
    await supabase.from('individual_images').insert(dbData);
    await fetchData();
  };

  const deleteTimelineImage = async (id) => {
    if(window.confirm("この写真を削除してもよろしいですか？")) {
      await supabase.from('individual_images').delete().eq('id', id);
      await fetchData();
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
         <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
           <Icon name="feather" color="var(--primary-color)" />
           <span style={{fontWeight: 800, fontSize: '1.125rem'}}>
             Botanical Breed
           </span>
         </div>
         <button className="btn btn-secondary" style={{width: 'auto', padding: '6px 12px', fontSize: '0.75rem'}} onClick={() => supabase.auth.signOut()}>
           ログアウト
         </button>
      </div>

      {/* Main Content Area */}
      <div style={{minHeight: '100vh', paddingBottom: '90px', animation: 'fadeIn 0.3s ease'}}>
        {currentTab === "dashboard" && <Dashboard individuals={individuals} onSelect={id => { setSelectedId(id); setCurrentTab("detail"); }} onNew={() => setCurrentTab("new")} />}
        {currentTab === "settings" && <Settings settings={settings} reloadData={fetchData} currentTheme={theme} onChangeTheme={setTheme} existentCategories={Array.from(new Set(individuals.map(i => i.category).filter(Boolean)))} userId={session.user.id} />}
        {currentTab === "new" && (
           <div className="container" style={{paddingTop: '24px'}}>
             <IndividualForm onSave={saveIndividual} onCancel={() => setCurrentTab("dashboard")} individuals={individuals} />
           </div>
        )}
        {currentTab === "detail" && selectedId && (
           <IndividualDetail 
             id={selectedId} 
             individuals={individuals} 
             traitLogs={traitLogs} 
             settings={settings}
             individualImages={individualImages}
             updateIndividual={saveIndividual}
             addTraitLog={addTraitLog}
             addTimelineImage={addTimelineImage}
             deleteTimelineImage={deleteTimelineImage}
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
