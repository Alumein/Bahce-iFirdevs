// Konum: frontend/ui/src/App.jsx

import { useState } from 'react'; 
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; 
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage'; 
import OrderSuccessPage from './pages/OrderSuccessPage'; 
import AccountPage from './pages/AccountPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage'; 
import WishlistPage from './pages/WishlistPage'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

function App() {
  const { cart, cartInitialLoading } = useCart();
  const { isAuthenticated, logout, authLoading, isAdmin } = useAuth(); 
  
  const [navSearch, setNavSearch] = useState('');
  const navigate = useNavigate();

  const getTotalItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };
  const totalItems = (cartInitialLoading || authLoading) ? '' : getTotalItemCount();

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/shop?q=${navSearch}`);
      setNavSearch('');
    }
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Kampanya Bildirimi */}
      <div style={{
        background: '#6D4C41', color: '#FFF', textAlign: 'center', padding: '8px', 
        fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px'
      }}>
         <strong>İstanbul içi özel kurye ile teslimat | 3500 TL üzerine teslimat ücretsiz!</strong> | Aynı Gün Teslimat
      </div>

      <header className="navbar" style={{ padding: '10px 0', background: '#F5F1E8', borderBottom: '1px solid #eee' }}>
        
        {/* 👇 DÜZELTME BURADA: className="nav-content" EKLENDİ 👇 */}
        {/* Bu sınıf olmadan index.css'teki mobil kurallar çalışmıyordu */}
        <div className="nav-content" style={{ 
          width: '95%', 
          maxWidth: '1800px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          
          {/* 1. LOGO */}
          <Link to="/" className="logo-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration:'none' }}>
            <img src="/logo.png" alt="Logo" className="site-logo" style={{ height: '50px' }} />
            <span className="site-logo-text" style={{ fontSize: '1.8rem', fontFamily: '"Petit Formal Script", cursive', color: 'var(--primary)', fontWeight: 'bold' }}>
              Bahçe-i Firdevs
            </span>
          </Link>

          {/* 2. ARAMA ÇUBUĞU (CSS ile mobilde en alta atılacak) */}
          <form onSubmit={handleNavSearch} className="custom-search-container" style={{ margin: '0 20px', flex: 1, maxWidth: '500px', height: '40px' }}>
            <input 
              type="text" 
              className="custom-search-input" 
              placeholder="Çiçek ara..." 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
            <button type="submit" className="custom-search-button" style={{padding: '0 15px'}}>
              ARA
            </button>
          </form>

          {/* 3. MENÜ LİNKLERİ */}
          <nav className="nav-links" style={{ display: 'flex', gap: '20px', alignItems: 'center'}}>
            <Link to="/" className="nav-link">Anasayfa</Link>
            <Link to="/shop" className="nav-link">Mağaza</Link>
            <Link to="/about" className="nav-link">Hakkımızda</Link>
            
            {!isAdmin && (
              <Link to="/cart" className="nav-link" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                Sepet
                {totalItems > 0 && <span className="badge">{totalItems}</span>}
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="nav-link" style={{color: 'var(--primary)'}}>Yönetim</Link>
            )}
            
            {authLoading ? (
              <span>...</span>
            ) : isAuthenticated ? (
              <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                {!isAdmin && <Link to="/wishlist" className="nav-link">Favoriler</Link>}
                {!isAdmin && <Link to="/account" className="nav-link">Hesabım</Link>}
                <button onClick={logout} className="btn btn-primary" style={{padding: '6px 20px', fontSize: '0.85rem', borderRadius: '50px'}}>
                  ÇIKIŞ
                </button>
              </div>
            ) : (
              <div style={{display:'flex', gap:'10px'}}>
                <Link to="/login" className="btn btn-secondary" style={{padding: '8px 25px', borderRadius: '50px'}}>
                  GİRİŞ
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingBottom: '50px', marginTop: '0' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} /> 
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/wishlist" element={<WishlistPage />} /> 
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </main>

      <footer style={{ background: '#F5F1E8', color: '#212529', padding: '60px 0', marginTop: 'auto', borderTop:'1px solid #DEE2E6' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ marginBottom: '15px', fontFamily: 'var(--font-heading)', color:'var(--primary)' }}>
              Bahçe-i Firdevs
            </h3>
            <p style={{ opacity: 0.8, maxWidth: '400px' }}>
              Doğanın en zarif dokunuşlarını sevdiklerinizle buluşturuyoruz. 
              Mutluluğa açılan kapınız.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Hızlı Linkler</h4>
            <ul style={{ opacity: 0.8, lineHeight: '2' }}>
              <li><Link to="/">Anasayfa</Link></li>
              <li><Link to="/shop">Mağaza</Link></li>
              <li><Link to="/about">Hakkımızda</Link></li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #DEE2E6', opacity: 0.6, fontSize: '0.9rem' }}>
          &copy; 2025 Bahçe-i Firdevs. Tüm hakları saklıdır.
        </div>
        <a 
        href="https://wa.me/905406383434" 
        className="whatsapp-btn"
        target="_blank" 
        rel="noopener noreferrer"
        title="WhatsApp ile İletişime Geç"
      >
        <svg className="whatsapp-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>
      </footer>
    </div>
  );
}

export default App;