// Konum: frontend/ui/src/pages/AdminDashboardPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Sipariş Durumu Çeviri Haritası
const statusMap = {
  PENDING: 'Beklemede',
  PAID: 'Ödendi',
  PREPARING: 'Hazırlanıyor',
  SHIPPED: 'Kargolandı',
  DELIVERED: 'Teslim Edildi',
  CANCELED: 'İptal Edildi'
};

export default function AdminDashboardPage() {
  const { isAdmin, authLoading } = useAuth();

  // --- STATE'LER ---
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'orders' | 'products' | 'categories' | 'customers' | 'coupons'
  const [loading, setLoading] = useState(false);
  
  // Dashboard İstatistikleri
  const [stats, setStats] = useState(null);

  // Sipariş Yönetimi
  const [searchEmail, setSearchEmail] = useState('');
  const [foundOrders, setFoundOrders] = useState([]);

  // Ürün Yönetimi
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null, name: '', shortDescription: '', priceTry: '', stock: '', categoryId: '', imageUrl: ''
  });
  const [uploading, setUploading] = useState(false);

  // Kategori Yönetimi
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', description: '' });

  // Müşteri Yönetimi
  const [customers, setCustomers] = useState([]);

  // Kupon Yönetimi
  const [coupons, setCoupons] = useState([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({ 
    code: '', discountPercentage: 20, expirationDate: '', minCartAmount: 0 
  });

  // --- İLK YÜKLEME ---
  useEffect(() => {
    if (isAdmin) {
      axios.get(`${API_URL}/admin/dashboard/stats`)
        .then(res => setStats(res.data))
        .catch(console.error);

      // Kategorileri her zaman çek (Ürün eklerken lazım)
      axios.get(`${API_URL}/categories`)
        .then(res => setCategories(res.data))
        .catch(console.error);
    }
  }, [isAdmin]);

  // --- SEKME DEĞİŞİMİ ---
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      handleSearchOrders({ preventDefault: () => {} });
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'customers') {
      fetchCustomers();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    }
  }, [activeTab]);


  // ===============================
  // === 1. SİPARİŞ FONKSİYONLARI ===
  // ===============================
  const handleSearchOrders = async (e) => {
    if(e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (searchEmail.trim()) {
        params.email = searchEmail;
      }
      const response = await axios.get(`${API_URL}/orders`, { params });
      setFoundOrders(response.data);
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
      imageUrl: product.imageUrl || ''
    });
    setShowProductForm(true);
  };

  const handleNewProduct = () => {
    setProductForm({ id: null, name: '', shortDescription: '', priceTry: '', stock: '', categoryId: categories[0]?.id || '', imageUrl: '' });
    setShowProductForm(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProductForm(prev => ({ ...prev, imageUrl: response.data.url }));
    } catch (err) {
      console.error("Yükleme hatası:", err);
      alert("Resim yüklenemedi.");
    } finally {
      setUploading(false);
    }
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
      
      setShowProductForm(false);
      fetchProducts(); 

    } catch (err) {
      console.error(err);
      alert("Kaydedilemedi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // === 3. KATEGORİ FONKSİYONLARI ===
  // ===============================
  const fetchCategories = async () => {
  try { 
    const res = await axios.get(`${API_URL}/categories`);
    const sortedCategories = res.data.sort((a, b) => a.id - b.id);
    setCategories(sortedCategories); 
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
      setShowCategoryForm(false);
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
    setShowCategoryForm(true);
  };

  const handleNewCategory = () => {
    setCategoryForm({ id: null, name: '', description: '' });
    setShowCategoryForm(true);
  };

  // ===============================
  // === 4. MÜŞTERİ FONKSİYONLARI ===
  // ===============================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/customers`);
      setCustomers(response.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  // ============================
  // === 5. KUPON FONKSİYONLARI ===
  // ============================
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


  // --- Yetki Kontrolü ---
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
          <button className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('customers')}>Müşteriler</button>
          <button className={`btn ${activeTab === 'coupons' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('coupons')}>Kuponlar</button>
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
                    <th style={{ padding: '10px' }}>Müşteri Notu</th>
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
                      
                      <td style={{ padding: '10px', maxWidth:'200px', color:'var(--text-main)' }}>
                        {order.notes ? (
                           <span title={order.notes} style={{fontStyle: 'italic'}}>
                             {order.notes.length > 30 ? order.notes.substring(0, 30) + '...' : order.notes}
                           </span>
                        ) : (
                           <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{order.orderTotalTry} TL</td>
                      
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '10px', fontSize: '0.8em', fontWeight: 'bold',
                          background: order.status === 'DELIVERED' ? '#E8F5E9' : '#FFF3E0',
                          color: order.status === 'DELIVERED' ? '#2E7D32' : '#EF6C00',
                          display: 'inline-block'
                        }}>
                          {statusMap[order.status] || order.status}
                        </span>
                      </td>
                      
                      <td style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {order.status === 'PAID' && <button className="btn btn-secondary" style={{padding:'5px', fontSize:'0.7rem'}} onClick={() => handleUpdateStatus(order.id, 'PREPARING')}>Hazırla</button>}
                        {order.status === 'PREPARING' && <button className="btn btn-secondary" style={{padding:'5px', fontSize:'0.7rem'}} onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}>Kargola</button>}
                        {order.status === 'SHIPPED' && <button className="btn btn-primary" style={{padding:'5px', fontSize:'0.7rem'}} onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}>Teslim Et</button>}
                        {order.status === 'DELIVERED' && <span style={{color:'green', textAlign:'center'}}>✓ Tamam</span>}
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

          {showProductForm && (
            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius)', marginBottom: '30px', border: '1px solid var(--primary)' }}>
              <h4 style={{marginBottom: '15px'}}>{productForm.id ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h4>
              <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                
                {/* DOSYA YÜKLEME ALANI */}
                <div>
                  <label>Ürün Resmi (Dosya Seç)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{width:'auto'}} />
                    {uploading && <span>Yükleniyor...</span>}
                  </div>
                  {productForm.imageUrl && (
                    <div style={{ marginTop: '5px' }}>
                      <small style={{color:'green'}}>Resim Yüklendi!</small>
                      <img src={productForm.imageUrl} alt="Önizleme" style={{height:'50px', marginLeft:'10px', verticalAlign:'middle'}} />
                    </div>
                  )}
                  <input type="hidden" value={productForm.imageUrl} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Kısa Açıklama</label>
                  <textarea rows="3" value={productForm.shortDescription} onChange={e => setProductForm({...productForm, shortDescription: e.target.value})} />
                </div>
                
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>İptal</button>
                </div>
              </form>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Resim</th>
                  <th style={{ padding: '10px' }}>Ad</th>
                  <th style={{ padding: '10px' }}>Fiyat</th>
                  <th style={{ padding: '10px' }}>Stok</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px' }}>
                      <img src={p.imageUrl || 'https://placehold.co/50'} alt="" style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} />
                    </td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.name}</td>
                    <td style={{ padding: '10px' }}>{p.priceTry} TL</td>
                    <td style={{ padding: '10px', color: p.stock < 10 ? 'red' : 'inherit' }}>{p.stock}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button onClick={() => handleEditProduct(p)} style={{marginRight:'10px', cursor:'pointer', border:'none', background:'none', color:'blue'}}>Düzenle</button>
                      <button onClick={() => handleDeleteProduct(p.id)} style={{cursor:'pointer', border:'none', background:'none', color:'red'}}>Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
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

          {showCategoryForm && (
            <div style={{ background: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius)', marginBottom: '30px', border: '1px solid var(--primary)' }}>
              <form onSubmit={handleSaveCategory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryForm(false)}>İptal</button>
                </div>
              </form>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-body)', textAlign: 'left' }}>
                  <th style={{padding:'10px'}}>ID</th>
                  <th style={{padding:'10px'}}>Ad</th>
                  <th style={{padding:'10px'}}>Açıklama</th>
                  <th style={{padding:'10px'}}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{padding:'10px'}}>{c.id}</td>
                    <td style={{padding:'10px'}}><strong>{c.name}</strong></td>
                    <td style={{padding:'10px'}}>{c.description}</td>
                    <td style={{padding:'10px'}}>
                      <button onClick={() => handleEditCategory(c)} style={{marginRight:'10px', color:'blue', border:'none', background:'none', cursor:'pointer'}}>Düzenle</button>
                      <button onClick={() => handleDeleteCategory(c.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === SEKME 5: MÜŞTERİ LİSTESİ === */}
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

      {/* === SEKME 6: KUPON YÖNETİMİ === */}
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

    </div>
  );
}