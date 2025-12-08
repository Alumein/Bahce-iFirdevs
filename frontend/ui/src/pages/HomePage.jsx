// Konum: frontend/ui/src/pages/HomePage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { useWishlist } from '../context/WishlistContext';

const API_URL = 'http://localhost:8080/api';

export default function HomePage() {
  const [kategoriler, setKategoriler] = useState([]);
  const [urunler, setUrunler] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState(''); 
  const [activeSearch, setActiveSearch] = useState(''); 
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isFavorite, toggleFavorite } = useWishlist();

  useEffect(() => {
    const fetchKategoriler = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setKategoriler(response.data);
      } catch (err) { console.error(err); }
    };
    fetchKategoriler();
  }, []);

  useEffect(() => {
    const fetchUrunler = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/products/page`, {
          params: { page: 0, size: 20, sort: 'createdAt,desc', q: activeSearch, categoryId: selectedCategoryId }
        });
        setUrunler(response.data.content);
        setError(null);
      } catch (err) { setError("Ürünler yüklenemedi."); } 
      finally { setLoading(false); }
    };
    fetchUrunler();
  }, [activeSearch, selectedCategoryId]); 

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const handleCategoryClick = (catId) => {
    setSelectedCategoryId(prev => prev === catId ? null : catId);
  };

  return (
    <div>
      {/* --- KAMPANYA BİLDİRİMİ --- */}
      <div style={{
        background: '#212529', color: '#fff', textAlign: 'center', padding: '10px', 
        fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px', margin: 0, position: 'relative', zIndex: 2
      }}>
        🚚 <strong>TÜM SİPARİŞLERDE KARGO BEDAVA!</strong> | İstanbul İçi Aynı Gün Teslimat Fırsatı
      </div>

      {/* --- HERO (Banner) --- */}
      {!activeSearch && !selectedCategoryId && (
        <div className="hero" style={{ marginTop: 0 }}>
          <div className="hero-content">
            <h2>Doğanın En Güzel Hediyesi</h2>
            <p>Özel günleriniz için en taze ve zarif aranjmanlar.</p>
            <button className="btn btn-primary" onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})}>
              Alışverişe Başla
            </button>
          </div>
        </div>
      )}

      {/* --- ARAMA & FİLTRE ALANI --- */}
      <div style={{ maxWidth: '900px', margin: '30px auto', textAlign: 'center', padding: '0 10px' }}>
        
        {/* --- SEARCH BAR (KOMPAKT & GÜÇLÜ YAPI) --- */}
        <form 
          onSubmit={handleSearchSubmit} 
          style={{ 
            display: 'flex',            
            alignItems: 'center',       
            justifyContent: 'space-between', 
            
            width: '90%',               /* Mobilde kenarlardan pay bırakır */
            maxWidth: '500px',          /* Masaüstünde çok genişlemez */
            height: '42px',             /* Daha ince ve zarif yükseklik */
            
            margin: '0 auto 25px auto',
            background: 'white',
            
            border: '1px solid #ddd',
            borderRadius: '50px',       
            boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
            overflow: 'hidden',         
            boxSizing: 'border-box'
          }}
        >
          <input 
            type="text" 
            placeholder="Çiçek ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',                /* Kalan alanı doldur */
              minWidth: '0',            /* KRİTİK: Mobilde inputun küçülmesine izin ver (Butonu kurtarır) */
              height: '100%',
              
              padding: '0 15px',        /* İç boşluk */
              fontSize: '0.9rem',
              color: '#333',
              
              border: 'none',           
              outline: 'none',          
              background: 'transparent',
              margin: '0',
              boxSizing: 'border-box'
            }}
          />
          
          <button 
            type="submit"
            style={{
              height: '100%',           
              padding: '0 15px',        /* Butonu daralttık */
              minWidth: '60px',         /* Çok da küçülmesin */
              
              background: '#007bff',
              color: 'white',
              
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.8rem',       /* Yazı boyutu küçüldü */
              
              flexShrink: '0',          /* KRİTİK: Buton asla kaybolmaz */
              whiteSpace: 'nowrap',     
              margin: '0',
              borderRadius: '0',
              lineHeight: '1'
            }}
          >
            ARA
          </button>
        </form>

        {/* Kategori Filtresi */}
        <div className="filter-bar mobile-category-grid" style={{flexWrap:'wrap', justifyContent:'center', marginTop:'20px'}}>
          <div 
            className={`filter-btn ${selectedCategoryId === null ? 'active' : ''}`}
            onClick={() => setSelectedCategoryId(null)}
          >
            Tümü
          </div>
          {kategoriler.map(kategori => (
            <div 
              key={kategori.id} 
              className={`filter-btn ${selectedCategoryId === kategori.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(kategori.id)}
            >
              {kategori.name}
            </div>
          ))}
        </div>
      </div>

      {/* --- LİSTE BAŞLIĞI --- */}
      <div className="container">
        <h3 style={{ 
          marginBottom: '20px', fontSize: '1.4rem', fontFamily: 'var(--font-heading)', 
          borderLeft: '4px solid var(--primary)', paddingLeft: '15px', color: 'var(--text-main)'
        }}>
          {selectedCategoryId ? 'Kategori Sonuçları' : 'Öne Çıkan Ürünler'} 
          {activeSearch && ` - Arama: "${activeSearch}"`}
        </h3>
        
        {/* --- ÜRÜN LİSTESİ --- */}
        {loading ? (
          <div style={{textAlign: 'center', padding: '50px'}}>Yükleniyor...</div>
        ) : error ? (
          <p style={{ color: 'red', textAlign:'center' }}>{error}</p>
        ) : urunler.length === 0 ? (
          <div style={{textAlign: 'center', padding: '50px', background: '#f9f9f9', borderRadius: '10px'}}>
            <h3>Üzgünüz, ürün bulunamadı.</h3>
            <p>Farklı bir arama yapmayı veya filtreleri temizlemeyi deneyin.</p>
          </div>
        ) : (
          <div className="grid-layout">
            {urunler.map(urun => (
              <div key={urun.id} className="product-card">
                <button 
                  className="fav-btn"
                  style={{ color: isFavorite(urun.id) ? '#E91E63' : '#CCC', fontSize: '1.5rem', zIndex: 10 }}
                  onClick={(e) => { e.preventDefault(); toggleFavorite(urun.id); }}
                >
                  {isFavorite(urun.id) ? '❤️' : '🤍'}
                </button>
                <Link to={`/product/${urun.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="card-img-wrapper">
                    <img src={urun.imageUrl || 'https://placehold.co/400x300'} alt={urun.name} />
                  </div>
                  <div className="card-info">
                    <h4 className="card-title">{urun.name}</h4>
                    <p className="card-desc">
                      {urun.shortDescription ? urun.shortDescription.substring(0, 50) + '...' : 'Doğal ve taze.'}
                    </p>
                    <div className="card-footer">
                      <span className="price">{urun.priceTry} TL</span>
                      {urun.stock > 0 ? (
                         <span style={{ fontSize: '0.85rem', background: '#E8F5E9', color: '#2E7D32', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>Stokta Var</span>
                      ) : (
                         <span style={{ fontSize: '0.85rem', background: '#FFEBEE', color: '#C62828', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>Tükendi</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div> 
            ))}
          </div>
        )}
      </div>
    </div>
  );
}