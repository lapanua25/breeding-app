import React, { useState } from 'react';
import { supabase, compressImage, dataURLtoBlob } from '../lib/supabase';
import Icon from './Icon';

function IndividualForm({ onSave, onCancel, initialData, individuals }) {
  const [data, setData] = useState(initialData || { name: "", manageId: "", category: "", breed: "", status: "育成中", sowingDate: "", motherId: "", fatherId: "", memo: "", imageUrl: "" });
  const [imageLoading, setImageLoading] = useState(false);

  const existentCategories = Array.from(new Set(individuals.map(i => i.category).filter(Boolean)));

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      try {
        const compressedBase64 = await compressImage(file, 800, 800, 0.7);
        const blob = dataURLtoBlob(compressedBase64);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const { data: uploadData, error } = await supabase.storage.from('images').upload(fileName, blob, { contentType: 'image/jpeg' });
        
        if (error) throw error;
        
        const publicUrl = supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;
        setData({ ...data, imageUrl: publicUrl });
      } catch(err) {
        console.error(err);
        alert("画像の処理・アップロードに失敗しました。詳細： " + err.message);
      }
      setImageLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form className="glass card" onSubmit={handleSubmit} style={{padding: '24px 16px', margin: 0}}>
      <h2>{initialData ? "個体の編集" : "新規個体の登録"}</h2>
      
      <div className="form-group">
        <label className="form-label">画像 (任意)</label>
        {data.imageUrl && (
          <div style={{marginBottom: '16px'}}>
            <img src={data.imageUrl} style={{width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px'}} />
          </div>
        )}
        <label className="btn btn-secondary" style={{cursor: 'pointer'}}>
          <Icon name="camera" />
          {imageLoading ? "処理中..." : (data.imageUrl ? "画像を変更" : "写真を撮る / 選ぶ")}
          <input type="file" accept="image/*" style={{display: 'none'}} onChange={handleImageChange} />
        </label>
      </div>

      <div className="form-group">
        <label className="form-label">種類 (大カテゴリ) *</label>
        <input required type="text" name="category" list="category-list" className="form-control" placeholder="例: アガベ、塊根植物" value={data.category || ""} onChange={handleChange} />
        <datalist id="category-list">
           {existentCategories.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      <div className="form-group">
        <label className="form-label">品種 *</label>
        <input required type="text" name="breed" className="form-control" placeholder="例: チタノタ、オベサ" value={data.breed || ""} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label className="form-label">個体名 / 愛称 (任意)</label>
        <input type="text" name="name" className="form-control" placeholder="例: 白鯨、特選株" value={data.name || ""} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label className="form-label">ユーザー管理番号 (任意)</label>
        <input type="text" name="manageId" className="form-control" placeholder="例: EO-1" value={data.manageId || ""} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label className="form-label">ステータス</label>
        <select name="status" className="form-control" value={data.status} onChange={handleChange}>
          <option value="育成中">育成中</option>
          <option value="売却済">売却済</option>
          <option value="枯死">枯死</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">播種日</label>
        <input type="date" name="sowingDate" className="form-control" value={data.sowingDate} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label className="form-label">母親（♀）</label>
        <select name="motherId" className="form-control" value={data.motherId} onChange={handleChange}>
          <option value="">-- 選択なし --</option>
          {individuals.filter(i => i.id !== data.id).map(i => (
            <option key={i.id} value={i.id}>{i.name} {i.category ? `[${i.category}]` : ''}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">父親（♂）</label>
        <select name="fatherId" className="form-control" value={data.fatherId} onChange={handleChange}>
          <option value="">-- 選択なし --</option>
          {individuals.filter(i => i.id !== data.id).map(i => (
            <option key={i.id} value={i.id}>{i.name} {i.category ? `[${i.category}]` : ''}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">メモ</label>
        <textarea name="memo" className="form-control" rows="3" value={data.memo} onChange={handleChange}></textarea>
      </div>

      <div className="flex gap-4">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>キャンセル</button>
        <button type="submit" className="btn btn-primary">保存</button>
      </div>
    </form>
  );
}

export default IndividualForm;
