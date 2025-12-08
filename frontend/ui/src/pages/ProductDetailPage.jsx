// Konum: frontend/ui/src/pages/ProductDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const API_URL = 'http://localhost:8080/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Yorum Formu State'leri
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    // Sayfa değişince en üste kaydır
    window.scrollTo(0, 0);
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes, recomRes] = await Promise.all([
          axios.get(`${API_URL}/products/${id}`),
          axios.get(`${API_URL}/products/${id}/reviews`),
          // Öneriler için rastgele ürün çekiyoruz
          axios.get(`${API_URL}/products/page?page=0&size=6&sort=id,desc`)
        ]);
        
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
        
        // Şu an görüntülenen ürünü önerilerden çıkaralım
        const otherProducts = recomRes.data.content
          .filter(p => p.id !== parseInt(id))
          .slice(0, 4);
        setRecommendations(otherProducts);
        
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

  // --- YORUM GÖNDERME (GÜNCELLENDİ: Alert + Hata Mesajı) ---
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
      
      // Backend'den gelen mesajı alıyoruz
      const serverMessage = err.response?.data?.message;
      const defaultMessage = "Yorum gönderilirken bir hata oluştu.";
      const finalMessage = serverMessage || defaultMessage;

      // 1. Ekrana kırmızı yazı olarak set et
      setReviewError(finalMessage);
      
      // 2. KULLANICI KESİN GÖRSÜN DİYE POP-UP AÇ
      alert("⚠️ " + finalMessage);
    } finally { 
      setSubmitLoading(false); 
    }
  };

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return (
      <span style={{ color: '#FFC107', fontSize: '1.2rem', letterSpacing: '2px' }} title={`Puan: ${rating}`}>
        {'★'.repeat(rounded)}<span style={{color:'#e0e0e0'}}>{'★'.repeat(5 - rounded)}</span>
      </span>
    );
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Yükleniyor...</div>;
  if (!product) return <div style={{padding:'50px', textAlign:'center'}}>Ürün bulunamadı.</div>;

  return (
    // DÜZELTME: Mobilde sağa taşmayı engelleyen kapsayıcı ayarları
    <div style={{ padding: '20px 0', maxWidth: '100vw', overflowX: 'hidden' }}>
      
      {/* Ürün Detay Kartı */}
      <div className="product-detail-card" style={{ maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        <div className="detail-image-wrapper">
          <img src={product.imageUrl || 'https://placehold.co/600x600'} alt={product.name} style={{maxWidth:'100%', height:'auto'}} />
        </div>
        
        {/* DÜZELTME: İçerik alanı padding ve box-sizing ayarı */}
        <div className="detail-info-wrapper" style={{ padding: '0 15px', boxSizing: 'border-box', width: '100%' }}>
          
          {/* Başlık ve Kalp Butonu (Mobilde taşmayı önleyen Flex yapısı) */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'flex-start', 
            width:'100%', position:'relative', overflow: 'hidden'
          }}>
            <h2 style={{ 
              fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
              lineHeight:'1.2', 
              color:'var(--text-main)', 
              marginBottom:'10px', 
              flex: 1, 
              minWidth: 0, 
              wordBreak:'break-word',
              hyphens: 'auto'
            }}>
              {product.name}
            </h2>
            <button 
              onClick={() => toggleFavorite(product.id)}
              style={{
                background:'none', border:'none', fontSize:'1.8rem', cursor:'pointer', padding:'0', flexShrink:0,
                color: isFavorite(product.id) ? '#E91E63' : '#CCC', marginTop:'0', marginLeft: '10px'
              }}
            >
              {isFavorite(product.id) ? '❤️' : '🤍'}
            </button>
          </div>
          
          <div style={{ marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px', flexWrap: 'wrap' }}>
            {renderStars(product.averageRating)}
            <span style={{ fontSize: '0.9rem', color: '#888', textDecoration:'underline', cursor:'pointer' }}>
              {reviews.length} Değerlendirme
            </span>
          </div>

          <p style={{ fontSize: '1.05rem', color: '#555', marginBottom: '30px', lineHeight: '1.6', wordBreak: 'break-word' }}>
            {product.shortDescription}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', flexWrap:'wrap' }}>
             <h3 style={{ fontSize: '2rem', color: 'var(--primary)', margin: 0 }}>{product.priceTry} TL</h3>
             {product.stock > 0 ? (
               <span style={{background:'#E8F5E9', color:'#2E7D32', padding:'6px 12px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold', whiteSpace: 'nowrap'}}>Stokta Var</span>
             ) : (
               <span style={{background:'#FFEBEE', color:'#C62828', padding:'6px 12px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold', whiteSpace: 'nowrap'}}>Tükendi</span>
             )}
          </div>

          {/* İADE UYARISI */}
          <div style={{ background: '#FFF8E1', borderLeft: '4px solid #FFC107', padding: '15px', marginBottom: '30px', borderRadius: '4px', boxSizing: 'border-box' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#5D4037', lineHeight:'1.5' }}>
              <strong>⚠️ Önemli Bilgilendirme:</strong><br/>
              Çiçekler canlı ve bozulabilen ürünler sınıfına girdiğinden, <strong>Mesafeli Satış Sözleşmesi</strong> uyarınca bu üründe keyfi <strong>cayma hakkı ve iade</strong> geçerli değildir.
            </p>
          </div>
          
          <button 
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '1.1rem', maxWidth:'100%', boxSizing: 'border-box' }}
            disabled={product.stock <= 0 || cartLoading} 
            onClick={handleAddToCart}
          >
            {cartLoading ? 'Sepete Ekleniyor...' : 'Sepete Ekle'}
          </button>

          {/* BİLGİ SEKMELERİ */}
          <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '5px', display:'flex', alignItems:'center', gap:'8px' }}>
                🚚 Teslimat Bilgileri
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px', lineHeight: '1.5' }}>
                Bugün saat <strong>14:00</strong>'a kadar verilen siparişler aynı gün, sonraki siparişler ertesi gün teslim edilir. İstanbul içi özel kurye ile güvenli teslimat yapılır.
              </p>
              {/* TESLİMAT SÜRESİ DİPNOTU */}
              <p style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic', marginTop: '5px', lineHeight: '1.4' }}>
                * Yukarıda verilen teslimat süreleri tahmini olup mevzuattaki yasal sürelerin aşılmaması koşuluyla sapmalar yaşanabilmektedir.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '5px', display:'flex', alignItems:'center', gap:'8px' }}>
                💳 Güvenli Ödeme
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
                Tüm kredi kartları (Visa, MasterCard, Troy) ve Banka Kartları ile 3D Secure güvencesiyle ödeme yapabilirsiniz.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '5px', display:'flex', alignItems:'center', gap:'8px' }}>
                🔄 İptal Koşulları
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
                Siparişiniz <strong>"Hazırlanıyor"</strong> aşamasına geçmeden önce iptal edebilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '40px 0' }} />

      {/* ÖNERİLEN ÜRÜNLER */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '60px', padding: '0 15px' }}>
          <h3 style={{ textAlign:'center', marginBottom: '30px', color: 'var(--text-main)', fontFamily:'var(--font-heading)' }}>
            Bunları da Beğenebilirsiniz
          </h3>
          <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap:'25px' }}>
            {recommendations.map(rec => (
              <div key={rec.id} className="product-card" style={{minHeight:'auto'}}>
                <Link to={`/product/${rec.id}`} className="card-img-wrapper" style={{height:'250px'}}>
                  <img src={rec.imageUrl || 'https://placehold.co/400x400'} alt={rec.name} />
                </Link>
                <div className="card-info" style={{padding:'15px', textAlign:'left'}}>
                  <Link to={`/product/${rec.id}`}>
                    <h4 style={{fontSize:'1rem', margin:'0 0 5px', color:'var(--text-main)'}}>{rec.name}</h4>
                  </Link>
                  <div style={{color:'var(--primary)', fontWeight:'bold', fontSize:'1.1rem'}}>{rec.priceTry} TL</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YORUMLAR */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 15px' }}>
         <h3 style={{ marginBottom: '30px', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
          Müşteri Yorumları ({reviews.length})
        </h3>

        {isAuthenticated ? (
          <div style={{ background: '#F8F9FA', padding: '20px', marginBottom: '30px', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '15px', fontSize:'1.1rem' }}>Yorum Yap</h4>
            
            {/* HATA MESAJI KUTUSU */}
            {reviewError && (
              <div style={{
                color: '#721c24', 
                backgroundColor: '#f8d7da', 
                borderColor: '#f5c6cb', 
                padding: '10px', 
                marginBottom: '15px', 
                borderRadius: '5px',
                fontSize: '0.9rem'
              }}>
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