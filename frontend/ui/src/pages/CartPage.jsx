// Konum: frontend/ui/src/pages/CartPage.jsx

import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartPage() {
  
  const { 
    cart, 
    cartInitialLoading, 
    cartLoading, 
    removeFromCart,
    updateQuantity
  } = useCart();

  // Adet Değiştirme Mantığı (Stok Kontrollü)
  const handleQuantityChange = (item, newQty) => {
    if (newQty < 1) return; // En az 1 olabilir
    
    // Stok kontrolü
    if (item.maxStock && newQty > item.maxStock) {
      alert(`Stok yetersiz! Bu üründen en fazla ${item.maxStock} adet alabilirsiniz.`);
      return;
    }
    
    updateQuantity(item.productId, newQty);
  };

  if (cartInitialLoading) return <div style={{padding:'50px', textAlign:'center'}}>Sepet Yükleniyor...</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{padding:'50px', textAlign:'center'}}>
        <h2 style={{color:'var(--primary)'}}>Sepetiniz Boş</h2>
        <p style={{color:'var(--text-muted)', marginBottom:'20px'}}>Henüz sepetinize bir çiçek eklemediniz.</p>
        <Link to="/" className="btn btn-primary">Alışverişe Başla</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', fontFamily: 'var(--font-heading)' }}>
        Sepetim
      </h2>
      
      {/* Masaüstü Görünümü (Tablo) */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--primary)', textAlign: 'left', color: 'var(--primary)' }}>
              <th style={{ padding: '15px' }}>Ürün</th>
              <th style={{ padding: '15px' }}>Fiyat</th>
              <th style={{ padding: '15px' }}>Adet</th>
              <th style={{ padding: '15px' }}>Toplam</th>
              <th style={{ padding: '15px' }}></th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map(item => (
              <tr key={item.productId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '15px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {item.productName}
                  {item.maxStock && item.quantity >= item.maxStock && 
                    <div style={{fontSize:'0.75rem', color:'orange', fontWeight:'normal'}}>Maksimum stok</div>
                  }
                </td>
                <td style={{ padding: '15px' }}>{item.unitPriceTry} TL</td>
                
                {/* Adet Kontrol Alanı */}
                <td style={{ padding: '15px' }}>
                  <div className="quantity-control">
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      disabled={cartLoading || item.quantity <= 1}
                    >
                      -
                    </button>
                    
                    <input 
                      type="number" 
                      className="qty-input"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                      disabled={cartLoading}
                    />
                    
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      disabled={cartLoading || (item.maxStock && item.quantity >= item.maxStock)}
                    >
                      +
                    </button>
                  </div>
                </td>
                
                <td style={{ padding: '15px', fontWeight: 'bold', color: 'var(--primary)' }}>{item.lineTotalTry} TL</td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    disabled={cartLoading} 
                    style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="Sepetten Kaldır"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Toplamlar ve Ödeme */}
      <div style={{ marginTop: '40px', textAlign: 'right' }}>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', margin: '20px 0', fontFamily: 'var(--font-heading)' }}>
          Toplam: {cart.totalTry} TL
        </div>
        
        <Link to="/checkout" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
          Ödemeye Geç
        </Link>
      </div>
    </div>
  );
}