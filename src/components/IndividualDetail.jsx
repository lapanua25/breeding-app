import React, { useState } from 'react';
import Icon from './Icon';
import IndividualForm from './IndividualForm';

function IndividualDetail({ id, individuals, goBack, updateIndividual, deleteIndividual, onSelect }) {
  const [viewMode, setViewMode] = useState("detail"); // detail, editForm, pedigree, certificate
  const [confirmDelete, setConfirmDelete] = useState(false);
  const individual = individuals.find(i => i.id === id);
  const offspring = individuals.filter(i => i.motherId === id || i.fatherId === id);

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
        <div className="tree-node-value">{nodeData.sex ? `${nodeData.sex} ` : ''}{nodeData.manageId ? `#${nodeData.manageId} ` : ''}{nodeData.breed || '(品種未設定)'}</div>
        {nodeData.motherId && renderPedigreeNode(nodeData.motherId, "母親", depth + 1)}
        {nodeData.fatherId && renderPedigreeNode(nodeData.fatherId, "父親", depth + 1)}
      </div>
    );
  };

  return (
    <div className="container">
      {viewMode === "detail" && (
        <button className="btn btn-secondary mb-4" onClick={goBack} style={{width: 'auto', padding: '8px 16px'}}><Icon name="arrow-left" size={16}/> 戻る</button>
      )}

      {viewMode === "detail" && (
        <>
          <div className="card" style={{padding: '24px', marginBottom: '24px'}}>
            {individual.imageUrl && (
              <img src={individual.imageUrl} alt={individual.breed || individual.manageId || ''} style={{width: '100%', borderRadius: '12px', marginBottom: '16px', objectFit: 'cover'}} loading="lazy" />
            )}
            <h1>{individual.breed || '(品種未設定)'} <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)'}}>{individual.manageId ? `#${individual.manageId}` : '管理番号なし'}</span></h1>
            <p className="text-secondary mb-4">
              {individual.category && <span style={{display: 'inline-block', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem', marginRight: '8px'}}>{individual.category}</span>}
              {individual.breed && <span style={{display: 'inline-block', backgroundColor: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem', marginRight: '8px'}}>{individual.breed}</span>}
            </p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '0.9375rem'}}>
              <div><strong>性別:</strong> {individual.sex || "不明"}</div>
              <div><strong>ステータス:</strong> {individual.status}</div>
              <div><strong>播種日:</strong> {individual.sowingDate || "未設定"}</div>
              <div><strong>母親:</strong> {mother ? `${mother.manageId ? `#${mother.manageId} ` : ''}${mother.breed || '(品種未設定)'}` : "未設定"}</div>
              <div><strong>父親:</strong> {father ? `${father.manageId ? `#${father.manageId} ` : ''}${father.breed || '(品種未設定)'}` : "未設定"}</div>
            </div>
            {individual.memo && <p className="mb-2"><strong>メモ:</strong><br/>{individual.memo}</p>}
          </div>

          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px'}}>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("editForm")}><Icon name="edit-2" size={18}/> 編集</button>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("pedigree")}><Icon name="git-merge" size={18}/> 家系図</button>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("certificate")}><Icon name="award" size={18}/> 証明書</button>
          </div>

          {/* 子株一覧 */}
          {offspring.length > 0 && (
            <div className="card" style={{padding: '20px', marginBottom: '24px'}}>
              <h2 className="mb-4" style={{fontSize: '1rem'}}>子株一覧 <span style={{color: 'var(--text-secondary)', fontWeight: 400}}>({offspring.length}株)</span></h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {offspring.map(child => (
                  <div key={child.id} onClick={() => onSelect(child.id)}
                    style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--surface-hover)', transition: 'background 0.15s'}}>
                    {child.imageUrl ? (
                      <img src={child.imageUrl} style={{width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0}} loading="lazy" />
                    ) : (
                      <div style={{width: '44px', height: '44px', borderRadius: '8px', background: 'var(--background-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                        <Icon name="image" size={20} color="var(--text-secondary)" />
                      </div>
                    )}
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontWeight: 700, fontSize: '0.9375rem'}}>{child.breed || '(品種未設定)'}{child.manageId ? <span style={{fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.8125rem', marginLeft: '6px'}}>#{child.manageId}</span> : ''}</div>
                      <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px'}}>
                        {child.sex && <span>{child.sex}</span>}
                        <span>{child.status}</span>
                        {child.sowingDate && <span>{child.sowingDate}</span>}
                      </div>
                    </div>
                    <Icon name="chevron-down" size={16} color="var(--text-secondary)" style={{transform: 'rotate(-90deg)', flexShrink: 0}} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 削除 */}
          {confirmDelete ? (
            <div className="card" style={{padding: '16px', marginBottom: '24px', borderColor: 'var(--danger-color)', background: 'rgba(239,68,68,0.04)'}}>
              <p style={{marginBottom: '12px', fontWeight: 600, color: 'var(--danger-color)'}}>本当に削除しますか？この操作は取り消せません。</p>
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="btn" style={{flex: 1, background: 'var(--danger-color)', color: '#fff', border: 'none'}} onClick={() => deleteIndividual(id)}>
                  <Icon name="trash-2" size={16}/> 削除する
                </button>
                <button className="btn btn-secondary" style={{flex: 1}} onClick={() => setConfirmDelete(false)}>キャンセル</button>
              </div>
            </div>
          ) : (
            <div style={{marginBottom: '24px', textAlign: 'right'}}>
              <button onClick={() => setConfirmDelete(true)} style={{background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: 0.7}}>
                <Icon name="trash-2" size={14}/> この個体を削除
              </button>
            </div>
          )}
        </>
      )}

      {viewMode === "pedigree" && (
        <div className="glass card">
          <button className="btn btn-secondary mb-4" onClick={() => setViewMode("detail")} style={{width: 'auto', padding: '8px 16px'}}><Icon name="arrow-left" size={16}/> 戻る</button>
          <h2 className="mb-2">家系図</h2>
          <div className="tree">
            <div className="tree-node">
              <div className="tree-node-label">対象個体</div>
              <div className="tree-node-value">{individual.sex ? `${individual.sex} ` : ''}{individual.manageId ? `#${individual.manageId} ` : ''}{individual.breed || '(品種未設定)'}</div>
              {individual.motherId && renderPedigreeNode(individual.motherId, "母親", 1)}
              {individual.fatherId && renderPedigreeNode(individual.fatherId, "父親", 1)}
            </div>
          </div>
        </div>
      )}

      {viewMode === "certificate" && (
        <div style={{background: 'transparent'}}>
          <button className="btn btn-secondary mb-4" onClick={() => setViewMode("detail")} style={{width: 'auto', padding: '8px 16px'}}><Icon name="arrow-left" size={16}/> 戻る</button>

          {/* Certificate document */}
          <div id="certificate-doc" style={{
            background: '#fffef5',
            color: '#2c2214',
            border: '3px solid #c9a84c',
            borderRadius: '12px',
            boxShadow: '0 0 0 6px #fffef5, 0 0 0 8px #c9a84c, 0 8px 32px rgba(0,0,0,0.15)',
            padding: '32px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Corner ornaments */}
            {['0 0', '0 auto', 'auto 0', 'auto auto'].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: i < 2 ? '10px' : 'auto',
                bottom: i >= 2 ? '10px' : 'auto',
                left: i % 2 === 0 ? '10px' : 'auto',
                right: i % 2 === 1 ? '10px' : 'auto',
                width: '24px', height: '24px',
                border: '2px solid #c9a84c',
                borderRadius: '2px',
                opacity: 0.6,
              }}/>
            ))}

            {/* Header */}
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
              <div style={{fontSize: '0.625rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, marginBottom: '6px'}}>
                BOTANICAL BREED
              </div>
              <div style={{fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em', color: '#2c2214', lineHeight: 1.2, marginBottom: '4px'}}>
                交配証明書
              </div>
              <div style={{fontSize: '0.75rem', letterSpacing: '0.15em', color: '#8a7050', fontStyle: 'italic'}}>
                Certificate of Breeding
              </div>
            </div>

            {/* Gold divider */}
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
              <div style={{flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #c9a84c)'}}/>
              <div style={{width: '6px', height: '6px', background: '#c9a84c', borderRadius: '50%', flexShrink: 0}}/>
              <div style={{flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #c9a84c)'}}/>
            </div>

            {/* Plant image */}
            {individual.imageUrl && (
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <img src={individual.imageUrl} style={{
                  width: '160px', height: '160px', objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid #c9a84c',
                  boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
                }} />
              </div>
            )}

            {/* Individual name block */}
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
              <div style={{fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7050', marginBottom: '6px'}}>Individual</div>
              <div style={{fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#2c2214', fontStyle: 'italic'}}>{individual.breed || '(品種未設定)'}</div>
              <div style={{marginTop: '6px', fontSize: '0.8125rem', color: '#b0986a', fontFamily: 'monospace', letterSpacing: '0.08em'}}>{individual.manageId ? `#${individual.manageId}` : '管理番号なし'}</div>
            </div>

            {/* Data rows */}
            <div style={{background: 'rgba(201,168,76,0.06)', borderRadius: '8px', padding: '16px', marginBottom: '20px'}}>
              {[
                { label: '種類', value: individual.category || '未設定' },
                { label: '性別', value: individual.sex || '不明' },
                { label: '管理番号', value: individual.manageId || '未設定', mono: true },
                { label: '播種日', value: individual.sowingDate || '不明' },
              ].map(row => (
                <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(201,168,76,0.2)'}}>
                  <span style={{fontSize: '0.8125rem', color: '#8a7050', fontWeight: 600, letterSpacing: '0.05em'}}>{row.label}</span>
                  <span style={{fontSize: '0.9375rem', fontWeight: 700, fontFamily: row.mono ? 'monospace' : 'inherit', color: '#2c2214'}}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Parents section */}
            <div style={{marginBottom: '20px'}}>
              <div style={{textAlign: 'center', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7050', marginBottom: '12px'}}>Parentage</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                {/* Mother */}
                <div style={{flex: 1, textAlign: 'center'}}>
                  {mother && mother.imageUrl ? (
                    <img src={mother.imageUrl} style={{width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a84c', marginBottom: '6px'}} />
                  ) : (
                    <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', color: '#c9a84c'}}><Icon name="image" size={20}/></div>
                  )}
                  <div style={{fontSize: '0.8125rem', fontWeight: 700, color: '#2c2214'}}>{mother ? (mother.manageId ? `#${mother.manageId}` : mother.breed || '未設定') : '未設定'}</div>
                  <div style={{fontSize: '0.6875rem', color: '#c0392b', letterSpacing: '0.05em'}}>母親</div>
                </div>
                {/* × mark */}
                <div style={{flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#c9a84c'}}>×</div>
                {/* Father */}
                <div style={{flex: 1, textAlign: 'center'}}>
                  {father && father.imageUrl ? (
                    <img src={father.imageUrl} style={{width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a84c', marginBottom: '6px'}} />
                  ) : (
                    <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', color: '#c9a84c'}}><Icon name="image" size={20}/></div>
                  )}
                  <div style={{fontSize: '0.8125rem', fontWeight: 700, color: '#2c2214'}}>{father ? (father.manageId ? `#${father.manageId}` : father.breed || '未設定') : '未設定'}</div>
                  <div style={{fontSize: '0.6875rem', color: '#2980b9', letterSpacing: '0.05em'}}>父親</div>
                </div>
              </div>
            </div>

            {/* Bottom divider */}
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
              <div style={{flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #c9a84c)'}}/>
              <div style={{width: '6px', height: '6px', background: '#c9a84c', borderRadius: '50%', flexShrink: 0}}/>
              <div style={{flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #c9a84c)'}}/>
            </div>

            {/* Footer */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
              <div style={{fontSize: '0.625rem', color: '#b0986a', fontFamily: 'monospace', letterSpacing: '0.05em', maxWidth: '60%', wordBreak: 'break-all'}}>{individual.id}</div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.6875rem', fontStyle: 'italic', color: '#8a7050', letterSpacing: '0.05em'}}>Issued by</div>
                <div style={{fontSize: '0.875rem', fontWeight: 700, color: '#c9a84c', letterSpacing: '0.1em'}}>BOTANICAL BREED</div>
              </div>
            </div>
          </div>

          <button className="btn btn-secondary mt-4" style={{marginTop: '16px'}} onClick={() => window.print()}><Icon name="printer" size={18}/> 印刷 / PDF保存</button>
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
