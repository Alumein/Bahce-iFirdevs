// Konum: frontend/ui/src/pages/AccountPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom'; 

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

// Sipariş Durumu Çeviri Haritası
const statusMap = {
  PENDING: 'Beklemede',
  PAID: 'Ödendi (Hazırlanıyor)',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargolandı',
  DELIVERED: 'Teslim Edildi',
  CANCELED: 'İptal Edildi'
};

export default function AccountPage() {
  const { user, isAuthenticated, authLoading, refreshUser } = useAuth();

  const [addresses, setAddresses] = useState([]); 
  const [orders, setOrders] = useState([]); 
  
  // --- YENİ: DİNAMİK İLÇE LİSTESİ ---
  const [districtsList, setDistrictsList] = useState([]);

  const [loading, setLoading] = useState(true); 
  const [formLoading, setFormLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Form Veri State'leri (Şehir Varsayılan İstanbul)
  const [newAddress, setNewAddress] = useState({
    addressLabel: '',
    fullName: '',
    phone: '',
    addressLine: '',
    city: 'İstanbul', 
    district: ''
  });
  
  const [profileData, setProfileData] = useState({ fullName: '', phone: '' }); 
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  
  const [formError, setFormError] = useState(null); 

  // === Veri Çekme ===
  const fetchAccountData = async () => {
    if (isAuthenticated && user) {
      setLoading(true);
      setProfileData({ fullName: user.fullName, phone: user.phone || '' });
      
      try {
        // GÜNCELLEME: İlçeleri de çekiyoruz
        const [addrRes, orderRes, distRes] = await Promise.all([
          axios.get(`${API_URL}/addresses/me`),
          axios.get(`${API_URL}/orders/me`),
          axios.get(`${API_URL}/districts/active`) // Sadece aktif ilçeler
        ]);
        
        setAddresses(addrRes.data);
        setOrders(orderRes.data);
        setDistrictsList(distRes.data);

      } catch (err) {
        console.error("Hesap verisi çekilemedi:", err);
        setError("Hesap verileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
  };
  
  useEffect(() => {
    fetchAccountData();
  }, [isAuthenticated, user]); 

  // === Adres Yönetimi ===
  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // İlçe Seçilmediyse Uyarı
    if (!newAddress.district) {
      setFormError("Lütfen bir ilçe seçiniz.");
      return;
    }

    setFormLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/addresses/me`, newAddress);
      setAddresses(prev => [...prev, response.data]);
      setShowNewAddressForm(false);
      // Formu sıfırla (Şehir yine İstanbul kalsın)
      setNewAddress({ addressLabel: '', fullName: '', phone: '', addressLine: '', city: 'İstanbul', district: '' });
    } catch (err) {
      console.error("Adres eklenemedi:", err);
      setFormError(err.response?.data?.message || "Adres eklenirken bir hata oluştu.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    
    setLoading(true); 
    try {
      await axios.delete(`${API_URL}/addresses/me/${addressId}`);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    } catch (err) {
      setError("Adres silinirken bir hata oluştu."); 
    } finally {
      setLoading(false);
    }
  };
  
  // === Profil & Şifre Yönetimi ===
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      await axios.put(`${API_URL}/customers/me`, profileData);
      await refreshUser(); 
      setShowProfileForm(false);
      alert("Profiliniz güncellendi.");
    } catch (err) {
      setFormError(err.response?.data?.message || "Profil güncellenirken bir hata oluştu.");
    } finally {
      setFormLoading(false);
    }
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      await axios.post(`${API_URL}/customers/change-password`, passwordData);
      alert("Şifreniz başarıyla değiştirildi.");
      setShowPasswordForm(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setFormError(err.response?.data?.message || "Şifre değiştirilirken bir hata oluştu.");
    } finally {
      setFormLoading(false);
    }
  };

  if (authLoading || (isAuthenticated && !user)) return <div style={{padding: '50px', textAlign: 'center'}}>Yükleniyor...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div style={{ padding: '40px 0' }}>
      <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', fontFamily: 'var(--font-heading)' }}>
        Hesabım
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>

        {/* SOL KOLON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* PROFİL KARTI */}
          <div className="product-card" style={{ padding: '25px', height: 'auto' }}>
            <h4 style={{ marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              Profil Bilgileri
            </h4>
            
            {!showProfileForm && !showPasswordForm ? (
              <div>
                <p><strong>Ad Soyad:</strong> {user.fullName}</p>
                <p><strong>E-posta:</strong> {user.email}</p>
                <p><strong>Telefon:</strong> {user.phone || '-'}</p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => { setShowProfileForm(true); setFormError(null); }} className="btn btn-secondary" style={{padding: '8px 15px', fontSize: '0.8rem'}} disabled={formLoading}>Düzenle</button>
                  <button onClick={() => { setShowPasswordForm(true); setFormError(null); }} className="btn btn-secondary" style={{padding: '8px 15px', fontSize: '0.8rem'}} disabled={formLoading}>Şifre Değiştir</button>
                </div>
              </div>
            ) : showProfileForm ? (
              <form onSubmit={handleUpdateProfile}>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px'}}><strong>E-posta:</strong> {user?.email} (Değiştirilemez)</p>
                <div className="input-group"><label>Ad Soyad</label><input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileFormChange} required /></div>
                <div className="input-group"><label>Telefon</label><input type="text" name="phone" value={profileData.phone} onChange={handleProfileFormChange} /></div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>Kaydet</button>
                  <button type="button" onClick={() => setShowProfileForm(false)} className="btn btn-secondary" disabled={formLoading}>İptal</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div className="input-group"><label>Mevcut Şifre</label><input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordFormChange} required /></div>
                <div className="input-group"><label>Yeni Şifre</label><input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordFormChange} required minLength={6} /></div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>Değiştir</button>
                  <button type="button" onClick={() => setShowPasswordForm(false)} className="btn btn-secondary" disabled={formLoading}>İptal</button>
                </div>
              </form>
            )}
            {formError && <p style={{ color: 'var(--danger)', marginTop: '10px', fontSize: '0.9rem' }}>{formError}</p>}
          </div>

          {/* ADRES KARTI */}
          <div className="product-card" style={{ padding: '25px', height: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0 }}>Adres Defterim</h4>
              {!showNewAddressForm && (
                <button onClick={() => { setShowNewAddressForm(true); setFormError(null); }} className="btn btn-primary" style={{ padding: '5px 15px', fontSize: '0.75rem' }}>+ Yeni Ekle</button>
              )}
            </div>

            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

            {/* --- YENİ ADRES FORMU (GÜNCELLENDİ) --- */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} style={{ marginBottom: '20px', padding: '15px', background: 'var(--bg-body)', borderRadius: 'var(--radius)' }}>
                <div className="input-group"><label>Adres Başlığı</label><input name="addressLabel" placeholder="Ev, İş" value={newAddress.addressLabel} onChange={handleAddressFormChange} required /></div>
                <div className="form-row">
                  <div className="input-group"><label>Alıcı Adı</label><input name="fullName" value={newAddress.fullName} onChange={handleAddressFormChange} required /></div>
                  <div className="input-group"><label>Telefon</label><input name="phone" value={newAddress.phone} onChange={handleAddressFormChange} required /></div>
                </div>
                <div className="input-group"><label>Açık Adres</label><input name="addressLine" value={newAddress.addressLine} onChange={handleAddressFormChange} required /></div>

                <div className="form-row">
                  {/* ŞEHİR (SABİT İSTANBUL) */}
                  <div className="input-group">
                    <label>Şehir</label>
                    <select name="city" value={newAddress.city} disabled style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' }}>
                      <option value="İstanbul">İstanbul</option>
                    </select>
                  </div>
                  {/* İLÇE (DİNAMİK SEÇMELİ LİSTE) */}
                  <div className="input-group">
                    <label>İlçe</label>
                    <select name="district" value={newAddress.district} onChange={handleAddressFormChange} required>
                      <option value="">Seçiniz</option>
                      {/* DİNAMİK LİSTEYİ BURADA KULLANIYORUZ */}
                      {districtsList.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {formError && <p style={{ color: 'var(--danger)', marginBottom: '10px' }}>{formError}</p>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>Kaydet</button>
                  <button type="button" onClick={() => setShowNewAddressForm(false)} className="btn btn-secondary" disabled={formLoading}>İptal</button>
                </div>
              </form>
            )}

            {/* Adres Listesi */}
            {addresses.length === 0 && !showNewAddressForm ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Kayıtlı adres yok.</p>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {addresses.map(addr => (
                  <li key={addr.id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: 'var(--radius)', background: 'var(--bg-body)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{color: 'var(--primary)'}}>{addr.addressLabel}</strong> 
                        <span style={{fontSize:'0.9em', color:'var(--text-muted)', marginLeft: '5px'}}>({addr.fullName})</span>
                        <p style={{ fontSize: '0.9em', margin: '5px 0', color: 'var(--text-main)' }}>
                          {addr.addressLine}<br/>
                          {addr.district} / {addr.city}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteAddress(addr.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85em', textDecoration: 'underline' }} disabled={loading}>Sil</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* SAĞ KOLON: SİPARİŞ GEÇMİŞİ */}
        <div className="product-card" style={{ padding: '30px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '25px', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Sipariş Geçmişim</h3>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Henüz siparişiniz bulunmuyor.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--primary)', textAlign: 'left', color: 'var(--primary)' }}>
                    <th style={{ padding: '12px' }}>Sipariş No</th>
                    <th style={{ padding: '12px' }}>Tutar</th>
                    <th style={{ padding: '12px' }}>Durum</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '15px 12px', fontWeight: 'bold' }}>#{order.id}</td>
                      <td style={{ padding: '15px 12px', color: 'var(--text-main)' }}>{order.orderTotalTry} TL</td>
                      <td style={{ padding: '15px 12px' }}>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.8em', fontWeight: 'bold',
                          background: order.status === 'DELIVERED' ? '#E8F5E9' : '#FFF3E0',
                          color: order.status === 'DELIVERED' ? '#2E7D32' : '#EF6C00',
                          display: 'inline-block'
                        }}>
                          {statusMap[order.status] || order.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px 12px', textAlign: 'right' }}>
                        <Link to={`/order/${order.id}`} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9em', border: '1px solid var(--primary)', padding: '5px 10px', borderRadius: '4px' }}>Detay</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}