import React, { useState } from 'react';
import { supabase, compressImage, dataURLtoBlob } from '../lib/supabase';
import Icon from './Icon';
import IndividualForm from './IndividualForm';

function IndividualDetail({ id, individuals, traitLogs, settings, individualImages, goBack, updateIndividual, addTraitLog, addTimelineImage, deleteTimelineImage }) {
  const [viewMode, setViewMode] = useState("detail"); // detail, traitForm, timelineForm, pedigree, certificate
  const individual = individuals.find(i => i.id === id);
  const activeSettings = settings.filter(s => s.isActive && (!s.category || s.category === "共通" || s.category === individual?.category));
  const logs = traitLogs.filter(t => t.individualId === id).sort((a,b) => new Date(b.recordDate) - new Date(a.recordDate));
  const timeline = (individualImages || []).filter(img => img.individualId === id).sort((a,b) => new Date(b.recordDate) - new Date(a.recordDate));
  
  if (!individual) return <div>見つかりません</div>;

  const mother = individuals.find(i => i.id === individual.motherId);
  const father = individuals.find(i => i.id === individual.fatherId);

  // Form States
  const [traitData, setTraitData] = useState({ recordDate: new Date().toISOString().split('T')[0], traitName: activeSettings[0]?.traitName || "", score: "3", note: "" });
  const [timelineData, setTimelineData] = useState({ recordDate: new Date().toISOString().split('T')[0], imageUrl: "", notes: "" });
  const [imageLoading, setImageLoading] = useState(false);

  const handleTraitSubmit = (e) => {
    e.preventDefault();
    if (!traitData.traitName) return alert("評価項目が設定されていません");
    addTraitLog({ ...traitData, individualId: id });
    setViewMode("detail");
  };

  const handleTimelineSubmit = async (e) => {
    e.preventDefault();
    if (!timelineData.imageUrl) return alert("画像を選択してください");
    await addTimelineImage({ ...timelineData, individualId: id });
    setTimelineData({ recordDate: new Date().toISOString().split('T')[0], imageUrl: "", notes: "" });
    setViewMode("detail");
  };

  const handleTimelineImageChange = async (e) => {
    const file = e.target.files[0];
    if(file) {
      setImageLoading(true);
      try {
        const compressedBase64 = await compressImage(file, 800, 800, 0.7);
        const blob = dataURLtoBlob(compressedBase64);
        const fileName = `timeline_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error } = await supabase.storage.from('images').upload(fileName, blob, { contentType: 'image/jpeg' });
        if (error) throw error;
        const publicUrl = supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;
        setTimelineData({ ...timelineData, imageUrl: publicUrl });
      } catch(err) {
        alert("アップロード失敗: " + err.message);
      }
      setImageLoading(false);
    }
  };

  const renderPedigreeNode = (nodeId, label, depth = 0) => {
    if (!nodeId) return null;
    const nodeData = individuals.find(i => i.id === nodeId);
    if (!nodeData) return null;
    return (
      <div key={nodeId + label} className="tree-node" style={{'--indent': `${depth * 20}px`}}>
        <div className="tree-node-label">{label}</div>
        <div className="tree-node-value">{nodeData.name}</div>
        {nodeData.motherId && renderPedigreeNode(nodeData.motherId, "母親 (♀)", depth + 1)}
        {nodeData.fatherId && renderPedigreeNode(nodeData.fatherId, "父親 (♂)", depth + 1)}
      </div>
    );
  };

  return (
    <div className="container">
      <button className="btn btn-secondary mb-4" onClick={goBack} style={{width: 'auto', padding: '8px 16px'}}><Icon name="arrow-left" size={16}/> 戻る</button>
      
      {viewMode === "detail" && (
        <>
          <div className="card" style={{padding: '24px', marginBottom: '24px'}}>
            {individual.imageUrl && (
              <img src={individual.imageUrl} alt={individual.name} style={{width: '100%', borderRadius: '12px', marginBottom: '16px', objectFit: 'cover'}} loading="lazy" />
            )}
            <h1>{individual.name || "(名前なし)"} <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)'}}>{individual.manageId ? `#${individual.manageId}` : ''}</span></h1>
            <p className="text-secondary mb-4">
              {individual.category && <span style={{display: 'inline-block', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem', marginRight: '8px'}}>{individual.category}</span>}
              {individual.breed && <span style={{display: 'inline-block', backgroundColor: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem', marginRight: '8px'}}>{individual.breed}</span>}
            </p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '0.9375rem'}}>
              <div><strong>ステータス:</strong> {individual.status}</div>
              <div><strong>播種日:</strong> {individual.sowingDate || "未設定"}</div>
              <div><strong>母親 (♀):</strong> {mother ? mother.name : "不明"}</div>
              <div><strong>父親 (♂):</strong> {father ? father.name : "不明"}</div>
            </div>

            {individual.memo && <p className="mb-2"><strong>メモ:</strong><br/>{individual.memo}</p>}
          </div>

          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px'}}>
             <button className="btn btn-primary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("traitForm")}><Icon name="star" size={18}/> 評価</button>
             <button className="btn btn-primary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("timelineForm")}><Icon name="camera" size={18}/> 写真</button>
             <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("editForm")}><Icon name="edit-2" size={18}/> 編集</button>
             <button className="btn btn-secondary" style={{flex: '2 1 auto', padding: '8px', fontSize: '0.875rem'}} onClick={() => setViewMode("pedigree")}><Icon name="git-merge" size={14}/> 家系図</button>
             <button className="btn btn-secondary" style={{flex: '2 1 auto', padding: '8px', fontSize: '0.875rem'}} onClick={() => setViewMode("certificate")}><Icon name="award" size={14}/> 証明</button>
          </div>

          <h3 className="mb-4">成長タイムライン</h3>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-date">{individual.sowingDate || "播種日不明"} (登録時)</div>
              <div className="timeline-content">
                {individual.imageUrl && <img src={individual.imageUrl} style={{width: '100%', borderRadius: '8px', marginBottom: '8px'}} loading="lazy" />}
                <p style={{fontSize: '0.875rem'}}>{individual.memo || "最初の一歩。"}</p>
              </div>
            </div>
            {timeline.map(item => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-date flex justify-between items-center">
                  <span>{item.recordDate}</span>
                  <button onClick={() => deleteTimelineImage(item.id)} style={{background: 'none', border: 'none', color: 'var(--danger-color)', padding: '4px'}}><Icon name="trash-2" size={14}/></button>
                </div>
                <div className="timeline-content">
                  <img src={item.imageUrl} style={{width: '100%', borderRadius: '8px', marginBottom: '8px'}} loading="lazy" />
                  {item.notes && <p style={{fontSize: '0.875rem'}}>{item.notes}</p>}
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-8 mb-4">評価ログ</h3>

          {logs.length === 0 ? <p className="text-secondary">まだ評価がありません。</p> : (
            logs.map(log => (
              <div key={log.id} className="card glass">
                <div className="flex justify-between items-center mb-2">
                  <strong>{log.traitName}</strong>
                  <span style={{color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 800}}>★{log.score}</span>
                </div>
                <div className="text-secondary font-sm flex justify-between">
                  <span>{log.recordDate}</span>
                  <span>{log.note}</span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {viewMode === "traitForm" && (
        <form className="glass card" onSubmit={handleTraitSubmit}>
          <h2 className="mb-4">新しい評価を記録</h2>
          <div className="form-group">
            <label className="form-label">記録日</label>
            <input required type="date" className="form-control" value={traitData.recordDate} onChange={e => setTraitData({...traitData, recordDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">評価項目</label>
            <select required className="form-control" value={traitData.traitName} onChange={e => setTraitData({...traitData, traitName: e.target.value})}>
              {activeSettings.map(s => <option key={s.traitName} value={s.traitName}>{s.traitName}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">スコア (1-5)</label>
            <input required type="number" min="1" max="5" className="form-control" value={traitData.score} onChange={e => setTraitData({...traitData, score: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">備考</label>
            <input type="text" className="form-control" value={traitData.note} onChange={e => setTraitData({...traitData, note: e.target.value})} />
          </div>
          <div className="flex gap-4">
             <button type="button" className="btn btn-secondary" onClick={() => setViewMode("detail")}>キャンセル</button>
             <button type="submit" className="btn btn-primary">保存</button>
          </div>
        </form>
      )}

      {viewMode === "timelineForm" && (
        <form className="glass card" onSubmit={handleTimelineSubmit}>
          <h2 className="mb-4">成長記録（写真）を追加</h2>
          <div className="form-group">
            <label className="form-label">撮影日</label>
            <input required type="date" className="form-control" value={timelineData.recordDate} onChange={e => setTimelineData({...timelineData, recordDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">写真</label>
            {timelineData.imageUrl && <img src={timelineData.imageUrl} style={{width: '100%', borderRadius: '12px', marginBottom: '16px'}} />}
            <label className="btn btn-secondary" style={{cursor: 'pointer'}}>
              <Icon name="camera" /> {imageLoading ? "処理中..." : (timelineData.imageUrl ? "写真を変更" : "写真を選ぶ")}
              <input type="file" accept="image/*" style={{display: 'none'}} onChange={handleTimelineImageChange} />
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">コメント (任意)</label>
            <textarea className="form-control" rows="2" placeholder="例: 新芽が出てきました" value={timelineData.notes} onChange={e => setTimelineData({...timelineData, notes: e.target.value})}></textarea>
          </div>
          <div className="flex gap-4">
             <button type="button" className="btn btn-secondary" onClick={() => setViewMode("detail")}>キャンセル</button>
             <button type="submit" className="btn btn-primary" disabled={imageLoading}>保存</button>
          </div>
        </form>
      )}


      {viewMode === "pedigree" && (
        <div className="glass card">
          <button className="btn btn-secondary mb-4" onClick={() => setViewMode("detail")} style={{width: 'auto', padding: '8px 16px'}}><Icon name="arrow-left" size={16}/> 戻る</button>
          <h2 className="mb-2">家系図</h2>
          <div className="tree">
            <div className="tree-node">
              <div className="tree-node-label">対象個体</div>
              <div className="tree-node-value">{individual.name}</div>
              {individual.motherId && renderPedigreeNode(individual.motherId, "母親 (♀)", 1)}
              {individual.fatherId && renderPedigreeNode(individual.fatherId, "父親 (♂)", 1)}
            </div>
          </div>
        </div>
      )}

      {viewMode === "certificate" && (
         <div className="glass card" style={{background: '#fff', color: '#000'}}>
             <button className="btn btn-secondary mb-4" onClick={() => setViewMode("detail")} style={{width: 'auto', padding: '8px 16px'}}><Icon name="arrow-left" size={16}/> 戻る</button>
             <div className="certificate">
                 <div className="certificate-title">交配証明書</div>
                 {individual.imageUrl && (
                   <div style={{marginBottom: '24px'}}>
                     <img src={individual.imageUrl} style={{width: '200px', height: '200px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                   </div>
                 )}
                 <div className="certificate-row">
                    <span className="certificate-label">個体名</span>
                    <span className="certificate-value">{individual.name || "(名前なし)"} {individual.breed && <span style={{fontSize: '0.8rem', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '8px', color: '#4a5568', verticalAlign: 'middle', marginLeft: '6px'}}>{individual.breed}</span>}</span>
                 </div>
                 <div className="certificate-row">
                    <span className="certificate-label">管理番号</span>
                    <span className="certificate-value" style={{fontFamily: 'monospace'}}>{individual.manageId || "未設定"}</span>
                 </div>
                 <div className="certificate-row" style={{flexDirection: 'column', alignItems: 'center', borderBottom: 'none'}}>
                    <span className="certificate-label" style={{marginBottom: '16px'}}>交配親 (♀ × ♂)</span>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', width: '100%'}}>
                       <div style={{textAlign: 'center', flex: 1}}>
                          {mother && mother.imageUrl ? (
                             <img src={mother.imageUrl} style={{width: '64px', height: '64px', borderRadius: '32px', objectFit: 'cover', marginBottom: '8px'}} />
                          ) : (
                             <div style={{width: '64px', height: '64px', borderRadius: '32px', background: '#f4f4f5', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#a1a1aa'}}><Icon name="image" /></div>
                          )}
                          <div style={{fontWeight: 600, fontSize: '0.875rem'}}>{mother ? mother.name : "不明"}</div>
                          <div style={{fontSize: '0.75rem', color: '#ff4d4f'}}>♀ 母親</div>
                       </div>
                       <div style={{fontSize: '1.5rem', fontWeight: 800, color: '#a1a1aa'}}>×</div>
                       <div style={{textAlign: 'center', flex: 1}}>
                          {father && father.imageUrl ? (
                             <img src={father.imageUrl} style={{width: '64px', height: '64px', borderRadius: '32px', objectFit: 'cover', marginBottom: '8px'}} />
                          ) : (
                             <div style={{width: '64px', height: '64px', borderRadius: '32px', background: '#f4f4f5', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#a1a1aa'}}><Icon name="image" /></div>
                          )}
                          <div style={{fontWeight: 600, fontSize: '0.875rem'}}>{father ? father.name : "不明"}</div>
                          <div style={{fontSize: '0.75rem', color: '#1890ff'}}>♂ 父親</div>
                       </div>
                    </div>
                 </div>
                 <div style={{borderBottom: '1px dashed var(--secondary-color)', marginBottom: '12px'}}></div>
                 <div className="certificate-row">
                    <span className="certificate-label">播種日</span>
                    <span className="certificate-value">{individual.sowingDate || "不明"}</span>
                 </div>
                 <div className="certificate-row">
                    <span className="certificate-label">UUID</span>
                    <span className="certificate-value" style={{fontSize: '0.75rem', fontFamily: 'monospace', color: '#a1a1aa'}}>{individual.id}</span>
                 </div>
                 <div style={{marginTop: '32px', textAlign: 'right', fontSize: '0.75rem', color: '#666'}}>
                     Issued by Botanical Breed
                 </div>
             </div>
             <button className="btn btn-primary mt-4" style={{marginTop: '16px'}} onClick={() => window.print()}><Icon name="printer" /> 印刷 / PDF保存</button>
         </div>
      )}

      {viewMode === "editForm" && (
        <div style={{marginTop: '0px'}}>
          <IndividualForm 
            initialData={individual} 
            individuals={individuals} 
            onSave={(data) => { updateIndividual(data); setViewMode("detail"); }} 
            onCancel={() => setViewMode("detail")} 
          />
        </div>
      )}
    </div>
  );
}

export default IndividualDetail;
