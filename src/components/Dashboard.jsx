import React, { useState, useMemo } from 'react';
import Icon from './Icon';

function Dashboard({ individuals, onSelect, onNew }) {
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = useMemo(() => Array.from(new Set(individuals.map(i => i.category).filter(Boolean))), [individuals]);

  const filtered = individuals.filter(i => {
    const matchSearch = (i.manageId || '').toLowerCase().includes(search.toLowerCase()) || (i.breed || '').toLowerCase().includes(search.toLowerCase()) || (i.category || '').toLowerCase().includes(search.toLowerCase()) || i.id.includes(search);
    const matchCategory = selectedCategory ? i.category === selectedCategory : true;
    return matchSearch && matchCategory;
  });

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(i => {
      const cat = i.category || "未分類";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(i);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="container" style={{paddingTop: '24px'}}>
      
      {/* Hero / Stats Banner */}
      <div className="glass p-4 card" style={{marginBottom: '24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,0,0,0))', border: '1px solid rgba(16,185,129,0.2)'}}>
        <h1 className="mb-2" style={{color: 'var(--text-primary)', letterSpacing: '-0.04em'}}>
          {individuals.length === 0 ? "Botanical Breed" : "Collection"}
        </h1>
        {individuals.length === 0 ? (
          <p className="text-secondary" style={{fontSize: '0.875rem', lineHeight: 1.6}}>
            個体がまだ登録されていません。<br/>
            「新規登録」から親株を追加して交配記録を始めましょう。
          </p>
        ) : (
          <div style={{display: 'flex', gap: '12px'}}>
             <div style={{flex: 1, textAlign: 'center', background: 'var(--background-color)', padding: '12px', borderRadius: '16px', border: '1px solid var(--secondary-color)'}}>
                <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>総登録数</div>
                <div style={{fontSize: '1.5rem', fontWeight: 800}}>{individuals.length}</div>
             </div>
             <div style={{flex: 1, textAlign: 'center', background: 'var(--background-color)', padding: '12px', borderRadius: '16px', border: '1px solid var(--secondary-color)'}}>
                <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>育成中</div>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)'}}>{individuals.filter(i => i.status === '育成中').length}</div>
             </div>
          </div>
        )}
      </div>

      <div className="glass p-4 card" style={{marginBottom: '24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
           <button className={`btn ${isSearchOpen ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setIsSearchOpen(!isSearchOpen)} style={{padding: '8px 12px', width: 'auto'}} title="検索">
              <Icon name="search" size={20} /> 検索
           </button>
           <button className="btn btn-primary" onClick={onNew} style={{width: 'auto'}}><Icon name="plus" size={20} /> 新規登録</button>
        </div>

        {isSearchOpen && (
          <div className="form-group mb-4" style={{animation: 'fadeIn 0.3s ease', margin: '0 -8px'}}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="品種名や管理番号で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex gap-2" style={{overflowX: 'auto', paddingBottom: '8px', margin: '0 -8px', padding: '0 8px'}}>
            <button className={`category-tab ${selectedCategory === "" ? "active" : ""}`} onClick={() => setSelectedCategory("")}>すべて</button>
            {categories.map(c => (
              <button key={c} className={`category-tab ${selectedCategory === c ? "active" : ""}`} onClick={() => setSelectedCategory(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>

      <div className="list">
        {Object.keys(grouped).sort((a,b) => a === "未分類" ? 1 : b === "未分類" ? -1 : a.localeCompare(b)).map(cat => {
          // 品種ごとにさらにグループ化
          const breedGroups = {};
          grouped[cat].forEach(i => {
             const br = i.breed || "品種不明";
             if(!breedGroups[br]) breedGroups[br] = [];
             breedGroups[br].push(i);
          });
          
          return (
            <details key={cat} style={{marginBottom: '24px'}} open={true}>
               <summary style={{fontSize: '1.25rem', color: 'var(--primary-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', fontWeight: 700, cursor: 'pointer', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <span>{cat} <span style={{fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '4px'}}>({grouped[cat].length}株)</span></span>
                 <Icon name="chevron-down" size={24} color="var(--text-secondary)" />
               </summary>
               
               <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px'}}>
                 {Object.keys(breedGroups).sort().map(br => (
                    <details key={br} className="card" style={{padding: '0', overflow: 'hidden'}} open={Object.keys(breedGroups).length <= 2}>
                       <summary style={{padding: '16px', fontWeight: 600, cursor: 'pointer', background: 'var(--surface-color)', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                         <span>{br} <span style={{color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 400, marginLeft: '8px'}}>{breedGroups[br].length}株</span></span>
                         <Icon name="chevron-down" size={20} color="var(--text-secondary)" />
                       </summary>
                       <div style={{padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                         {breedGroups[br].map(i => (
                            <div key={i.id} className="card flex items-center gap-4" style={{padding: '12px', cursor: 'pointer', boxShadow: 'none', border: '1px solid var(--border-color)'}} onClick={() => onSelect(i.id)}>
                               {i.imageUrl ? (
                                 <img src={i.imageUrl} style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0}} loading="lazy" />
                               ) : (
                                 <div style={{width: '60px', height: '60px', borderRadius: '8px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                                     <Icon name="image" size={24} color="var(--text-secondary)" />
                                 </div>
                               )}
                               <div style={{flex: 1}}>
                                   <div style={{display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px'}}>
                                     <h3 style={{margin: 0, fontSize: '1rem'}}>{i.manageId ? `#${i.manageId}` : '管理番号なし'}</h3>
                                   </div>
                                   <div className="flex justify-between text-secondary" style={{fontSize: '0.8125rem'}}>
                                     <span>{i.status}</span>
                                     <span>{i.sowingDate}</span>
                                   </div>
                               </div>
                            </div>
                         ))}
                       </div>
                    </details>
                 ))}
               </div>
            </details>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-secondary">登録データがありません。</p>}
      </div>
    </div>
  );
}

export default Dashboard;
