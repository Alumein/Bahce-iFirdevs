// Konum: frontend/ui/src/pages/LoginPage.jsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.message || "Giriş başarısız. Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', background: 'var(--bg-card)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>Giriş Yap</h2>
      
      {error && (
        <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">E-posta veya Kullanıcı Adı</label>
          <input
            type="text" // DÜZELTME: 'email' yerine 'text' yapıldı ki 'admin' yazılabilsin.
            id="email"
            placeholder="ornek@mail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px' }}
          />
        </div>
        <div className="input-group" style={{ marginBottom: '25px' }}>
          <label htmlFor="password">Şifre</label>
          <input
            type="password"
            id="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} disabled={loading}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      <div style={{textAlign:'right', marginBottom:'15px'}}>
        <Link to="/forgot-password" style={{fontSize:'0.85rem', color:'#666'}}>
          Şifremi Unuttum?
        </Link>
      </div>
      <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: '#666' }}>
        Henüz hesabın yok mu?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
          Hemen Kayıt Ol
        </Link>
      </div>
    </div>
  );
}