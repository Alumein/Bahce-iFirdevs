// Konum: frontend/ui/src/pages/AdminDashboardPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

// Sipariş Durumu Çeviri Haritası
const statusMap = {
  PENDING: 'Beklemede (Ödeme Yok)',
  PAID: 'Ödendi (Hazırlanacak)',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargolandı',
  DELIVERED: 'Teslim Edildi',
  CANCELED: 'İptal Edildi'
};

export default function AdminDashboardPage() {
  const { isAdmin, authLoading } = useAuth();

  // --- STATE'LER ---
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  
  // Dashboard İstatistikleri
  const [stats, setStats] = useState(null);

  // Sipariş Yönetimi
  const [searchEmail, setSearchEmail] = useState('');
  const [foundOrders, setFoundOrders] = useState([]);

  // Ürün Yönetimi
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // "Yeni Ürün Ekle" formu
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Ürün Formu (3 RESİMLİ)
  const [productForm, setProductForm] = useState({
    id: null, name: '', shortDescription: '', priceTry: '', stock: '', categoryId: '', 
    imageUrl: '', imageUrl2: '', imageUrl3: '' 
  });
  
  const [uploadingField, setUploadingField] = useState(null);

  // Kategori Yönetimi
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null); 
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', description: '' });

  // Müşteri Yönetimi
  const [customers, setCustomers] = useState([]);

  // Kupon Yönetimi
  const [coupons, setCoupons] = useState([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({ 
    code: '', discountPercentage: 20, expirationDate: '', minCartAmount: 0 
  });

  // --- İLÇE (SEMT) YÖNETİMİ ---
  const [districts, setDistricts] = useState([]);
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newDistrictPrice, setNewDistrictPrice] = useState('');

  // --- YENİ EKLENEN: SİTE AYARLARI (VİDEO) ---
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);

  // --- İLK YÜKLEME ---
  useEffect(() => {
    if (isAdmin) {
      axios.get(`${API_URL}/admin/dashboard/stats`)
        .then(res => setStats(res.data))
        .catch(console.error);

      axios.get(`${API_URL}/categories`)
        .then(res => setCategories(res.data))
        .catch(console.error);
    }
  }, [isAdmin]);

  // --- SEKME DEĞİŞİMİ ---
  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'orders') handleSearchOrders({ preventDefault: () => {} });
    else if (activeTab === 'categories') fetchCategories();
    else if (activeTab === 'customers') fetchCustomers();
    else if (activeTab === 'coupons') fetchCoupons();
    else if (activeTab === 'districts') fetchDistricts();
    else if (activeTab === 'settings') fetchSettings(); // YENİ: Ayarlar sekmesi
  }, [activeTab]);


  // ===============================
  // === 1. SİPARİŞ FONKSİYONLARI ===
  // ===============================
  const handleSearchOrders = async (e) => {
    if(e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (searchEmail.trim()) params.email = searchEmail;
      const response = await axios.get(`${API_URL}/orders`, { params });
      setFoundOrders(response.data.sort((a, b) => b.id - a.id));
    } catch (err) { alert("Siparişler çekilemedi."); } 
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if(!window.confirm(`Sipariş #${orderId} durumu ${newStatus} yapılsın mı?`)) return;
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus });
      handleSearchOrders({ preventDefault: () => {} }); 
      alert("Durum güncellendi!");
    } catch (err) { alert("Hata: " + err.message); }
  };


  // ============================
  // === 2. ÜRÜN FONKSİYONLARI ===
  // ============================
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products/page?page=0&size=100&sort=id,desc`);
      setProducts(response.data.content);
    } catch (err) { console.error("Ürünler çekilemedi", err); } 
    finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) { alert("Silinemedi. (Siparişi olan ürünler silinemez)"); }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription,
      priceTry: product.priceTry,
      stock: product.stock,
      categoryId: product.categoryId, 
      imageUrl: product.imageUrl || '',
      imageUrl2: product.imageUrl2 || '',
      imageUrl3: product.imageUrl3 || ''
    });
    setShowNewProductForm(false);
    setEditingProductId(product.id);
  };

  const handleNewProduct = () => {
    setProductForm({ id: null, name: '', shortDescription: '', priceTry: '', stock: '', categoryId: categories[0]?.id || '', imageUrl: '', imageUrl2: '', imageUrl3: '' });
    setEditingProductId(null);
    setShowNewProductForm(true);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setShowNewProductForm(false);
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(fieldName); 
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProductForm(prev => ({ ...prev, [fieldName]: response.data.url }));
    } catch (err) {
      alert("Resim yüklenemedi.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveImage = (fieldName) => {
    setProductForm(prev => ({ ...prev, [fieldName]: '' }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...productForm,
        priceTry: parseFloat(productForm.priceTry),
        stock: parseInt(productForm.stock),
        categoryId: parseInt(productForm.categoryId)
      };

      if (productForm.id) {
        await axios.put(`${API_URL}/products/${productForm.id}`, payload);
        alert("Ürün güncellendi!");
      } else {
        await axios.post(`${API_URL}/products`, payload);
        alert("Yeni ürün eklendi!");
      }
      
      setEditingProductId(null);
      setShowNewProductForm(false);
      fetchProducts(); 
    } catch (err) {
      alert("Kaydedilemedi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderProductFormContent = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <label>Ürün Adı</label>
        <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
      </div>
      <div>
        <label>Fiyat (TL)</label>
        <input type="number" step="0.01" value={productForm.priceTry} onChange={e => setProductForm({...productForm, priceTry: e.target.value})} required />
      </div>
      <div>
        <label>Stok Adedi</label>
        <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} required />
      </div>
      <div>
        <label>Kategori</label>
        <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})} required>
          <option value="">Seçiniz</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      
      {/* RESİM 1 */}
      <div>
        <label>Ana Resim (Kapak)</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageUrl')} style={{width:'auto'}} />
          {uploadingField === 'imageUrl' && <small style={{color:'blue'}}>Yükleniyor...</small>}
        </div>
        {productForm.imageUrl && (
          <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
            <img src={productForm.imageUrl} alt="Önizleme" style={{height:'50px', marginLeft:'10px', verticalAlign:'middle', border:'1px solid #ccc'}} />
            <button type="button" onClick={() => handleRemoveImage('imageUrl')} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sil ❌</button>
          </div>
        )}
      </div>

      {/* RESİM 2 */}
      <div>
        <label>2. Resim (Opsiyonel - Hover)</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageUrl2')} style={{width:'auto'}} />
          {uploadingField === 'imageUrl2' && <small style={{color:'blue'}}>Yükleniyor...</small>}
        </div>
        {productForm.imageUrl2 && (
          <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
            <img src={productForm.imageUrl2} alt="Önizleme 2" style={{height:'50px', marginLeft:'10px', verticalAlign:'middle', border:'1px solid #ccc'}} />
            <button type="button" onClick={() => handleRemoveImage('imageUrl2')} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sil ❌</button>
          </div>
        )}
      </div>

      {/* RESİM 3 */}
      <div>
        <label>3. Resim (Opsiyonel - Detay)</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageUrl3')} style={{width:'auto'}} />
          {uploadingField === 'imageUrl3' && <small style={{color:'blue'}}>Yükleniyor...</small>}
        </div>
        {productForm.imageUrl3 && (
          <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
            <img src={productForm.imageUrl3} alt="Önizleme 3" style={{height:'50px', marginLeft:'10px', verticalAlign:'middle', border:'1px solid #ccc'}} />
            <button type="button" onClick={() => handleRemoveImage('imageUrl3')} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sil ❌</button>
          </div>
        )}
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <label>Kısa Açıklama</label>
        <textarea rows="3" value={productForm.shortDescription} onChange={e => setProductForm({...productForm, shortDescription: e.target.value})} />
      </div>
      
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading || uploadingField !== null}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>İptal</button>
      </div>
    </div>
  );


  // ===============================
  // === 3. KATEGORİ FONKSİYONLARI ===
  // ===============================
  const fetchCategories = async () => {
    try { 
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data.sort((a, b) => a.id - b.id)); 
    } catch(e){ console.error(e); }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (categoryForm.id) {
        await axios.put(`${API_URL}/categories/${categoryForm.id}`, categoryForm);
      } else {
        await axios.post(`${API_URL}/categories`, categoryForm);
      }
      alert("Kategori kaydedildi!");
      setEditingCategoryId(null);
      setShowNewCategoryForm(false);
      fetchCategories();
    } catch (err) {
      alert("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm("Kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      fetchCategories();
    } catch(err) {
      alert("Silinemedi. Bu kategoriye bağlı ürünler olabilir.");
    }
  };

  const handleEditCategory = (cat) => {
    setCategoryForm({ id: cat.id, name: cat.name, description: cat.description });
    setShowNewCategoryForm(false);
    setEditingCategoryId(cat.id);
  };

  const handleNewCategory = () => {
    setCategoryForm({ id: null, name: '', description: '' });
    setEditingCategoryId(null);
    setShowNewCategoryForm(true);
  };

  const renderCategoryFormContent = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <label>Kategori Adı</label>
        <input value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label>Açıklama</label>
        <input value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} />
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>Kaydet</button>
        <button type="button" className="btn btn-secondary" onClick={() => { setEditingCategoryId(null); setShowNewCategoryForm(false); }}>İptal</button>
      </div>
    </div>
  );

  // ===============================
  // === 4. MÜŞTERİ & KUPON ===
  // ===============================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/customers`);
      setCustomers(response.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/coupons`);
      setCoupons(response.data);
    } catch(err) { console.error(err); }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/coupons`, couponForm);
      alert("Kupon oluşturuldu!");
      setShowCouponForm(false);
      fetchCoupons();
    } catch(err) { alert(err.response?.data?.message || "Hata"); }
  };

  const handleDeleteCoupon = async (id) => {
    if(!window.confirm("Silinsin mi?")) return;
    try {
      await axios.delete(`${API_URL}/admin/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch(err) { alert("Hata"); }
  };

  // ===============================
  // === 5. İLÇE (SEMT) YÖNETİMİ ===
  // ===============================
  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${API_URL}/districts`);
      setDistricts(response.data);
    } catch (err) { console.error(err); }
  };

  const handleAddDistrict = async (e) => {
    e.preventDefault();
    if (!newDistrictName.trim() || !newDistrictPrice) return;
    try {
      await axios.post(`${API_URL}/districts`, { 
        name: newDistrictName, 
        shippingPrice: parseFloat(newDistrictPrice), 
        active: true 
      });
      alert("İlçe eklendi!");
      setNewDistrictName('');
      setNewDistrictPrice('');
      fetchDistricts();
    } catch (err) {
      alert("Eklenemedi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteDistrict = async (id) => {
    if (!window.confirm("Bu ilçeyi silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`${API_URL}/districts/${id}`);
      fetchDistricts();
    } catch (err) {
      alert("Silinemedi.");
    }
  };

  const handleToggleDistrictStatus = async (id) => {
    try {
      await axios.put(`${API_URL}/districts/${id}/toggle-active`);
      fetchDistricts(); // Listeyi yenile
    } catch (err) {
      alert("Durum güncellenemedi: " + (err.response?.data?.message || err.message));
    }
  };

  // ===============================
  // === 6. YENİ: VİDEO YÖNETİMİ ===
  // ===============================
  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/settings/hero-video`);
      if(res.data.url) setHeroVideoUrl(res.data.url);
    } catch (e) { console.error(e); }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Videoyu sunucuya yükle 
      // (Not: Video yükleme için backend'de /upload/video yoksa /upload/image endpointi de 
      // genellikle dosya türü ayrımı yapmıyorsa çalışabilir. Güvenlik için video kontrolü backend'de olmalı)
      const uploadRes = await axios.post(`${API_URL}/upload/image`, formData, { 
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const newUrl = uploadRes.data.url;
      
      // 2. URL'i veritabanına kaydet
      await axios.post(`${API_URL}/settings/hero-video`, { url: newUrl });
      
      setHeroVideoUrl(newUrl);
      alert("Video başarıyla güncellendi!");
    } catch (err) {
      console.error(err);
      alert("Video yüklenirken hata oluştu. Dosya boyutu sunucu limitini aşıyor olabilir.");
    } finally {
      setVideoUploading(false);
    }
  };


  if (authLoading) return <div>Yükleniyor...</div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div style={{ padding: '40px 0' }}>
      
      <div className="admin-header">
        <h2 style={{ fontSize: '2rem', color: 'var(--primary)', margin: 0 }}>Yönetim Paneli</h2>
        <div className="admin-tabs">
          <button className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('stats')}>İstatistikler</button>
          <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('orders')}>Siparişler</button>
          <button className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('products')}>Ürünler</button>
          <button className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('categories')}>Kategoriler</button>
          <button className={`btn ${activeTab === 'districts' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('districts')}>İlçeler</button> 
          <button className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('customers')}>Müşteriler</button>
          <button className={`btn ${activeTab === 'coupons' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('coupons')}>Kuponlar</button>
          {/* YENİ SEKME BUTONU */}
          <button className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('settings')}>Site Ayarları</button>
        </div>
      </div>

      {/* === SEKME 1: İSTATİSTİKLER === */}
      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="product-card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Toplam Ciro</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats?.totalRevenue || 0} ₺</p>
          </div>
          <div className="product-card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Bugünkü Sipariş</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats?.newOrdersToday || 0}</p>
          </div>
          <div className="product-card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Bekleyen</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats?.pendingOrders || 0}</p>
          </div>
          <div className="product-card" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Stok Alarmı</h3>
            <ul style={{ textAlign: 'left', marginTop: '10px', fontSize: '0.9rem' }}>
              {stats?.lowStockProducts?.map(p => (
                <li key={p.id} style={{ color: 'var(--danger)' }}>• {p.name} ({p.stock} adet)</li>
              ))}
              {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && <li>Stok sorunu yok.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* === SEKME 2: SİPARİŞ YÖNETİMİ === */}
      {activeTab === 'orders' && (
        <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
          <h3 style={{ marginBottom: '20px' }}>Siparişler</h3>
          
          <form onSubmit={handleSearchOrders} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input 
              type="email" 
              placeholder="E-posta ile filtrele (Boş bırakırsan tümünü getirir)" 
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }} 
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
              {loading ? '...' : 'Ara / Yenile'}
            </button>
          </form>

          {foundOrders.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Fatura Bilgileri</th>
                    <th style={{ padding: '10px' }}>Teslimat Adresi</th>
                    <th style={{ padding: '10px', width: '25%' }}>Sipariş İçeriği</th>
                    <th style={{ padding: '10px' }}>Not</th>
                    <th style={{ padding: '10px' }}>Tutar</th>
                    <th style={{ padding: '10px' }}>Durum</th>
                    <th style={{ padding: '10px' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {foundOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px' }}>#{order.id}</td>
                      <td style={{ padding: '10px' }}>
                        <strong>{order.buyerName}</strong><br/>
                        <small style={{color:'var(--text-muted)'}}>{order.buyerEmail}</small><br/>
                        <small>{order.buyerPhone}</small>
                      </td>
                      <td style={{ padding: '10px' }}>
                        {order.addressLine}<br/>
                        <span style={{color:'var(--text-muted)'}}>{order.city} / {order.district}</span>
                        <div style={{marginTop:'5px', fontSize:'0.85rem', color:'var(--primary)', fontWeight:'bold'}}>
                           📅 {order.deliveryDate || 'Tarih Yok'} <br/>
                           ⏰ {order.deliveryTime || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '10px', backgroundColor: '#fafafa' }}>
                        {order.items && order.items.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary)', marginRight:'5px' }}>
                                  {item.quantity}x
                                </span>
                                {item.productName}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>Ürün bilgisi yok</span>
                        )}
                      </td>
                      <td style={{ padding: '10px', maxWidth:'150px', color:'var(--text-main)' }}>
                        {order.notes ? (
                           <span title={order.notes} style={{fontStyle: 'italic'}}>
                             {order.notes.length > 20 ? order.notes.substring(0, 20) + '...' : order.notes}
                           </span>
                        ) : (
                           <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{order.orderTotalTry} TL</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '10px', fontSize: '0.8em', fontWeight: 'bold',
                          background: order.status === 'DELIVERED' ? '#E8F5E9' : (order.status === 'PENDING' ? '#FFEBEE' : '#FFF3E0'),
                          color: order.status === 'DELIVERED' ? '#2E7D32' : (order.status === 'PENDING' ? '#C62828' : '#EF6C00'),
                          display: 'inline-block'
                        }}>
                          {statusMap[order.status] || order.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {order.status === 'PENDING' && (
                          <button className="btn btn-primary" style={{padding:'5px', fontSize:'0.7rem', backgroundColor:'#28a745', border:'none'}} onClick={() => handleUpdateStatus(order.id, 'PAID')}>
                            Ödemeyi Onayla
                          </button>
                        )}
                        {order.status === 'PAID' && <button className="btn btn-secondary" style={{padding:'5px', fontSize:'0.7rem'}} onClick={() => handleUpdateStatus(order.id, 'PREPARING')}>Hazırla</button>}
                        {order.status === 'PREPARING' && <button className="btn btn-secondary" style={{padding:'5px', fontSize:'0.7rem'}} onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}>Kargola</button>}
                        {order.status === 'SHIPPED' && <button className="btn btn-primary" style={{padding:'5px', fontSize:'0.7rem'}} onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}>Teslim Et</button>}
                        
                        {order.status !== 'DELIVERED' && order.status !== 'CANCELED' && (
                          <button style={{marginTop:'5px', background:'none', border:'none', color:'red', cursor:'pointer', fontSize:'0.7rem', textDecoration:'underline'}} onClick={() => handleUpdateStatus(order.id, 'CANCELED')}>
                            İptal Et
                          </button>
                        )}
                        <button 
                          onClick={async () => {
                            if (window.confirm('Bu siparişi ve tüm kayıtlarını KALICI OLARAK silmek istediğine emin misin?')) {
                              try {
                                await axios.delete(`${API_URL}/orders/${order.id}`);
                                handleSearchOrders({ preventDefault: () => {} });
                                alert('Sipariş silindi.');
                              } catch (err) { alert('Silinemedi: ' + err.message); }
                            }
                          }}
                          style={{
                            marginTop: '10px', background: '#dc3545', color: 'white', border: 'none', 
                            padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'
                          }}
                        >
                          🗑️ SİL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Sipariş bulunamadı.</p>
          )}
        </div>
      )}

      {/* === SEKME 3: ÜRÜN YÖNETİMİ === */}
      {activeTab === 'products' && (
        <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Ürün Listesi</h3>
            <button className="btn btn-primary" onClick={handleNewProduct}>+ Yeni Ürün Ekle</button>
          </div>

          {showNewProductForm && (
            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius)', marginBottom: '30px', border: '1px solid var(--primary)' }}>
              <h4 style={{marginBottom: '15px'}}>Yeni Ürün Ekle</h4>
              <form onSubmit={handleSaveProduct}>
                 {renderProductFormContent()}
              </form>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                  <th style={{ padding: '10px', width: '60px' }}>Resim</th>
                  <th style={{ padding: '10px' }}>Ad</th>
                  <th style={{ padding: '10px', width: '100px' }}>Fiyat</th>
                  <th style={{ padding: '10px', width: '80px' }}>Stok</th>
                  <th style={{ padding: '10px', textAlign: 'right', width: '160px' }}>İşlemler</th>
                </tr>
              </thead>
              {products.map(p => (
                <tbody key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <td style={{ padding: '10px' }}>
                      <img src={p.imageUrl || 'https://placehold.co/50'} alt="" style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} />
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.name}</td>
                    <td style={{ padding: '10px' }}>{p.priceTry} TL</td>
                    <td style={{ padding: '10px', color: p.stock < 10 ? 'red' : 'inherit' }}>{p.stock}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      {editingProductId === p.id ? (
                          <button onClick={handleCancelEdit} style={{marginRight:'10px', cursor:'pointer', border:'none', background:'none', color:'gray'}}>Kapat</button>
                      ) : (
                          <button onClick={() => handleEditProduct(p)} style={{marginRight:'10px', cursor:'pointer', border:'none', background:'none', color:'blue'}}>Düzenle</button>
                      )}
                      <button onClick={() => handleDeleteProduct(p.id)} style={{cursor:'pointer', border:'none', background:'none', color:'red'}}>Sil</button>
                    </td>
                  </tr>
                  
                  {editingProductId === p.id && (
                    <tr style={{ backgroundColor: '#f9f9f9' }}>
                      <td colSpan="5" style={{ padding: '20px', borderTop: '1px dashed #ccc' }}>
                        <h4 style={{marginBottom:'10px'}}>Ürünü Düzenle: {p.name}</h4>
                        <form onSubmit={handleSaveProduct}>
                          {renderProductFormContent()}
                        </form>
                      </td>
                    </tr>
                  )}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}

      {/* === SEKME 4: KATEGORİ YÖNETİMİ === */}
      {activeTab === 'categories' && (
        <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Kategori Listesi</h3>
            <button className="btn btn-primary" onClick={handleNewCategory}>+ Yeni Kategori</button>
          </div>

          {showNewCategoryForm && (
            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius)', marginBottom: '30px', border: '1px solid var(--primary)' }}>
              <h4 style={{marginBottom: '15px'}}>Yeni Kategori Ekle</h4>
              <form onSubmit={handleSaveCategory}>
                 {renderCategoryFormContent()}
              </form>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                  <th style={{padding:'10px', width:'50px'}}>ID</th>
                  <th style={{padding:'10px'}}>Ad</th>
                  <th style={{padding:'10px'}}>Açıklama</th>
                  <th style={{padding:'10px', width:'150px', textAlign:'right'}}>İşlem</th>
                </tr>
              </thead>
              {categories.map(c => (
                <tbody key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <td style={{padding:'10px'}}>{c.id}</td>
                    <td style={{padding:'10px'}}><strong>{c.name}</strong></td>
                    <td style={{padding:'10px'}}>{c.description}</td>
                    <td style={{padding:'10px', textAlign:'right'}}>
                        {editingCategoryId === c.id ? (
                          <button onClick={() => setEditingCategoryId(null)} style={{marginRight:'10px', color:'gray', border:'none', background:'none', cursor:'pointer'}}>Kapat</button>
                        ) : (
                          <button onClick={() => handleEditCategory(c)} style={{marginRight:'10px', color:'blue', border:'none', background:'none', cursor:'pointer'}}>Düzenle</button>
                        )}
                      <button onClick={() => handleDeleteCategory(c.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Sil</button>
                    </td>
                  </tr>

                  {editingCategoryId === c.id && (
                    <tr style={{ backgroundColor: '#f9f9f9' }}>
                      <td colSpan="4" style={{ padding: '20px', borderTop: '1px dashed #ccc' }}>
                          <h4 style={{marginBottom:'10px'}}>Kategoriyi Düzenle: {c.name}</h4>
                          <form onSubmit={handleSaveCategory}>
                            {renderCategoryFormContent()}
                          </form>
                      </td>
                    </tr>
                  )}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}

      {/* === SEKME 5: İLÇE (SEMT) YÖNETİMİ === */}
      {activeTab === 'districts' && (
        <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Hizmet Verilen İlçeler & Fiyatlar</h3>
          </div>

          {/* Yeni İlçe Ekleme Formu */}
          <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius)', marginBottom: '30px', border: '1px solid var(--primary)' }}>
             <h4 style={{marginBottom: '15px'}}>Yeni İlçe Ekle</h4>
             <form onSubmit={handleAddDistrict} style={{ display: 'flex', gap: '10px', flexWrap:'wrap' }}>
               <input 
                 type="text" 
                 placeholder="İlçe Adı (Örn: Kadıköy)" 
                 value={newDistrictName}
                 onChange={(e) => setNewDistrictName(e.target.value)}
                 style={{ flex: 2, minWidth:'200px' }}
                 required
               />
               <input 
                 type="number" 
                 placeholder="Kargo Ücreti (TL)" 
                 value={newDistrictPrice}
                 onChange={(e) => setNewDistrictPrice(e.target.value)}
                 style={{ flex: 1, minWidth:'150px' }}
                 required
               />
               <button type="submit" className="btn btn-primary">Ekle</button>
             </form>
          </div>

          {/* İlçe Listesi */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                  <th style={{padding:'10px'}}>ID</th>
                  <th style={{padding:'10px'}}>İlçe Adı</th>
                  <th style={{padding:'10px'}}>Kargo Ücreti</th>
                  <th style={{padding:'10px'}}>Durum</th>
                  <th style={{padding:'10px'}}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {districts.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{padding:'10px'}}>{d.id}</td>
                    <td style={{padding:'10px'}}><strong>{d.name}</strong></td>
                    <td style={{padding:'10px'}}>{d.shippingPrice} TL</td>
                    <td style={{padding:'10px'}}>
                      {/* --- TIKLANABİLİR DURUM BUTONU --- */}
                      <button 
                        onClick={() => handleToggleDistrictStatus(d.id)}
                        className={d.active ? 'btn btn-primary' : 'btn btn-secondary'}
                        style={{
                          padding: '5px 12px', 
                          fontSize: '0.8rem', 
                          backgroundColor: d.active ? '#28a745' : '#6c757d', // Aktifse Yeşil, Pasifse Gri
                          borderColor: d.active ? '#28a745' : '#6c757d',
                          color: 'white'
                        }}
                      >
                        {d.active ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td style={{padding:'10px'}}>
                      <button onClick={() => handleDeleteDistrict(d.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Sil</button>
                    </td>
                  </tr>
                ))}
                {districts.length === 0 && (
                  <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#777'}}>Henüz ilçe eklenmemiş.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === SEKME 6: MÜŞTERİ LİSTESİ === */}
      {activeTab === 'customers' && (
        <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
          <h3 style={{ marginBottom: '20px' }}>Kayıtlı Müşteriler</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                  <th style={{padding:'10px'}}>ID</th>
                  <th style={{padding:'10px'}}>Ad Soyad</th>
                  <th style={{padding:'10px'}}>E-posta</th>
                  <th style={{padding:'10px'}}>Telefon</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(cust => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{padding:'10px'}}>{cust.id}</td>
                    <td style={{padding:'10px'}}><strong>{cust.fullName}</strong></td>
                    <td style={{padding:'10px'}}>{cust.email}</td>
                    <td style={{padding:'10px'}}>{cust.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === SEKME 7: KUPON YÖNETİMİ === */}
      {activeTab === 'coupons' && (
        <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Kupon Listesi</h3>
            <button className="btn btn-primary" onClick={() => setShowCouponForm(true)}>+ Yeni Kupon</button>
          </div>

          {showCouponForm && (
             <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius)', marginBottom: '30px', border: '1px solid var(--primary)' }}>
               <form onSubmit={handleSaveCoupon} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                 <div className="form-row">
                   <div className="input-group">
                     <label>Kupon Kodu</label>
                     <input value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} placeholder="Örn: BAHAR20" required />
                   </div>
                   <div className="input-group">
                     <label>İndirim Yüzdesi (%)</label>
                     <input type="number" value={couponForm.discountPercentage} onChange={e => setCouponForm({...couponForm, discountPercentage: e.target.value})} required />
                   </div>
                 </div>
                 <div className="form-row">
                   <div className="input-group">
                     <label>Son Kullanma</label>
                     <input type="date" value={couponForm.expirationDate} onChange={e => setCouponForm({...couponForm, expirationDate: e.target.value})} required />
                   </div>
                   <div className="input-group">
                     <label>Min. Sepet Tutarı</label>
                     <input type="number" value={couponForm.minCartAmount} onChange={e => setCouponForm({...couponForm, minCartAmount: e.target.value})} required />
                   </div>
                 </div>
                 <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                   <button type="submit" className="btn btn-primary">Kaydet</button>
                   <button type="button" className="btn btn-secondary" onClick={() => setShowCouponForm(false)}>İptal</button>
                 </div>
               </form>
             </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                  <th style={{padding:'10px'}}>Kod</th>
                  <th style={{padding:'10px'}}>İndirim</th>
                  <th style={{padding:'10px'}}>SKT</th>
                  <th style={{padding:'10px'}}>Min. Tutar</th>
                  <th style={{padding:'10px'}}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{padding:'10px'}}><strong>{c.code}</strong></td>
                    <td style={{padding:'10px'}}>%{c.discountPercentage}</td>
                    <td style={{padding:'10px'}}>{c.expirationDate}</td>
                    <td style={{padding:'10px'}}>{c.minCartAmount} TL</td>
                    <td style={{padding:'10px'}}>
                      <button onClick={() => handleDeleteCoupon(c.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === SEKME 8: SİTE AYARLARI (YENİ EKLENEN KISIM) === */}
      {activeTab === 'settings' && (
        <div className="product-card" style={{ padding: '30px', height: 'auto' }}>
          <h3 style={{ marginBottom: '20px' }}>Site Genel Ayarları</h3>
          
          <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '15px' }}>Anasayfa Kapak Videosu</h4>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'10px'}}>
                Mevcut Video:
              </p>
              {/* VİDEO ÖNİZLEME */}
              <div style={{maxWidth:'500px', borderRadius:'10px', overflow:'hidden', boxShadow:'0 5px 15px rgba(0,0,0,0.1)'}}>
                <video 
                  src={heroVideoUrl || '/video.mp4'} 
                  controls 
                  style={{ width: '100%', display:'block' }} 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Yeni Video Yükle (MP4)</label>
              <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <input 
                  type="file" 
                  accept="video/mp4,video/webm" 
                  onChange={handleVideoUpload} 
                  disabled={videoUploading}
                  style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', flex:1}}
                />
              </div>
              {videoUploading && <p style={{color:'var(--primary)', fontWeight:'bold', marginTop:'10px'}}>🚀 Video sunucuya yükleniyor, lütfen bekleyiniz...</p>}
            </div>
            <p style={{fontSize:'0.8rem', color:'#888', marginTop:'10px'}}>Not: Yüksek boyutlu videoların yüklenmesi sunucu hızına bağlı olarak zaman alabilir.</p>
          </div>
        </div>
      )}

    </div>
  );
}