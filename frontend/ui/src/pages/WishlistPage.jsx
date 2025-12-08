// Konum: frontend/ui/src/pages/WishlistPage.jsx

import { useWishlist } from '../context/WishlistContext';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const { wishlist, toggleFavorite } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <h2 style={{ 
        fontSize: '2rem', 
        color: 'var(--primary)', 
        marginBottom: '30px', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '15px',
        fontFamily: 'var(--font-heading)'
      }}>
        Favorilerim ❤️
      </h2>
      
      {wishlist.length === 0 ? (
        <div style={{textAlign:'center', padding:'50px', color:'var(--text-muted)'}}>
          <p>Henüz favori listenize ürün eklemediniz.</p>
          <Link to="/" className="btn btn-secondary" style={{marginTop:'20px'}}>Alışverişe Başla</Link>
        </div>
      ) : (
        <div className="grid-layout">
          {wishlist.map(product => (
            <div key={product.id} className="product-card">
              
              {/* Favoriden Çıkar Butonu (Kalp Dolu) */}
              <button 
                className="fav-btn active" // index.css'te bu sınıfı tanımlayacağız
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(product.id);
                }}
                title="Favorilerden Çıkar"
              >
                ❤️
              </button>

              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', height:'100%', display:'flex', flexDirection:'column' }}>
                <div className="card-img-wrapper">
                  <img 
                    src={product.imageUrl || 'https://placehold.co/400x300'} 
                    alt={product.name} 
                  />
                </div>
                <div className="card-info">
                  <h4 className="card-title">{product.name}</h4>
                  <div className="card-footer">
                    <span className="price">{product.priceTry} TL</span>
                    <span style={{ fontSize: '0.9em', color: 'var(--primary)', fontWeight: '700' }}>İNCELE &rarr;</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}