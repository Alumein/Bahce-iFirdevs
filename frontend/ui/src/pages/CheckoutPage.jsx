// Konum: frontend/ui/src/pages/CheckoutPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useNavigate, Link, Navigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api';

// --- İSTANBUL İLÇELERİ LİSTESİ ---
const ISTANBUL_ILCELERI = [
  "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", 
  "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", 
  "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", 
  "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", 
  "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", 
  "Şile", "Silivri", "Şişli", "Sultanbeyli", "Sultangazi", "Tuzla", "Ümraniye", 
  "Üsküdar", "Zeytinburnu"
];

export default function CheckoutPage() {
  const { isAuthenticated, user, authLoading } = useAuth();
  const { cart, cartInitialLoading, cartLoading, refreshCart, getHeaders, applyCoupon, removeCoupon } = useCart();
  const navigate = useNavigate();

  // Adım 1: Adres & Zaman, Adım 2: Ödeme
  const [currentStep, setCurrentStep] = useState(1);

  // Adres Form State'leri
  const [savedAddresses, setSavedAddresses] = useState([]); 
  const [selectedAddressId, setSelectedAddressId] = useState(''); 
  const [addressLine, setAddressLine] = useState('');
  
  // DÜZELTME: Şehir varsayılan olarak İstanbul
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  
  // Sipariş Notu & Kupon
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Zamanlama State'leri
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('09:00 - 12:00');
  const [timeError, setTimeError] = useState(null); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 1. GÜVENLİK VE SEPET KONTROLÜ ---
  if (authLoading || cartInitialLoading) {
    return <div style={{padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; 
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{padding:'50px', textAlign:'center'}}>
        <h2>Sepetiniz boş.</h2>
        <Link to="/" className="btn btn-primary" style={{marginTop:'20px'}}>Alışverişe dön</Link>
      </div>
    );
  }

  // --- 2. VERİ ÇEKME ---
  useEffect(() => {
    if (isAuthenticated) { 
      axios.get(`${API_URL}/addresses/me`)
        .then(res => {
          setSavedAddresses(res.data);
          if (res.data.length > 0) setSelectedAddressId(res.data[0].id.toString());
          else setSelectedAddressId('new');
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  // --- 3. ZAMAN DOĞRULAMA ---
  useEffect(() => {
    validateDeliveryTime();
  }, [deliveryDate, deliveryTime]);

  const validateDeliveryTime = () => {
    if (!deliveryDate || !deliveryTime) {
      setTimeError(null);
      return;
    }

    const startHour = parseInt(deliveryTime.split(':')[0], 10); 
    const selectedDateTime = new Date(deliveryDate);
    selectedDateTime.setHours(startHour, 0, 0, 0);

    const now = new Date();
    const minAllowedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (selectedDateTime < now) {
      setTimeError("Geçmiş bir zaman dilimi seçemezsiniz.");
    } else if (selectedDateTime < minAllowedTime) {
      setTimeError("Siparişler en az 2 saat önceden verilmelidir.");
    } else {
      setTimeError(null);
    }
  };

  // --- 4. DİĞER FONKSİYONLAR ---
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const success = await applyCoupon(couponCode);
    if (success) setCouponCode('');
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validasyonlar
      if (selectedAddressId === 'new') {
        if (!addressLine) { alert("Lütfen adres satırını doldurun."); return; }
        if (!district) { alert("Lütfen bir ilçe seçiniz."); return; } // İlçe kontrolü eklendi
      }
      if (!deliveryDate) { alert("Lütfen bir teslimat tarihi seçiniz."); return; }
      
      if (timeError) {
        alert(timeError);
        return;
      }
      
      setCurrentStep(2);
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true); setError(null);

    let checkoutPayload = {
      buyerName: user.fullName,
      buyerEmail: user.email,
      buyerPhone: user.phone,
      notes: notes,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime
    };
    
    if (selectedAddressId !== 'new') {
      const addr = savedAddresses.find(a => a.id.toString() === selectedAddressId);
      checkoutPayload.addressLine = addr.addressLine;
      checkoutPayload.city = addr.city;
      checkoutPayload.district = addr.district;
    } else {
      checkoutPayload.addressLine = addressLine;
      checkoutPayload.city = city; // 'İstanbul' gidecek
      checkoutPayload.district = district;
    }
    
    try {
      await axios.post(`${API_URL}/payment/checkout`, checkoutPayload, { headers: getHeaders() }); 
      alert("Siparişiniz başarıyla alındı!");
      await refreshCart(); 
      navigate('/order-success'); 
    } catch (err) {
      setError(err.response?.data?.message || "Sipariş verilirken bir hata oluştu.");
    } finally { setLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '40px 0' }}>
      
      {/* Stepper */}
      <div className="stepper-wrapper">
        {[1, 2].map(step => (
          <div key={step} className={`step-item ${currentStep >= step ? 'active' : ''}`}>
            <div className="step-circle">{currentStep > step ? '✓' : step}</div>
            <span className="step-label">{step === 1 ? 'Teslimat & Zaman' : 'Ödeme & Onay'}</span>
            {step < 2 && <div className="step-line"></div>}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        
        {/* SOL KOLON */}
        <div>
          {/* ADIM 1 */}
          {currentStep === 1 && (
            <div className="product-card" style={{ padding: '30px', height: 'auto', marginBottom: '20px' }}>
              <h3 style={{marginBottom:'20px', color:'var(--text-main)'}}>1. Teslimat Bilgileri</h3>
              
              {savedAddresses.length > 0 && (
                <div className="input-group">
                  <label>Kayıtlı Adreslerim</label>
                  <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>{addr.addressLabel} - {addr.addressLine}</option>
                    ))}
                    <option value="new">+ Yeni Adres Ekle</option>
                  </select>
                </div>
              )}

              {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                <>
                  <div className="input-group">
                    <label>Adres</label>
                    <textarea rows="3" value={addressLine} onChange={e => setAddressLine(e.target.value)} placeholder="Mahalle, Sokak, Kapı No..." />
                  </div>
                  
                  <div className="form-row">
                    {/* DÜZELTME: ŞEHİR SABİT */}
                    <div className="input-group">
                      <label>Şehir</label>
                      <select 
                        value={city} 
                        disabled 
                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' }}
                      >
                        <option value="İstanbul">İstanbul</option>
                      </select>
                      <small style={{fontSize:'0.75rem', color:'var(--primary)', marginTop:'5px'}}>* Sadece İstanbul içi teslimat.</small>
                    </div>

                    {/* DÜZELTME: İLÇE SEÇİMİ */}
                    <div className="input-group">
                      <label>İlçe</label>
                      <select 
                        value={district} 
                        onChange={e => setDistrict(e.target.value)} 
                        required
                      >
                        <option value="">İlçe Seçiniz</option>
                        {ISTANBUL_ILCELERI.map(ilce => (
                          <option key={ilce} value={ilce}>{ilce}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* ZAMANLAMA ALANI */}
              <div style={{ marginTop: '25px', padding: '20px', background: '#F8F9FA', borderRadius: 'var(--radius)', border: `1px solid ${timeError ? 'var(--danger)' : 'var(--border-color)'}` }}>
                <h4 style={{marginBottom:'15px', fontSize:'1rem', color:'var(--primary)'}}>Teslimat Zamanı</h4>
                <div className="form-row">
                  <div className="input-group">
                    <label>Tarih Seçiniz</label>
                    <input type="date" min={today} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Saat Aralığı</label>
                    <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)}>
                      <option value="09:00 - 12:00">09:00 - 12:00 (Sabah)</option>
                      <option value="12:00 - 15:00">12:00 - 15:00 (Öğle)</option>
                      <option value="15:00 - 18:00">15:00 - 18:00 (İkindi)</option>
                      <option value="18:00 - 21:00">18:00 - 21:00 (Akşam)</option>
                    </select>
                  </div>
                </div>
                {/* ZAMAN HATASI UYARISI */}
                {timeError && (
                  <div style={{ color: '#D32F2F', background: '#FFEBEE', padding: '10px', borderRadius: '4px', fontSize: '0.9rem', marginTop: '10px' }}>
                    ⚠️ {timeError}
                  </div>
                )}
              </div>

              <button 
                className="btn btn-primary" 
                style={{width:'100%', marginTop:'20px', opacity: timeError ? 0.6 : 1}} 
                onClick={handleNextStep}
                disabled={!!timeError}
              >
                Devam Et
              </button>
            </div>
          )}

          {/* ADIM 2 */}
          {currentStep === 2 && (
            <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
              <h3 style={{marginBottom:'20px', color:'var(--text-main)'}}>2. Ödeme & Onay</h3>
              <div style={{padding:'20px', background:'#E3F2FD', marginBottom:'20px', borderRadius:'var(--radius)', border:'1px solid #BBDEFB'}}>
                <p style={{fontWeight:'bold', color:'#0D47A1'}}>Kredi Kartı ile Ödeme</p>
                <p style={{fontSize:'0.9rem', color:'#1565C0'}}>Bu bir demo uygulamasıdır. Kart bilgileriniz simüle edilecektir.</p>
              </div>
              <div className="input-group">
                <label>Sipariş Notu (Mesaj Kartı)</label>
                <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Sevdiklerinize notunuz..." style={{background:'#FFF9C4'}} />
              </div>
              {error && <p style={{color:'var(--danger)', marginBottom:'10px'}}>{error}</p>}
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>Geri</button>
                <button className="btn btn-primary" style={{flex:1}} onClick={handleSubmitOrder} disabled={loading}>
                  {loading ? 'İşleniyor...' : `Siparişi Onayla (${cart.totalTry} TL)`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SAĞ KOLON (SEPET ÖZETİ) */}
        <div className="product-card" style={{ padding: '25px', height: 'fit-content', background:'#fff', border:'1px solid var(--border-color)' }}>
          <h4 style={{marginBottom:'15px', color:'var(--text-main)'}}>Sipariş Özeti</h4>
          <div style={{maxHeight:'300px', overflowY:'auto', marginBottom:'15px'}}>
            {cart.items.map(item => (
              <div key={item.productId} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'0.9rem'}}>
                <span>{item.productName} <span style={{color:'#999'}}>x{item.quantity}</span></span>
                <span style={{fontWeight:'600'}}>{item.lineTotalTry} TL</span>
              </div>
            ))}
          </div>
          <hr style={{margin:'15px 0', border:'0', borderTop:'1px dashed #eee'}}/>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'15px'}}>
            <span>Ara Toplam:</span><span>{cart.subTotalTry || cart.totalTry} TL</span>
          </div>
          
          {/* Kupon */}
          <div style={{marginBottom: '20px'}}>
            {cart.couponCode ? (
               <div style={{ background: '#E8F5E9', padding: '10px', borderRadius: '8px', fontSize:'0.85rem', border: '1px solid #C8E6C9', display:'flex', justifyContent:'space-between' }}>
                  <span style={{color: '#2E7D32'}}>🏷️ <strong>{cart.couponCode}</strong></span>
                  <button onClick={removeCoupon} disabled={cartLoading} style={{color:'#C62828', background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', textDecoration:'underline'}}>Kaldır</button>
               </div>
            ) : (
               <div style={{display:'flex', gap:'5px'}}>
                 <input placeholder="Kupon Kodu" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{padding:'10px', fontSize:'0.85rem', flex:1}} disabled={cartLoading} />
                 <button onClick={handleApplyCoupon} className="btn btn-secondary" style={{padding:'0 15px', fontSize:'0.8rem'}} disabled={cartLoading || !couponCode}>Uygula</button>
               </div>
            )}
          </div>
          <hr style={{margin:'15px 0', border:'0', borderTop:'2px solid #eee'}}/>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:'1.1rem', color:'var(--text-main)'}}>Toplam</span>
            <span style={{fontSize:'1.5rem', fontWeight:'bold', color:'var(--primary)'}}>{cart.totalTry} TL</span>
          </div>
        </div>

      </div>
    </div>
  );
}