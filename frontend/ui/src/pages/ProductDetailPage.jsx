// Konum: frontend/ui/src/pages/ProductDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]); 
  
  // GALERİ STATE'İ
  const [activeImage, setActiveImage] = useState(null);

  // --- ZOOM STATE'LERİ (YENİ) ---
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes, recomRes] = await Promise.all([
          axios.get(`${API_URL}/products/${id}`),
          axios.get(`${API_URL}/products/${id}/reviews`),
          axios.get(`${API_URL}/products/page?page=0&size=20&sort=createdAt,desc`)
        ]);
        
        const prodData = productRes.data;
        setProduct(prodData);
        setReviews(reviewsRes.data);
        
        // İlk açılışta ana resmi aktif et
        setActiveImage(prodData.imageUrl);

        // --- RASTGELE ÖNERİ MANTIĞI ---
        let allRecs = recomRes.data.content;
        allRecs = allRecs.filter(p => p.id !== parseInt(id));
        const shuffled = allRecs.sort(() => 0.5 - Math.random());
        setRecommendations(shuffled.slice(0, 4));
        
        setError(null);
      } catch (err) {
        setError("Ürün bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { alert("Yorum yapmak için giriş yapmalısınız."); return; }
    
    setSubmitLoading(true); 
    setReviewError(null);
    
    try {
      const response = await axios.post(`${API_URL}/products/${id}/reviews`, newReview);
      setReviews(prev => [response.data, ...prev]); 
      setNewReview({ rating: 5, comment: '' });
      alert("Yorumunuz başarıyla eklendi!");
    } catch (err) { 
      console.error("Yorum Hatası:", err);
      const serverMessage = err.response?.data?.message;
      setReviewError(serverMessage || "Yorum gönderilirken bir hata oluştu.");
    } finally { 
      setSubmitLoading(false); 
    }
  };

  // --- ZOOM HAREKET FONKSİYONU (YENİ) ---
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return (
      <span style={{ color: '#FFC107', fontSize: '1.2rem', letterSpacing: '2px' }} title={`Puan: ${rating}`}>
        {'★'.repeat(rounded)}<span style={{color:'#e0e0e0'}}>{'★'.repeat(5 - rounded)}</span>
      </span>
    );
  };

  // Resim listesini toplayan yardımcı fonksiyon
  const getImages = () => {
    if (!product) return [];
    const imgs = [];
    if (product.imageUrl) imgs.push(product.imageUrl);
    if (product.imageUrl2) imgs.push(product.imageUrl2);
    if (product.imageUrl3) imgs.push(product.imageUrl3);
    return imgs.length > 0 ? imgs : ['https://placehold.co/600x600'];
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;
  if (!product) return <div style={{padding:'50px', textAlign:'center'}}>Ürün bulunamadı.</div>;

  const productImages = getImages();
  const displayImage = activeImage || product.imageUrl || 'https://placehold.co/600x600';

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      
      {/* Ürün Detay Kartı */}
      <div className="product-detail-card">
        
        {/* --- SOL TARAF: RESİM GALERİSİ (DÜZENLENDİ) --- */}
        {/* flex: 1 ve minWidth ekleyerek alanı genişlettik */}
        <div className="detail-image-wrapper" style={{ flexDirection: 'column', padding: '0', gap: '20px', background: '#fff', flex: 1, minWidth: '400px', position: 'relative' }}>
          
          {/* BÜYÜK RESİM & ZOOM ALANI */}
          <div 
            style={{ 
              width: '100%', 
              height: 'auto', // Sabit yükseklik yerine auto yaptık, en boy oranı korunsun
              minHeight: '500px', // Minimum yükseklik
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '10px', 
              border: '1px solid #eee',
              position: 'relative',
              cursor: 'crosshair'
            }}
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <img 
              src={displayImage} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
            />

            {/* ZOOM KUTUSU (ÜZERİNE GELİNCE AÇILIR) */}
            {showZoom && (
              <div
                style={{
                  position: 'absolute',
                  left: '105%', // Resmin hemen sağına taşır
                  top: '0',
                  width: '500px', // Zoom kutusunun boyutu
                  height: '500px',
                  zIndex: 999,
                  backgroundColor: '#fff',
                  backgroundImage: `url(${displayImage})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '200%', // 2 Kat büyüterek göster
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  pointerEvents: 'none' // Zoom kutusu mouse'u engellemesin
                }}
              />
            )}
          </div>

          {/* KÜÇÜK RESİMLER (THUMBNAILS) */}
          {productImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', paddingBottom: '20px' }}>
              {productImages.map((img, index) => (
                <div 
                  key={index} 
                  onClick={() => setActiveImage(img)}
                  style={{ 
                    width: '80px', height: '80px', 
                    borderRadius: '8px', overflow: 'hidden', 
                    cursor: 'pointer', 
                    border: activeImage === img ? '2px solid var(--primary)' : '2px solid transparent',
                    opacity: activeImage === img ? 1 : 0.6,
                    transition: '0.3s'
                  }}
                >
                  <img src={img} alt={`Görsel ${index+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* SAĞ TARAF: BİLGİLER (AYNEN KORUNDU) */}
        <div className="detail-info-wrapper" style={{ flex: 1 }}>
          
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'flex-start', 
            width:'100%', position:'relative'
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              lineHeight:'1.2', 
              color:'var(--primary)', 
              marginBottom:'10px',
              fontFamily: 'var(--font-heading)'
            }}>
              {product.name}
            </h2>
            <button 
              onClick={() => toggleFavorite(product.id)}
              style={{
                background:'none', border:'none', fontSize:'1.8rem', cursor:'pointer', padding:'0', flexShrink:0,
                color: isFavorite(product.id) ? '#E91E63' : '#CCC', marginLeft: '10px'
              }}
            >
              {isFavorite(product.id) ? '❤️' : '🤍'}
            </button>
          </div>
          
          <div style={{ marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
            {renderStars(product.averageRating)}
            <span style={{ fontSize: '0.9rem', color: '#888', textDecoration:'underline', cursor:'pointer' }}>
              {reviews.length} Değerlendirme
            </span>
          </div>

          <p style={{ fontSize: '1.05rem', color: '#555', marginBottom: '30px', lineHeight: '1.6' }}>
            {product.shortDescription}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
             <h3 style={{ fontSize: '2rem', color: 'var(--primary)', margin: 0 }}>{product.priceTry} TL</h3>
             {product.stock > 0 ? (
               <span style={{background:'#E8F5E9', color:'#2E7D32', padding:'6px 12px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold'}}>Stokta Var</span>
             ) : (
               <span style={{background:'#FFEBEE', color:'#C62828', padding:'6px 12px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold'}}>Tükendi</span>
             )}
          </div>

          <div style={{ background: '#FFF8E1', borderLeft: '4px solid #FFC107', padding: '15px', marginBottom: '30px', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#5D4037', lineHeight:'1.5' }}>
              <strong>⚠️ Önemli Bilgilendirme:</strong><br/>
              Çiçekler canlı ve bozulabilen ürünler sınıfına girdiğinden, <strong>Mesafeli Satış Sözleşmesi</strong> uyarınca bu üründe keyfi <strong>cayma hakkı ve iade</strong> geçerli değildir.
            </p>
          </div>
          
          <button 
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
            disabled={product.stock <= 0 || cartLoading} 
            onClick={handleAddToCart}
          >
            {cartLoading ? 'Sepete Ekleniyor...' : 'Sepete Ekle'}
          </button>

          <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '5px' }}>🚚 Teslimat Bilgileri</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Bugün saat <strong>14:00</strong>'a kadar verilen siparişler aynı gün teslim edilir. İstanbul içi özel kurye ile güvenli teslimat.
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '40px 0' }} />

      {/* ÖNERİLEN ÜRÜNLER (AYNEN KORUNDU) */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ textAlign:'center', marginBottom: '30px', color: 'var(--primary)', fontFamily:'var(--font-heading)' }}>
            Bunları da Beğenebilirsiniz
          </h3>
          <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap:'25px' }}>
            {recommendations.map(rec => (
              <div key={rec.id} className="product-card" style={{minHeight:'auto'}}>
                <Link to={`/product/${rec.id}`} className="card-img-wrapper" style={{height:'250px'}}>
                  <img src={rec.imageUrl || 'https://placehold.co/400x400'} alt={rec.name} />
                </Link>
                <div className="card-info" style={{padding:'15px', textAlign:'left'}}>
                  <Link to={`/product/${rec.id}`}>
                    <h4 style={{fontSize:'1rem', margin:'0 0 5px', color:'var(--primary)'}}>{rec.name}</h4>
                  </Link>
                  <div style={{color:'var(--primary)', fontWeight:'bold', fontSize:'1.1rem'}}>{rec.priceTry} TL</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YORUMLAR (AYNEN KORUNDU) */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
         <h3 style={{ marginBottom: '30px', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
          Müşteri Yorumları ({reviews.length})
        </h3>

        {isAuthenticated ? (
          <div style={{ background: '#F8F9FA', padding: '20px', marginBottom: '30px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '15px', fontSize:'1.1rem' }}>Yorum Yap</h4>
            {reviewError && (
              <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', marginBottom: '15px', borderRadius: '5px', fontSize: '0.9rem' }}>
                {reviewError}
              </div>
            )}
            <form onSubmit={handleSubmitReview}>
              <div className="input-group">
                <label>Puanınız</label>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} onClick={() => setNewReview({ ...newReview, rating: star })} style={{ cursor: 'pointer', fontSize: '2rem', color: star <= newReview.rating ? '#FFC107' : '#D1D5DB' }}>★</span>
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Yorumunuz</label>
                <textarea rows="3" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} required placeholder="Ürün nasıldı?" style={{width: '100%', boxSizing: 'border-box'}} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitLoading} style={{width: '100%'}}>
                {submitLoading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', marginBottom: '30px', borderRadius:'8px' }}>
            <p style={{color:'#666'}}>Yorum yapmak için <Link to="/login" style={{fontWeight:'bold', textDecoration:'underline', color:'var(--primary)'}}>giriş yapmalısınız</Link>.</p>
          </div>
        )}

        {reviews.length === 0 ? <p style={{ textAlign: 'center', color: '#999', fontStyle:'italic' }}>Henüz yorum yapılmamış.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom:'5px' }}>
                  <strong>{review.customerName}</strong>
                  <span>{renderStars(review.rating)}</span>
                </div>
                <p style={{ margin: '5px 0', color: '#444' }}>{review.comment}</p>
                <small style={{ color: '#999' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}