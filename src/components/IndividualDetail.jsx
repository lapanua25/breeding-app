import React, { useState } from 'react';
import Icon from './Icon';
import IndividualForm from './IndividualForm';

function IndividualDetail({ id, individuals, goBack, updateIndividual }) {
  const [viewMode, setViewMode] = useState("detail"); // detail, editForm, pedigree, certificate
  const individual = individuals.find(i => i.id === id);

  if (!individual) return <div>見つかりません</div>;

  const mother = individuals.find(i => i.id === individual.motherId);
  const father = individuals.find(i => i.id === individual.fatherId);

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
              <div><strong>母親 (♀):</strong> {mother ? mother.name : "未設定"}</div>
              <div><strong>父親 (♂):</strong> {father ? father.name : "未設定"}</div>
            </div>
            {individual.memo && <p className="mb-2"><strong>メモ:</strong><br/>{individual.memo}</p>}
          </div>

          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px'}}>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("editForm")}><Icon name="edit-2" size={18}/> 編集</button>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("pedigree")}><Icon name="git-merge" size={18}/> 家系図</button>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("certificate")}><Icon name="award" size={18}/> 証明書</button>
          </div>
        </>
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
                  <div style={{fontWeight: 600, fontSize: '0.875rem'}}>{mother ? mother.name : "未設定"}</div>
                  <div style={{fontSize: '0.75rem', color: '#ff4d4f'}}>♀ 母親</div>
                </div>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: '#a1a1aa'}}>×</div>
                <div style={{textAlign: 'center', flex: 1}}>
                  {father && father.imageUrl ? (
                    <img src={father.imageUrl} style={{width: '64px', height: '64px', borderRadius: '32px', objectFit: 'cover', marginBottom: '8px'}} />
                  ) : (
                    <div style={{width: '64px', height: '64px', borderRadius: '32px', background: '#f4f4f5', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#a1a1aa'}}><Icon name="image" /></div>
                  )}
                  <div style={{fontWeight: 600, fontSize: '0.875rem'}}>{father ? father.name : "未設定"}</div>
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
        <div>
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
