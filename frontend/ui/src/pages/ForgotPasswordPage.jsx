import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://bahce-ifirdevs.com.tr/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setMessage(null);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, null, { params: { email } });
      setMessage("Doğrulama kodu mailinize gönderildi.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Kod gönderilemedi.");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, code, newPassword });
      alert("Şifreniz başarıyla değiştirildi!");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "İşlem başarısız.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', background: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
      <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '20px', fontFamily:'var(--font-heading)' }}>Şifre Sıfırlama</h2>
      
      {message && <div style={{background:'#E8F5E9', color:'#2E7D32', padding:'10px', borderRadius:'5px', marginBottom:'15px', fontSize:'0.9rem'}}>{message}</div>}
      {error && <div style={{background:'#FFEBEE', color:'#C62828', padding:'10px', borderRadius:'5px', marginBottom:'15px', fontSize:'0.9rem'}}>{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleSendCode}>
          <div className="input-group">
            <label>E-posta Adresiniz</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{width:'100%', marginTop:'10px'}} disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="input-group"><label>E-posta</label><input type="email" value={email} disabled style={{background:'#eee'}} /></div>
          <div className="input-group"><label>6 Haneli Kod</label><input type="text" value={code} onChange={(e) => setCode(e.target.value)} maxLength="6" required /></div>
          <div className="input-group"><label>Yeni Şifre</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength="6" required /></div>
          <button className="btn btn-primary" style={{width:'100%', marginTop:'10px'}} disabled={loading}>
            {loading ? 'İşleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      )}
      <div style={{marginTop:'20px', textAlign:'center', fontSize:'0.9rem'}}>
        <Link to="/login" style={{color:'var(--primary)', fontWeight:'bold'}}>Giriş Yap</Link>
      </div>
    </div>
  );
}