import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Icon from './Icon';

function Settings({ settings, reloadData, existentCategories, currentTheme, onChangeTheme, userId }) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("共通");

  const addSetting = async () => {
    if (!newName.trim()) return;
    await supabase.from('settings').insert({ trait_name: newName.trim(), is_active: true, category: newCategory, user_id: userId });
    setNewName("");
    reloadData();
  };

  const toggleSetting = async (index) => {
    const s = settings[index];
    await supabase.from('settings').update({ is_active: !s.is_active }).eq('id', s.id);
    reloadData();
  };

  const editSetting = async (index) => {
    const s = settings[index];
    const newName = prompt("新しい項目名を入力してください", s.trait_name);
    if (newName && newName.trim()) {
      await supabase.from('settings').update({ trait_name: newName.trim() }).eq('id', s.id);
      reloadData();
    }
  };

  const removeSetting = async (index) => {
    const s = settings[index];
    if (window.confirm(`「${s.trait_name}」を削除してもよろしいですか？`)) {
      await supabase.from('settings').delete().eq('id', s.id);
      reloadData();
    }
  };

  return (
    <div className="container p-4">
      <div className="glass card mb-4">
        <h2 className="mb-2">デザインテーマ設定</h2>
        <p className="text-secondary mb-4" style={{fontSize: '0.875rem'}}>お好みのカラーテーマを選択してください。</p>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          {[{id: 'emerald', label: 'エメラルド (Dark)'}, {id: 'light-leaf', label: 'ボタニカル (Light)'}, {id: 'amber', label: 'アンバー (Dark)'}, {id: 'ocean', label: 'オーシャン (Dark)'}].map(t => (
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

      <div className="glass card">
        <h2>管理項目設定</h2>
        <p className="text-secondary mb-4" style={{fontSize: '0.875rem'}}>形質評価ログで記録する項目を設定します。</p>
        
        <div className="form-group flex gap-2">
        <select 
          className="form-control" 
          style={{width: '120px', padding: '0 12px', flexShrink: 0}} 
          value={newCategory} 
          onChange={(e) => setNewCategory(e.target.value)}
        >
          <option value="共通">共通</option>
          {existentCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input 
          type="text" 
          className="form-control" 
          placeholder="項目名 (例: 葉の色)" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn btn-primary" style={{width: 'auto', padding: '0 16px'}} onClick={addSetting}>
          追加
        </button>
      </div>

      <div className="flex" style={{flexDirection: 'column', gap: '8px'}}>
        {settings.map((s, idx) => (
          <div key={idx} className="card flex items-center justify-between" style={{margin: 0, padding: '12px'}}>
            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
               <span style={{fontWeight: 600}}>{s.trait_name}</span>
               <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>対象: {s.category || '共通'}</span>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-secondary"
                style={{width: 'auto', padding: '8px', fontSize: '0.75rem'}}
                onClick={() => editSetting(idx)}
                title="名前の編集"
              >
                <Icon name="edit-2" size={16} />
              </button>
              <button 
                className={`btn ${s.is_active ? 'btn-primary' : 'btn-secondary'}`}
                style={{width: 'auto', padding: '8px 12px', fontSize: '0.75rem'}}
                onClick={() => toggleSetting(idx)}
              >
                {s.is_active ? "有効" : "無効"}
              </button>
              <button 
                className="btn btn-secondary"
                style={{width: 'auto', padding: '8px', fontSize: '0.75rem', color: 'var(--danger-color)'}}
                onClick={() => removeSetting(idx)}
                title="削除"
              >
                <Icon name="trash-2" size={16} />
              </button>
            </div>
          </div>
        ))}
        {settings.length === 0 && <p className="text-secondary">設定項目がありません。</p>}
      </div>
    </div>
    </div>
  );
}

export default Settings;
