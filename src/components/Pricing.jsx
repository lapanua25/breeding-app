import React, { useState } from 'react';
import Icon from './Icon';

function Pricing({ onCancel, onUpgrade }) {
  const [step, setStep] = useState('plans'); // plans, checkout, success

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '0',
      features: ['個体登録 30株まで', '基本的な成長記録', '家系図の表示'],
      buttonText: '現在のプラン',
      active: true,
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '480',
      features: ['登録・画像保存が無制限', 'AI成長診断・健康チェック', '広告の非表示', 'プレミアム証明書の発行', '優先サポート'],
      buttonText: 'プレミアムを始める',
      active: false,
      popular: true
    }
  ];

  if (step === 'checkout') {
    return (
      <div className="container" style={{paddingTop: '40px', minHeight: '100vh', background: '#fff', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200}}>
        <div style={{maxWidth: '400px', margin: '0 auto'}}>
          <button className="btn btn-secondary mb-8" onClick={() => setStep('plans')} style={{width: 'auto', border: 'none'}}><Icon name="arrow-left" /> 戻る</button>
          
          <div className="mb-8" style={{textAlign: 'center'}}>
            <Icon name="feather" size={48} color="var(--accent-color)" />
            <h2 className="mt-4">支払い情報</h2>
            <p className="text-secondary">セキュリティで保護された決済画面</p>
          </div>

          <div className="card p-4 mb-4" style={{background: '#f8fafc', borderStyle: 'dashed'}}>
             <div className="flex justify-between mb-2">
                <span>プレミアム月額</span>
                <strong>¥480</strong>
             </div>
             <div className="flex justify-between" style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                <span>消費税 (10%)</span>
                <span>¥48</span>
             </div>
             <div style={{borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '12px'}} className="flex justify-between">
                <strong>合計金額</strong>
                <strong style={{fontSize: '1.25rem'}}>¥528</strong>
             </div>
          </div>

          <div className="form-group">
            <label className="form-label">カード番号</label>
            <div className="form-control" style={{display: 'flex', alignItems: 'center', gap: '12px', background: '#fff'}}>
               <Icon name="credit-card" size={20} color="var(--text-secondary)" />
               <span style={{color: 'var(--text-secondary)', letterSpacing: '0.1em'}}>•••• •••• •••• ••••</span>
            </div>
          </div>

          <div style={{display: 'flex', gap: '12px'}} className="mb-8">
            <div className="form-group" style={{flex: 1}}>
               <label className="form-label">有効期限</label>
               <div className="form-control" style={{background: '#fff'}}>MM / YY</div>
            </div>
            <div className="form-group" style={{flex: 1}}>
               <label className="form-label">CVC</label>
               <div className="form-control" style={{background: '#fff'}}>***</div>
            </div>
          </div>

          <button className="btn btn-primary" style={{padding: '16px', fontSize: '1.125rem'}} onClick={() => {
             // Simulate Success
             setTimeout(() => {
               setStep('success');
               onUpgrade();
             }, 1500);
          }}>
            今すぐ支払う
          </button>
          
          <p className="text-center mt-4" style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
             Powered by <strong style={{color: '#635bff'}}>Stripe</strong>
          </p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="container text-center" style={{paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
         <div style={{width: '80px', height: '80px', borderRadius: '40px', background: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', animation: 'fadeIn 0.5s'}}>
            <Icon name="check" size={48} />
         </div>
         <h1 className="mb-4">アップグレード完了！</h1>
         <p className="text-secondary mb-8">おめでとうございます！プレミアム機能が全て解放されました。<br/>心ゆくまで植物の記録をお楽しみください。</p>
         <button className="btn btn-primary" onClick={onCancel}>ダッシュボードへ戻る</button>
      </div>
    );
  }

  return (
    <div className="container" style={{paddingTop: '24px'}}>
      <div style={{textAlign: 'center', marginBottom: '32px'}}>
         <h1 style={{fontSize: '2rem', marginBottom: '8px'}}>プランを選ぶ</h1>
         <p className="text-secondary">あなたにぴったりの記録体験を。</p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {plans.map(plan => (
           <div key={plan.id} className="card" style={{
             padding: '24px', 
             position: 'relative', 
             border: plan.popular ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
             transform: plan.popular ? 'scale(1.02)' : 'none'
           }}>
             {plan.popular && (
               <div style={{
                 position: 'absolute', 
                 top: '-12px', 
                 left: '50%', 
                 transform: 'translateX(-50%)', 
                 background: 'var(--accent-color)', 
                 color: 'white', 
                 padding: '2px 12px', 
                 borderRadius: '12px', 
                 fontSize: '0.75rem', 
                 fontWeight: 700
               }}>
                 RECOMMENDED
               </div>
             )}
             
             <div className="flex justify-between items-center mb-4">
                <h2 style={{fontSize: '1.5rem', margin: 0}}>{plan.name}</h2>
                <div style={{textAlign: 'right'}}>
                   <span style={{fontSize: '1.75rem', fontWeight: 800}}>¥{plan.price}</span>
                   <span style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>/月</span>
                </div>
             </div>

             <ul style={{listStyle: 'none', marginBottom: '24px', padding: 0}}>
               {plan.features.map((f, i) => (
                 <li key={i} style={{fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <Icon name="check-circle" size={18} color={plan.popular ? "var(--accent-color)" : "var(--text-secondary)"} />
                    {f}
                 </li>
               ))}
             </ul>

             <button 
               className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`} 
               disabled={plan.active}
               onClick={() => plan.id === 'premium' ? setStep('checkout') : null}
             >
               {plan.buttonText}
             </button>
           </div>
        ))}
      </div>

      <div className="mt-8 text-center">
         <button className="btn btn-secondary" onClick={onCancel} style={{width: 'auto', border: 'none'}}>今はしない</button>
      </div>
      
      <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '24px', lineHeight: 1.5}}>
        解約はいつでも可能です。次回の更新日の24時間前までに設定からお手続きください。
      </p>
    </div>
  );
}

export default Pricing;
