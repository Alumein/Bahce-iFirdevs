// Konum: frontend/ui/src/pages/ShopPage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- FİLTRE STATELERİ ---
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') ? Number(searchParams.get('category')) : 0;
  const initialSearch = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const { isFavorite, toggleFavorite } = useWishlist();

  // 1. Kategorileri ve Ürünleri Çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/products`) 
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const catParam = searchParams.get('category');
    const qParam = searchParams.get('q');
    if (catParam) setSelectedCategory(Number(catParam));
    if (qParam) setSearchTerm(qParam);
  }, [searchParams]);

  // --- FİLTRELEME MANTIĞI ---
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 0 || product.categoryId === selectedCategory;
    const price = product.priceTry || 0;
    const minMatch = minPrice === '' || price >= Number(minPrice);
    const maxMatch = maxPrice === '' || price <= Number(maxPrice);
    const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && minMatch && maxMatch && nameMatch;
  });

  const clearFilters = () => {
    setSelectedCategory(0);
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
  };

  return (
    <div className="container" style={{ padding: '40px 15px' }}>
      
      {/* BAŞLIK */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px', color: 'var(--primary)'}}>Mağaza</h1>
        <p style={{ color: '#666' }}>Doğanın en güzel renklerini keşfedin.</p>
      </div>

      {/* --- FİLTRE BAR --- */}
      <div style={{ 
        backgroundColor: '#F5F1E8', 
        padding: '25px', 
        borderRadius: '20px', 
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
        marginBottom: '40px',
        border: '1px solid #eee'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'end' }}>
          
          {/* Kategori */}
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>Kategori Seçin</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', cursor: 'pointer', backgroundColor: '#f9f9f9' }}
            >
              <option value={0}>✨ Tüm Ürünler</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Fiyatlar */}
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#555' }}>En Az (TL)</label>
            <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} />
          </div>
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#555' }}>En Çok (TL)</label>
            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} />
          </div>

          {/* Temizle */}
          <div style={{ flex: '0 0 auto' }}>
            <button onClick={clearFilters} className="btn btn-secondary" style={{ padding: '12px 25px', borderRadius: '12px', fontSize: '0.9rem' }}>
              Filtreleri Temizle ✕
            </button>
          </div>
        </div>
      </div>

      {/* --- ÜRÜN LİSTESİ --- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#777', fontSize: '1.2rem' }}>
          Aradığınız kriterlere uygun ürün bulunamadı. 🥀
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '20px', color: '#888', fontStyle: 'italic' }}>
            Toplam <strong>{filteredProducts.length}</strong> ürün listeleniyor.
          </p>
          
          <div className="grid-layout">
            {filteredProducts.map(urun => (
              <div key={urun.id} className="product-card">
                
                <button 
                  className="fav-btn" 
                  onClick={(e) => { e.preventDefault(); toggleFavorite(urun.id); }}
                  style={{ color: isFavorite(urun.id) ? '#E91E63' : '#CCC' }}
                >
                  {isFavorite(urun.id) ? '❤️' : '🤍'}
                </button>

                <Link to={`/product/${urun.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  
                  {/* --- GÜNCELLENEN KISIM: RESİM WRAPPER (HOVER MANTIĞI) --- */}
                  <div className="card-img-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                    
                    {/* 1. ANA RESİM (Her zaman arkada) */}
                    <img 
                      src={urun.imageUrl || 'https://placehold.co/400x300'} 
                      alt={urun.name} 
                      style={{ 
                        width: '100%', height: '100%', objectFit: 'cover', 
                        transition: 'opacity 0.5s ease' 
                      }}
                    />

                    {/* 2. İKİNCİ RESİM (Varsa üstüne bindir, opacity: 0 yap) */}
                    {urun.imageUrl2 && (
                      <img 
                        src={urun.imageUrl2} 
                        alt={urun.name} 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0, // Varsayılan gizli
                          transition: 'opacity 0.4s ease',
                          zIndex: 2
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      />
                    )}
                  </div>
                  {/* -------------------------------------------------------- */}

                  <div className="card-info">
                    <h4 className="card-title">{urun.name}</h4>
                    <div className="card-footer">
                      <span className="price">{urun.priceTry} TL</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}