// Konum: frontend/ui/src/pages/HomePage.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

const CAT_IDS = {
  BUKET: 3,   
  VAZO: 1,    
  CELENK: 2,
  PASTA: 17,
  GUL: 4
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- YENİ: VİDEO STATE ---
  const [heroVideo, setHeroVideo] = useState('/video.mp4'); // Başlangıçta varsayılanı kullan

  const { isFavorite, toggleFavorite } = useWishlist();

  // --- SAYFA YÜKLENİNCE ---
  useEffect(() => {
    // 1. Vitrin Ürünlerini Çek
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/page`, {
          params: { page: 0, size: 20, sort: 'createdAt,desc' }
        });
        
        const allProducts = response.data.content;
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 3));

      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };

    // 2. Video Ayarını Çek (Database'den)
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/settings/hero-video`);
        if (res.data && res.data.url) {
          setHeroVideo(res.data.url);
        }
      } catch (e) {
        console.log("Özel video ayarı bulunamadı, varsayılan kullanılıyor.");
      }
    };

    fetchFeatured();
    fetchSettings();
  }, []);

  const categories = [
    { id: 1, title: 'Buketler', img: '/karisikbuket.png', link: `/shop?category=${CAT_IDS.BUKET}` },
    { id: 2, title: 'Vazo Çiçekleri', img: 'karisikvazobeyaz.png', link: `/shop?category=${CAT_IDS.VAZO}` },
    { id: 3, title: 'Tören Çelenkleri', img: 'cenazevemerasimcelenk.png', link: `/shop?category=${CAT_IDS.CELENK}` },
  ];

  return (
    <>
      {/* 1. SCROLLBAR FIX (Yatay Kaydırma Engelleme) */}
      <style>{`
        html, body {
          overflow-x: hidden !important;
          max-width: 100% !important;
          margin: 0;
          padding: 0;
        }
      `}</style>

      {/* Ana Wrapper */}
      <div style={{ paddingBottom: '50px' }}>
        
        {/* 2. VIDEO HERO BANNER (Tam Ekran) */}
        <div style={{ 
          position: 'relative',
          width: '100vw', 
          height: 'calc(100vh - 80px)', 
          
          /* BREAKOUT (Kapsayıcı dışına taşma) */
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          
          marginTop: 0,
          overflow: 'hidden' 
        }}>
          
          {/* --- DİNAMİK VİDEO --- */}
          <video 
            key={heroVideo} // URL değişince bileşeni yenilemek için
            autoPlay 
            loop 
            muted 
            playsInline 
            src={heroVideo}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              zIndex: 0,
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              willChange: 'transform'
            }}
          />

          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1 }}></div>

          {/* --- HERO METNİ --- */}
          <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            textAlign: 'center', 
            color: 'white',
            padding: '0 20px'
          }}>
            <h1 style={{ 
              fontSize: '4rem', 
              fontFamily: 'var(--font-heading)', 
              marginBottom: '20px', 
              textShadow: '0 4px 15px rgba(0,0,0,0.5)' 
            }}>
              Sevdiklerinizle En Özel Anlarınızda
            </h1>
            <p style={{ 
              fontSize: '1.4rem', 
              maxWidth: '800px', 
              marginBottom: '40px', 
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              lineHeight: '1.6'
            }}>
              Bahçe-i Firdevs koleksiyonu ruhunuza dokunan kokuları ve  <br/>
              büyüleyici renkleriyle Cennet esintilerini evinize getiriyor.
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem', borderRadius: '0', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
              Koleksiyonu Keşfet
            </Link>
          </div>
        </div>

        {/* 3. İÇERİK KISMI (CONTAINER İÇİNDE) */}
        <div className="container" style={{ marginTop: '80px' }}>

          {/* Koleksiyonlar */}
          <div style={{ padding: '80px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Koleksiyonlar</span>
              <h2 style={{ fontSize: '2.5rem', marginTop: '10px', color: 'var(--primary)' }}>Zevkinize Uygun Seçimler</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              {categories.map(cat => (
                <Link to={cat.link} key={cat.id} style={{ position: 'relative', height: '400px', borderRadius: '0', overflow: 'hidden', display: 'block' }}>
                  <div style={{ width: '100%', height: '100%', backgroundImage: `url(${cat.img})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s' }} 
                       onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                       onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '0', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem',color: 'var(--primary)' }}>{cat.title}</h3>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>İncele &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 4. VİTRİN (ARKAPLAN BEYAZ VE KÖŞELİ) */}
          <div style={{ 
            padding: '50px 0', 
            background: '#F5F1E8', /* Beyaz Arkaplan */
            borderRadius: '0',   /* Köşeli */
            marginBottom: '80px' 
          }}>
            <div style={{ padding: '0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '5px',color: 'var(--primary)' }}>Vitrin Ürünleri</h2>
                  <p style={{ color: '#666' }}>Sizin için seçtiğimiz özel tasarımlar.</p>
                </div>
                <Link to="/shop" className="btn btn-secondary">Tümünü Gör</Link>
              </div>
              {loading ? <div style={{textAlign:'center'}}>Yükleniyor...</div> : (
                <div className="grid-layout">
                  {featuredProducts.map(urun => (
                    <div key={urun.id} className="product-card" style={{ background: 'white' }}>
                      <button className="fav-btn" onClick={(e) => { e.preventDefault(); toggleFavorite(urun.id); }} style={{ color: isFavorite(urun.id) ? '#E91E63' : '#CCC' }}>
                        {isFavorite(urun.id) ? '❤️' : '🤍'}
                      </button>
                      <Link to={`/product/${urun.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div className="card-img-wrapper" style={{ height: '300px' }}>
                          <img src={urun.imageUrl || 'https://placehold.co/400x300'} alt={urun.name} />
                        </div>
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
              )}
            </div>
          </div>

          {/* 5. HİKAYEMİZ */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '50px', paddingBottom: '100px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <img src='https://images.pexels.com/photos/4273439/pexels-photo-4273439.jpeg?auto=compress&cs=tinysrgb&w=800' alt="Atölye" style={{ width: '100%', borderRadius: '0', boxShadow: 'var(--shadow-hover)' }} />
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h4 style={{ color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 'bold' }}>Hikayemiz</h4>
              <h2 style={{ fontSize: '2.5rem', margin: '15px 0',color:'var(--primary)'}}>Her Çiçeğin Bir Dili Vardır</h2>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.8', marginBottom: '30px' }}>
                Bahçe-i Firdevs olarak, çiçeklerin sadece birer bitki değil, duyguların en saf hali olduğuna inanıyoruz. 
                Her sabah özenle seçilen taze çiçeklerimizi, ustalarımızın dokunuşlarıyla sanata dönüştürüyoruz.
              </p>
              <Link to="/about" className="btn btn-primary">Daha Fazla Oku</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}