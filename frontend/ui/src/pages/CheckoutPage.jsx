// Konum: frontend/ui/src/pages/CheckoutPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useNavigate, Link, Navigate } from 'react-router-dom';

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

export default function CheckoutPage() {
  const { isAuthenticated, user, authLoading } = useAuth();
  const { cart, cartInitialLoading, cartLoading, refreshCart, getHeaders, applyCoupon, removeCoupon } = useCart();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]); 
  const [selectedAddressId, setSelectedAddressId] = useState(''); 
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('İstanbul');
  
  // İLÇE YÖNETİMİ
  const [districtsList, setDistrictsList] = useState([]); // API'den gelen ilçeler
  const [district, setDistrict] = useState(''); // Seçili ilçe adı
  
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('09:00 - 12:00');
  const [timeError, setTimeError] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [paytrToken, setPaytrToken] = useState(null);

  // 1. Verileri Çek (Adresler ve İlçeler)
  useEffect(() => {
    // İlçeleri çek
    axios.get(`${API_URL}/districts/active`)
      .then(res => setDistrictsList(res.data))
      .catch(console.error);

    // Kayıtlı adresleri çek
    if (isAuthenticated) { 
      axios.get(`${API_URL}/addresses/me`)
        .then(res => {
          setSavedAddresses(res.data);
          if (res.data.length > 0) {
            setSelectedAddressId(res.data[0].id.toString());
            setDistrict(res.data[0].district);
          } else {
            setSelectedAddressId('new');
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  // 2. Adres Seçimi
  useEffect(() => {
    if (selectedAddressId !== 'new' && savedAddresses.length > 0) {
      const addr = savedAddresses.find(a => a.id.toString() === selectedAddressId);
      if (addr) setDistrict(addr.district);
    }
  }, [selectedAddressId, savedAddresses]);

  // 3. Zaman Doğrulama
  const validateDeliveryTime = () => {
    if (!deliveryDate || !deliveryTime) { setTimeError(null); return; }
    const startHour = parseInt(deliveryTime.split(':')[0], 10); 
    const selectedDateTime = new Date(deliveryDate);
    selectedDateTime.setHours(startHour, 0, 0, 0);
    const now = new Date();
    const minAllowedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (selectedDateTime < now) setTimeError("Geçmiş bir zaman dilimi seçemezsiniz.");
    else if (selectedDateTime < minAllowedTime) setTimeError("Siparişler en az 2 saat önceden verilmelidir.");
    else setTimeError(null);
  };

  useEffect(() => { validateDeliveryTime(); }, [deliveryDate, deliveryTime]);

  // PayTR iFrame Resizer
  useEffect(() => {
    if (paytrToken) {
      const script = document.createElement("script");
      script.src = "https://www.paytr.com/js/iframeResizer.min.js";
      script.async = true;
      script.onload = () => {
        if (window.iFrameResize) {
          window.iFrameResize({}, '#paytriframe');
        }
      };
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }
  }, [paytrToken]);

  // --- KARGO HESAPLAMA (CLIENT SIDE) ---
  // API'den gelen districtsList içindeki fiyatı kullanacağız
  const calculateShippingCost = () => {
    const cartTotal = cart?.totalTry || 0;
    if (cartTotal >= 5000) return 0;

    if (!district) return 0;

    // Seçilen ilçeyi listede bul
    const selectedDistrict = districtsList.find(d => d.name === district);
    return selectedDistrict ? selectedDistrict.shippingPrice : 250; // Bulamazsa varsayılan 250
  };

  const cartTotal = cart?.totalTry || 0;
  const shippingCost = calculateShippingCost();
  const finalTotal = cartTotal + shippingCost;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const success = await applyCoupon(couponCode);
    if (success) setCouponCode('');
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (selectedAddressId === 'new') {
        if (!addressLine) { alert("Lütfen adres satırını doldurun."); return; }
        if (!district) { alert("Lütfen bir ilçe seçiniz."); return; }
      }
      if (!deliveryDate) { alert("Lütfen bir teslimat tarihi seçiniz."); return; }
      if (timeError) { alert(timeError); return; }
      setCurrentStep(2);
    }
  };

  // SİPARİŞİ GÖNDER
  const handleSubmitOrder = async () => {
    setLoading(true); setError(null);

    let checkoutPayload = {
      addressLine: addressLine,
      city: city,
      district: district,
      notes: notes,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime
    };
    
    if (selectedAddressId !== 'new') {
      const addr = savedAddresses.find(a => a.id.toString() === selectedAddressId);
      if (addr) {
          checkoutPayload.addressLine = addr.addressLine;
          checkoutPayload.city = addr.city;
          checkoutPayload.district = addr.district;
      }
    }
    
    try {
      const endpoint = `${API_URL}/payment/checkout`;
      const response = await axios.post(endpoint, checkoutPayload, { headers: getHeaders() });
      
      if (response.data.status === 'success' && response.data.token) {
        setPaytrToken(response.data.token);
      } else {
        throw new Error("Ödeme sistemi başlatılamadı.");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Sipariş verilirken bir hata oluştu.");
    } finally { setLoading(false); }
  };

  if (authLoading || cartInitialLoading) return <div style={{padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />; 
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{padding:'50px', textAlign:'center'}}>
        <h2>Sepetiniz boş.</h2>
        <Link to="/" className="btn btn-primary" style={{marginTop:'20px'}}>Alışverişe dön</Link>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  if (paytrToken) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Güvenli Ödeme</h2>
        <div style={{ width: '100%', minHeight: '600px', border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' }}>
          <iframe src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`} id="paytriframe" style={{ width: '100%', minHeight: '600px' }} title="PayTR"></iframe>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0' }}>
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
        <div>
          {currentStep === 1 && (
            <div className="product-card" style={{ padding: '30px', height: 'auto', marginBottom: '20px' }}>
              <h3 style={{marginBottom:'20px', color:'var(--text-main)'}}>1. Teslimat Bilgileri</h3>
              {savedAddresses.length > 0 && (
                <div className="input-group">
                  <label>Kayıtlı Adreslerim</label>
                  <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>{addr.addressLabel} - {addr.district}</option>
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
                    <div className="input-group">
                      <label>Şehir</label>
                      <select value={city} disabled style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' }}>
                        <option value="İstanbul">İstanbul</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>İlçe</label>
                      <select value={district} onChange={e => setDistrict(e.target.value)} required>
                        <option value="">İlçe Seçiniz</option>
                        {/* ARTIK API'DEN GELEN LİSTE KULLANILIYOR */}
                        {districtsList.map(d => (
                          <option key={d.id} value={d.name}>{d.name} ({d.shippingPrice} TL)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

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
                {timeError && (
                  <div style={{ color: '#D32F2F', background: '#FFEBEE', padding: '10px', borderRadius: '4px', fontSize: '0.9rem', marginTop: '10px' }}>
                    ⚠️ {timeError}
                  </div>
                )}
              </div>
              <button className="btn btn-primary" style={{width:'100%', marginTop:'20px', opacity: timeError ? 0.6 : 1}} onClick={handleNextStep} disabled={!!timeError}>
                Devam Et
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
              <h3 style={{marginBottom:'20px', color:'var(--text-main)'}}>2. Ödeme & Onay</h3>
              <div style={{padding:'20px', background:'#E3F2FD', marginBottom:'20px', borderRadius:'var(--radius)', border:'1px solid #BBDEFB'}}>
                <p style={{fontWeight:'bold', color:'#0D47A1'}}>Güvenli Ödeme</p>
                <p style={{fontSize:'0.9rem', color:'#1565C0'}}>Onayla butonuna bastıktan sonra PayTR güvenli ödeme ekranına yönlendirileceksiniz.</p>
              </div>
              <div className="input-group">
                <label>Sipariş Notu (Mesaj Kartı)</label>
                <textarea rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Sevdiklerinize notunuz..." style={{background:'#FFF9C4'}} />
              </div>
              {error && <p style={{color:'var(--danger)', marginBottom:'10px'}}>{error}</p>}
              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>Geri</button>
                <button className="btn btn-primary" style={{flex:1}} onClick={handleSubmitOrder} disabled={loading}>
                  {loading ? 'Yönlendiriliyor...' : `Ödeme Ekranına Git (${finalTotal} TL)`}
                </button>
              </div>
            </div>
          )}
        </div>

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
          
          <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'10px'}}>
            <span>Ara Toplam:</span><span>{cart.totalTry} TL</span>
          </div>

          <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'15px', alignItems:'center'}}>
            <span style={{color:'var(--text-muted)'}}>
              Teslimat ({district ? district : 'İlçe Seçilmedi'}):
            </span>
            <span style={{fontWeight:'bold', color: shippingCost === 0 ? 'green' : 'var(--text-main)'}}>
              {shippingCost === 0 ? 'ÜCRETSİZ' : `${shippingCost} TL`}
            </span>
          </div>
          
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
            <span style={{fontSize:'1.1rem', color:'var(--text-main)'}}>Genel Toplam</span>
            <span style={{fontSize:'1.6rem', fontWeight:'bold', color:'var(--primary)'}}>{finalTotal} TL</span>
          </div>
          
          {shippingCost > 0 && cartTotal < 5000 && (
             <div style={{marginTop:'10px', fontSize:'0.8rem', color:'green', textAlign:'center'}}>
                🎉 {(5000 - cartTotal).toFixed(2)} TL daha eklersen teslimat bedava!
             </div>
          )}
          {shippingCost === 0 && (
             <div style={{marginTop:'10px', fontSize:'0.8rem', color:'green', textAlign:'center', fontWeight:'bold'}}>
                🎉 Teslimat Bedava!
             </div>
          )}
        </div>
      </div>
    </div>
  );
}