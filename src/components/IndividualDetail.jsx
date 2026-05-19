import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import IndividualForm from './IndividualForm';
import { supabase } from '../lib/supabase';

const sexLabel = (sex) => (sex === '♀' || sex === '♂') ? sex + '\uFE0E' : (sex || '不明');

const daysElapsed = (sowingDate) => {
  if (!sowingDate) return null;
  const diff = Math.floor((Date.now() - new Date(sowingDate).getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

function IndividualDetail({ id, individuals, goBack, updateIndividual, deleteIndividual, onSelect, onDuplicate }) {
  const [viewMode, setViewMode] = useState("detail");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // 交配ログ
  const [crossingLogs, setCrossingLogs] = useState([]);
  const [showCrossingForm, setShowCrossingForm] = useState(false);
  const [newLog, setNewLog] = useState({ crossed_at: '', other_id: '', notes: '', role: 'mother' });
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    fetchCrossingLogs();
    setShowCrossingForm(false);
  }, [id]);

  const fetchCrossingLogs = async () => {
    const { data } = await supabase
      .from('crossing_logs')
      .select('*')
      .or(`mother_id.eq.${id},father_id.eq.${id}`)
      .order('crossed_at', { ascending: false });
    if (data) setCrossingLogs(data);
  };

  const saveCrossingLog = async () => {
    if (!newLog.crossed_at) return;
    setSavingLog(true);
    const { data: { user } } = await supabase.auth.getUser();
    const role = crossingRoleFixed || newLog.role;
    const dbData = {
      user_id: user.id,
      crossed_at: newLog.crossed_at,
      mother_id: role === 'mother' ? id : (newLog.other_id || null),
      father_id: role === 'father' ? id : (newLog.other_id || null),
      notes: newLog.notes || null,
    };
    const { error } = await supabase.from('crossing_logs').insert(dbData);
    if (error) {
      alert('保存に失敗しました: ' + error.message);
    } else {
      setShowCrossingForm(false);
      setNewLog({ crossed_at: '', other_id: '', notes: '', role: 'mother' });
      await fetchCrossingLogs();
    }
    setSavingLog(false);
  };

  const deleteCrossingLog = async (logId) => {
    await supabase.from('crossing_logs').delete().eq('id', logId);
    await fetchCrossingLogs();
  };

  const individual = individuals.find(i => i.id === id);
  const offspring = individuals.filter(i => i.motherId === id || i.fatherId === id);

  if (!individual) return <div>見つかりません</div>;

  const mother = individuals.find(i => i.id === individual.motherId);
  const father = individuals.find(i => i.id === individual.fatherId);

  const siblings = individuals.filter(i => {
    if (i.id === id) return false;
    const sharedMother = individual.motherId && i.motherId === individual.motherId;
    const sharedFather = individual.fatherId && i.fatherId === individual.fatherId;
    return sharedMother || sharedFather;
  });

  // 交配ログ：性別による役割固定 & 相手フィルター
  const crossingRoleFixed = individual.sex === '♀' ? 'mother' : individual.sex === '♂' ? 'father' : null;
  const crossingPartnerFilter = (i) => {
    if (i.id === id) return false;
    if (individual.sex === '♀') return i.sex === '♂';
    if (individual.sex === '♂') return i.sex === '♀';
    if (individual.sex === '雌雄同株') return i.sex === '雌雄同株';
    return true;
  };

  return (
    <div className="container">
      {/* 写真拡大モーダル */}
      {modalImage && (
        <div onClick={() => setModalImage(null)} style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'}}>
          <img src={modalImage} style={{maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px'}} />
          <div style={{position: 'absolute', top: '20px', right: '20px', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1}}>✕</div>
        </div>
      )}

      {viewMode === "detail" && (
        <button className="btn btn-secondary mb-4" onClick={goBack} style={{width: 'auto', padding: '8px 16px'}}><Icon name="arrow-left" size={16}/> 戻る</button>
      )}

      {viewMode === "detail" && (
        <>
          <div className="card" style={{padding: '24px', marginBottom: '24px'}}>
            {individual.imageUrl && (
              <img
                src={individual.imageUrl}
                alt={individual.breed || individual.manageId || ''}
                onClick={() => setModalImage(individual.imageUrl)}
                style={{width: '100%', borderRadius: '12px', marginBottom: '16px', objectFit: 'cover', cursor: 'zoom-in'}}
                loading="lazy"
              />
            )}
            <h1>{individual.breed || '(品種未設定)'} <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)'}}>{individual.manageId ? `#${individual.manageId}` : '管理番号なし'}</span></h1>
            <p className="text-secondary mb-4">
              {individual.category && <span style={{display: 'inline-block', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem', marginRight: '8px'}}>{individual.category}</span>}
              {individual.breed && <span style={{display: 'inline-block', backgroundColor: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem', marginRight: '8px'}}>{individual.breed}</span>}
            </p>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '0.9375rem'}}>
              <div><strong>性別:</strong> {sexLabel(individual.sex)}</div>
              <div><strong>ステータス:</strong> {individual.status}</div>
              <div><strong>播種日:</strong> {individual.sowingDate ? <>{individual.sowingDate} <span style={{color: 'var(--text-secondary)', fontSize: '0.8125rem'}}>({daysElapsed(individual.sowingDate)}日)</span></> : "未設定"}</div>
              <div><strong>母親:</strong> {mother ? `${mother.manageId ? `#${mother.manageId} ` : ''}${mother.breed || '(品種未設定)'}` : "未設定"}</div>
              <div><strong>父親:</strong> {father ? `${father.manageId ? `#${father.manageId} ` : ''}${father.breed || '(品種未設定)'}` : "未設定"}</div>
            </div>
            {individual.memo && (
              <p className="mb-2"><strong>メモ:</strong><br/>
                <span style={{whiteSpace: 'pre-wrap'}}>{individual.memo}</span>
              </p>
            )}
          </div>

          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px'}}>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("editForm")}><Icon name="edit-2" size={18}/> 編集</button>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("pedigree")}><Icon name="git-merge" size={18}/> 家系図</button>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => setViewMode("certificate")}><Icon name="award" size={18}/> 証明書</button>
            <button className="btn btn-secondary" style={{flex: '1 1 auto', padding: '12px 8px', fontSize: '1rem'}} onClick={() => onDuplicate(individual)}><Icon name="feather" size={18}/> 複製</button>
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
                        {child.sex && <span>{sexLabel(child.sex)}</span>}
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

          {/* 兄弟株一覧 */}
          {siblings.length > 0 && (
            <div className="card" style={{padding: '20px', marginBottom: '24px'}}>
              <h2 className="mb-4" style={{fontSize: '1rem'}}>兄弟株 <span style={{color: 'var(--text-secondary)', fontWeight: 400}}>({siblings.length}株)</span></h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {siblings.map(sib => (
                  <div key={sib.id} onClick={() => onSelect(sib.id)}
                    style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--surface-hover)', transition: 'background 0.15s'}}>
                    {sib.imageUrl ? (
                      <img src={sib.imageUrl} style={{width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0}} loading="lazy" />
                    ) : (
                      <div style={{width: '44px', height: '44px', borderRadius: '8px', background: 'var(--background-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                        <Icon name="image" size={20} color="var(--text-secondary)" />
                      </div>
                    )}
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontWeight: 700, fontSize: '0.9375rem'}}>{sib.breed || '(品種未設定)'}{sib.manageId ? <span style={{fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.8125rem', marginLeft: '6px'}}>#{sib.manageId}</span> : ''}</div>
                      <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        {sib.sex && <span>{sexLabel(sib.sex)}</span>}
                        <span>{sib.status}</span>
                        {sib.sowingDate && <span>{sib.sowingDate}（{daysElapsed(sib.sowingDate)}日）</span>}
                        {individual.motherId && sib.motherId === individual.motherId && individual.fatherId && sib.fatherId === individual.fatherId && (
                          <span style={{background: 'rgba(5,150,105,0.1)', color: 'var(--accent-color)', borderRadius: '20px', padding: '1px 7px', fontSize: '0.75rem', fontWeight: 700}}>全血</span>
                        )}
                      </div>
                    </div>
                    <Icon name="chevron-down" size={16} color="var(--text-secondary)" style={{transform: 'rotate(-90deg)', flexShrink: 0}} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 交配ログ */}
          <div className="card" style={{padding: '20px', marginBottom: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (showCrossingForm || crossingLogs.length > 0) ? '16px' : '0'}}>
              <h2 style={{fontSize: '1rem', margin: 0}}>交配ログ {crossingLogs.length > 0 && <span style={{color: 'var(--text-secondary)', fontWeight: 400}}>({crossingLogs.length}件)</span>}</h2>
              <button className="btn btn-secondary" style={{padding: '6px 12px', width: 'auto', fontSize: '0.875rem'}}
                onClick={() => {
                  setNewLog({ crossed_at: '', other_id: '', notes: '', role: individual.sex === '♂' ? 'father' : 'mother' });
                  setShowCrossingForm(!showCrossingForm);
                }}>
                {showCrossingForm ? 'キャンセル' : '+ 記録する'}
              </button>
            </div>

            {showCrossingForm && (
              <div style={{marginBottom: '16px', padding: '16px', background: 'var(--background-color)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div className="form-group" style={{margin: 0}}>
                  <label className="form-label">交配日 *</label>
                  <input type="date" className="form-control" value={newLog.crossed_at} onChange={e => setNewLog({...newLog, crossed_at: e.target.value})} />
                </div>
                <div className="form-group" style={{margin: 0}}>
                  <label className="form-label">この個体の役割</label>
                  {crossingRoleFixed ? (
                    <div style={{padding: '10px 14px', borderRadius: '10px', background: 'rgba(5,150,105,0.08)', border: '1.5px solid var(--accent-color)', color: 'var(--accent-color)', fontWeight: 700}}>
                      {crossingRoleFixed === 'mother' ? `${'♀\uFE0E'} 母親として（固定）` : `${'♂\uFE0E'} 父親として（固定）`}
                    </div>
                  ) : (
                    <div style={{display: 'flex', gap: '8px'}}>
                      {[{val: 'mother', label: '母親として'}, {val: 'father', label: '父親として'}].map(r => (
                        <button key={r.val} type="button" onClick={() => setNewLog({...newLog, role: r.val})}
                          style={{flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: newLog.role === r.val ? 700 : 400,
                            border: `1.5px solid ${newLog.role === r.val ? 'var(--accent-color)' : 'var(--border-color)'}`,
                            background: newLog.role === r.val ? 'rgba(5,150,105,0.08)' : 'transparent',
                            color: newLog.role === r.val ? 'var(--accent-color)' : 'var(--text-secondary)'}}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{margin: 0}}>
                  <label className="form-label">交配相手</label>
                  <select className="form-control" value={newLog.other_id} onChange={e => setNewLog({...newLog, other_id: e.target.value})}>
                    <option value="">-- 選択なし --</option>
                    {individuals.filter(crossingPartnerFilter).map(i => (
                      <option key={i.id} value={i.id}>{i.manageId ? `#${i.manageId} ` : ''}{i.breed || '(品種未設定)'}{i.category ? ` [${i.category}]` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{margin: 0}}>
                  <label className="form-label">メモ</label>
                  <textarea className="form-control" rows="2" value={newLog.notes} onChange={e => setNewLog({...newLog, notes: e.target.value})} placeholder="花粉の状態、天候など..." />
                </div>
                <button className="btn btn-primary" disabled={!newLog.crossed_at || savingLog} onClick={saveCrossingLog} style={{opacity: savingLog ? 0.7 : 1}}>
                  {savingLog ? '保存中...' : '保存する'}
                </button>
              </div>
            )}

            {crossingLogs.length === 0 && !showCrossingForm && (
              <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0}}>まだ交配ログがありません</p>
            )}

            {crossingLogs.length > 0 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {crossingLogs.map(log => {
                  const isAsMother = log.mother_id === id;
                  const otherId = isAsMother ? log.father_id : log.mother_id;
                  const other = individuals.find(i => i.id === otherId);
                  return (
                    <div key={log.id} style={{padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--surface-hover)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: log.notes ? '6px' : '0'}}>
                        <div>
                          <span style={{fontWeight: 700, fontSize: '0.9375rem'}}>{log.crossed_at}</span>
                          <span style={{marginLeft: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>{isAsMother ? '母親として' : '父親として'}</span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          {other && (
                            <span style={{fontSize: '0.8125rem', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600}} onClick={() => onSelect(other.id)}>
                              ×{other.breed || '(品種未設定)'}{other.manageId ? ` #${other.manageId}` : ''}
                            </span>
                          )}
                          <button onClick={() => deleteCrossingLog(log.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', opacity: 0.6, fontSize: '0.875rem', lineHeight: 1}}>✕</button>
                        </div>
                      </div>
                      {log.notes && <p style={{margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap'}}>{log.notes}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 削除 */}
          {confirmDelete ? (
            <div className="card" style={{padding: '16px', marginBottom: '24px', borderColor: 'var(--danger-color)', background: 'rgba(239,68,68,0.04)'}}>
              <p style={{marginBottom: '12px', fontWeight: 600, color: 'var(--danger-color)'}}>本当に削除しますか？この操作は取り消せません。</p>
              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  className="btn"
                  style={{flex: 1, background: 'var(--danger-color)', color: '#fff', border: 'none', opacity: isDeleting ? 0.6 : 1}}
                  disabled={isDeleting}
                  onClick={async () => { setIsDeleting(true); await deleteIndividual(id); }}
                >
                  <Icon name="trash-2" size={16}/> {isDeleting ? '削除中...' : '削除する'}
                </button>
                <button className="btn btn-secondary" style={{flex: 1}} onClick={() => setConfirmDelete(false)} disabled={isDeleting}>キャンセル</button>
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

      {viewMode === "pedigree" && (() => {
        const mom = individuals.find(i => i.id === individual.motherId);
        const dad = individuals.find(i => i.id === individual.fatherId);
        const gMomMom = mom ? individuals.find(i => i.id === mom.motherId) : null;
        const gMomDad = mom ? individuals.find(i => i.id === mom.fatherId) : null;
        const gDadMom = dad ? individuals.find(i => i.id === dad.motherId) : null;
        const gDadDad = dad ? individuals.find(i => i.id === dad.fatherId) : null;
        const hasParents = mom || dad;
        const hasGrandparents = gMomMom || gMomDad || gDadMom || gDadDad;

        const sc = (sex) => {
          if (sex === '♀') return { border: '#e74c3c', bg: 'rgba(231,76,60,0.07)', text: '#e74c3c' };
          if (sex === '♂') return { border: '#2980b9', bg: 'rgba(41,128,185,0.07)', text: '#2980b9' };
          if (sex === '雌雄同株') return { border: '#7c3aed', bg: 'rgba(124,58,237,0.07)', text: '#7c3aed' };
          return { border: 'var(--border-color)', bg: 'var(--surface-color)', text: 'var(--text-secondary)' };
        };

        const PNode = ({ ind, label, size = 'sm', navigable = true }) => {
          const c = sc(ind?.sex);
          const imgSize = size === 'lg' ? 72 : size === 'md' ? 52 : 36;
          const pad = size === 'lg' ? '16px' : size === 'md' ? '12px' : '8px 6px';
          if (!ind) return (
            <div style={{flex: 1, border: '1.5px dashed var(--border-color)', borderRadius: '12px', padding: pad, textAlign: 'center', minWidth: 0, opacity: 0.5}}>
              <div style={{fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px'}}>{label}</div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>未設定</div>
            </div>
          );
          return (
            <div onClick={() => navigable && onSelect(ind.id)}
              style={{flex: 1, border: `1.5px solid ${c.border}`, borderRadius: '12px', padding: pad, background: c.bg, cursor: navigable ? 'pointer' : 'default', textAlign: 'center', minWidth: 0, transition: 'opacity 0.15s'}}>
              <div style={{fontSize: '0.6rem', color: c.text, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px'}}>{label}</div>
              {ind.imageUrl ? (
                <img src={ind.imageUrl} style={{width: imgSize, height: imgSize, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${c.border}`, display: 'block', margin: '0 auto 8px'}} loading="lazy" />
              ) : (
                <div style={{width: imgSize, height: imgSize, borderRadius: '50%', background: 'var(--background-color)', border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px'}}>
                  <Icon name="image" size={size === 'lg' ? 28 : size === 'md' ? 20 : 14} color={c.text} />
                </div>
              )}
              <div style={{fontWeight: 700, fontSize: size === 'lg' ? '1rem' : size === 'md' ? '0.8125rem' : '0.6875rem', marginBottom: '2px', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{ind.breed || '品種未設定'}</div>
              {ind.manageId && <div style={{fontSize: '0.6rem', color: 'var(--text-secondary)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>#{ind.manageId}</div>}
              {ind.sex && <div style={{fontSize: '0.6rem', color: c.text, fontWeight: 700, marginTop: '3px'}}>{sexLabel(ind.sex)}</div>}
            </div>
          );
        };

        return (
          <div className="glass card" style={{padding: '20px'}}>
            <button className="btn btn-secondary mb-4" onClick={() => setViewMode("detail")} style={{width: 'auto', padding: '8px 16px'}}><Icon name="arrow-left" size={16}/> 戻る</button>
            <h2 style={{marginBottom: '20px'}}>家系図</h2>

            {/* 祖父母世代 */}
            {hasGrandparents && (
              <>
                <div style={{display: 'flex', gap: '8px'}}>
                  <div style={{flex: 1, display: 'flex', gap: '6px'}}>
                    <PNode ind={gMomMom} label="母方祖母" size="sm" />
                    <PNode ind={gMomDad} label="母方祖父" size="sm" />
                  </div>
                  <div style={{width: '12px'}} />
                  <div style={{flex: 1, display: 'flex', gap: '6px'}}>
                    <PNode ind={gDadMom} label="父方祖母" size="sm" />
                    <PNode ind={gDadDad} label="父方祖父" size="sm" />
                  </div>
                </div>
                {/* 祖父母→親 縦線 */}
                <div style={{display: 'flex', height: '24px'}}>
                  <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
                    <div style={{width: '2px', background: 'var(--border-color)'}} />
                  </div>
                  <div style={{width: '12px'}} />
                  <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
                    <div style={{width: '2px', background: 'var(--border-color)'}} />
                  </div>
                </div>
              </>
            )}

            {/* 親世代 */}
            {hasParents && (
              <>
                <div style={{display: 'flex', gap: '8px'}}>
                  <PNode ind={mom} label="母親" size="md" />
                  <PNode ind={dad} label="父親" size="md" />
                </div>
                {/* 親→対象個体 コネクター */}
                <div style={{position: 'relative', height: '40px'}}>
                  <div style={{position: 'absolute', top: 0, left: 'calc(25% + 1px)', right: 'calc(25% + 1px)', height: '2px', background: 'var(--border-color)'}} />
                  {mom && <div style={{position: 'absolute', top: 0, left: '25%', width: '2px', height: '20px', background: 'var(--border-color)', transform: 'translateX(-50%)'}} />}
                  {dad && <div style={{position: 'absolute', top: 0, right: '25%', width: '2px', height: '20px', background: 'var(--border-color)', transform: 'translateX(50%)'}} />}
                  <div style={{position: 'absolute', top: 0, left: '50%', width: '2px', height: '40px', background: 'var(--border-color)', transform: 'translateX(-50%)'}} />
                </div>
              </>
            )}

            {/* 対象個体 */}
            <PNode ind={individual} label="対象個体" size="lg" navigable={false} />

            {!hasParents && (
              <p style={{textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '16px'}}>親株の情報が登録されていません</p>
            )}
          </div>
        );
      })()}

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
            {[0,1,2,3].map(i => (
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
              <div style={{fontSize: '0.625rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, marginBottom: '6px'}}>BOTANICAL BREED</div>
              <div style={{fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.05em', color: '#2c2214', lineHeight: 1.2, marginBottom: '4px'}}>交配証明書</div>
              <div style={{fontSize: '0.75rem', letterSpacing: '0.15em', color: '#8a7050', fontStyle: 'italic'}}>Certificate of Breeding</div>
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
                <img src={individual.imageUrl} style={{width: '160px', height: '160px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #c9a84c', boxShadow: '0 4px 16px rgba(201,168,76,0.3)'}} />
              </div>
            )}

            {/* Individual block */}
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
              <div style={{fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7050', marginBottom: '6px'}}>Individual</div>
              <div style={{fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#2c2214', fontStyle: 'italic'}}>{individual.breed || '(品種未設定)'}</div>
              <div style={{marginTop: '6px', fontSize: '0.8125rem', color: '#b0986a', fontFamily: 'monospace', letterSpacing: '0.08em'}}>{individual.manageId ? `#${individual.manageId}` : '管理番号なし'}</div>
            </div>

            {/* Data rows */}
            <div style={{background: 'rgba(201,168,76,0.06)', borderRadius: '8px', padding: '16px', marginBottom: '20px'}}>
              {[
                { label: '種類', value: individual.category || '未設定' },
                { label: '性別', value: sexLabel(individual.sex) },
                { label: '管理番号', value: individual.manageId || '未設定', mono: true },
                { label: '播種日', value: individual.sowingDate ? `${individual.sowingDate}（${daysElapsed(individual.sowingDate)}日）` : '不明' },
              ].map(row => (
                <div key={row.label} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(201,168,76,0.2)'}}>
                  <span style={{fontSize: '0.8125rem', color: '#8a7050', fontWeight: 600, letterSpacing: '0.05em'}}>{row.label}</span>
                  <span style={{fontSize: '0.9375rem', fontWeight: 700, fontFamily: row.mono ? 'monospace' : 'inherit', color: '#2c2214'}}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Parents */}
            <div style={{marginBottom: '20px'}}>
              <div style={{textAlign: 'center', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7050', marginBottom: '12px'}}>Parentage</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{flex: 1, textAlign: 'center'}}>
                  {mother && mother.imageUrl ? (
                    <img src={mother.imageUrl} style={{width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c9a84c', marginBottom: '6px'}} />
                  ) : (
                    <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', border: '2px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', color: '#c9a84c'}}><Icon name="image" size={20}/></div>
                  )}
                  <div style={{fontSize: '0.8125rem', fontWeight: 700, color: '#2c2214'}}>{mother ? (mother.manageId ? `#${mother.manageId}` : mother.breed || '未設定') : '未設定'}</div>
                  <div style={{fontSize: '0.6875rem', color: '#c0392b', letterSpacing: '0.05em'}}>母親</div>
                </div>
                <div style={{flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#c9a84c'}}>×</div>
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

          {/* SNSシェア */}
          <div style={{marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', textAlign: 'center'}}>
            <p style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px'}}>スクリーンショットを撮ってSNSでシェアできます</p>
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                className="btn btn-primary"
                style={{width: 'auto', padding: '10px 24px'}}
                onClick={() => navigator.share({ title: `交配証明書 — ${individual.breed || individual.manageId || 'Botanical Breed'}`, url: window.location.href })}
              >
                <Icon name="globe" size={16}/> シェア
              </button>
            )}
          </div>
        </div>
      )}

      {viewMode === "editForm" && (
        <IndividualForm
          initialData={individual}
          individuals={individuals}
          onSave={async (data) => { await updateIndividual(data); setViewMode("detail"); }}
          onCancel={() => setViewMode("detail")}
        />
      )}
    </div>
  );
}

export default IndividualDetail;
