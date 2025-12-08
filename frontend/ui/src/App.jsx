// Konum: frontend/ui/src/App.jsx

import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // YENİ IMPORT
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage'; 
import OrderSuccessPage from './pages/OrderSuccessPage'; 
import AccountPage from './pages/AccountPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage'; 
import WishlistPage from './pages/WishlistPage'; 

import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

function App() {
  const { cart, cartInitialLoading } = useCart();
  const { isAuthenticated, logout, authLoading, isAdmin } = useAuth(); 

  const getTotalItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };
  const totalItems = (cartInitialLoading || authLoading) ? '' : getTotalItemCount();

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <header className="navbar">
        <div className="container nav-content">
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="Logo" className="site-logo" />
            <span className="site-logo-text">Bahçe-i Firdevs</span>
          </Link>

          <nav className="nav-links">
            <Link to="/" className="nav-link">Anasayfa</Link>
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
                <button onClick={logout} className="btn btn-secondary" style={{padding: '6px 18px', fontSize: '0.85rem'}}>
                  Çıkış
                </button>
              </div>
            ) : (
              <div style={{display:'flex', gap:'10px'}}>
                <Link to="/login" className="btn btn-secondary" style={{padding: '8px 20px'}}>
                  Giriş Yap
                </Link>
                {/* Header'a da kayıt ol butonu ekleyelim */}
                <Link to="/register" className="btn btn-primary" style={{padding: '8px 20px'}}>
                  Kayıt Ol
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="container" style={{ flex: 1, paddingBottom: '50px', marginTop: '30px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* YENİ ROTA */}
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} /> 
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/wishlist" element={<WishlistPage />} /> 
        </Routes>
      </main>

      <footer style={{ background: '#F8F9FA', color: '#212529', padding: '60px 0', marginTop: 'auto', borderTop:'1px solid #DEE2E6' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h3 style={{ marginBottom: '15px', fontFamily: 'var(--font-heading)' }}>
              Bahçe-i Firdevs
            </h3>
            <p style={{ opacity: 0.8, maxWidth: '400px' }}>
              En taze çiçekleri, en özenli tasarımlarla buluşturup sevdiklerinize ulaştırıyoruz. 
              Doğanın zarafeti, kapınızda.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Hızlı Linkler</h4>
            <ul style={{ opacity: 0.8, lineHeight: '2' }}>
              <li><Link to="/">Anasayfa</Link></li>
              <li><Link to="/about">Hakkımızda</Link></li>
              <li><Link to="/cart">Sepetim</Link></li>
              <li><Link to="/login">Giriş Yap</Link></li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #DEE2E6', opacity: 0.6, fontSize: '0.9rem' }}>
          &copy; 2025 Bahçe-i Firdevs. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}

export default App;