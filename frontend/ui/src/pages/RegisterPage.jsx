import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  
  // Form Verileri
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    marketingAllowed: false 
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- MODAL (PENCERE) DURUMLARI ---
  const [showContractModal, setShowContractModal] = useState(false); // Üyelik Sözleşmesi
  const [showKvkkModal, setShowKvkkModal] = useState(false);         // KVKK Aydınlatma Metni
  const [showMarketingModal, setShowMarketingModal] = useState(false); // Ticari İleti İzni

  // Telefon Formatlama (Sadece rakam, baştaki 0'ı sil)
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.startsWith('0')) val = val.substring(1); 
    setFormData({ ...formData, phone: val });
  };

  // Form Gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Şifre Kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    // 2. Telefon Format Kontrolü
    if (formData.phone.length !== 10) {
      setError("Telefon numarası başında 0 olmadan 10 haneli olmalıdır (Örn: 5551234567).");
      return;
    }

    setLoading(true);
    try {
      // Backend'e verileri gönder
      await axios.post(`${API_URL}/customers/register`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        marketingAllowed: formData.marketingAllowed
      });
      
      alert("Kayıt işleminiz başarıyla tamamlandı! Giriş yapabilirsiniz.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  // --- 1. ÜYELİK SÖZLEŞMESİ ---
  const membershipText = `
  1. TARAFLAR
  İşbu Üyelik Sözleşmesi ("Sözleşme") www.bahceifirdevs.com ve mobil cihaz uygulamalarının sahibi olan BAHÇE-İ FİRDEVS ("ŞİRKET") ile; Platforma üye olan kullanıcı ("Üye") arasında, Üye’nin ŞİRKET’in sunduğu Hizmetler’den yararlanmasına ilişkin koşulların belirlenmesi için akdedilmiştir.

  2. KONU
  İşbu Sözleşme’nin konusu, Üye’nin Platform üzerinden ŞİRKET tarafından sunulan hizmetlerden yararlanma şartlarının ve tarafların hak ve yükümlülüklerinin belirlenmesidir.

  3. TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ
  3.1. Üye, Platform’a üye olurken verdiği kişisel ve diğer sair bilgilerin kanunlar önünde doğru olduğunu beyan eder.
  3.2. Üye, şifresini başka kişi ya da kuruluşlara veremez, üyenin söz konusu şifreyi kullanma hakkı bizzat kendisine aittir.
  3.3. ŞİRKET, Platform’un kesintisiz çalışacağını garanti etmez. Teknik arızalardan, siber saldırılardan veya veri kayıplarından doğacak dolaylı zararlardan sorumlu tutulamaz (Sorumluluk Reddi).
  3.4. Platform’da bulunan tüm grafikler, yazılımlar ve içerikler ŞİRKET’in mülkiyetindedir.

  4. MÜCBİR SEBEP
  Doğal afet, isyan, savaş, grev, iletişim sorunları, altyapı ve internet arızaları, elektrik kesintisi gibi ŞİRKET'in kontrolü dışında gerçekleşen olaylar Mücbir Sebep sayılır ve ŞİRKET sorumlu tutulamaz.

  5. YETKİLİ MAHKEME
  İşbu sözleşmeden doğacak ihtilaflarda İSTANBUL Mahkemeleri ve İcra Daireleri yetkilidir.
  `;

  // --- 2. KVKK AYDINLATMA METNİ ---
  const kvkkText = `
  KİŞİSEL VERİLERİN KORUNMASI VE İŞLENMESİ HAKKINDA AYDINLATMA METNİ

  Bahçe-i Firdevs ("Şirket") olarak kişisel verilerinizin güvenliği hususuna azami hassasiyet göstermekteyiz. 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz (Ad, Soyad, E-posta, Telefon vb.) aşağıda açıklanan amaçlar doğrultusunda işlenmektedir.

  1. Veri Sorumlusu: Bahçe-i Firdevs
  2. İşleme Amacı: Üyelik işlemlerinin gerçekleştirilmesi, siparişlerin teslimi, ödeme işlemleri ve yasal yükümlülüklerin yerine getirilmesi.
  3. Aktarım: Kişisel verileriniz, yasal zorunluluklar dışında ve açık rızanız olmaksızın üçüncü kişilerle paylaşılmamaktadır (Kargo firmaları ve Ödeme altyapıları hariç).
  4. Haklarınız: KVKK’nın 11. maddesi uyarınca verilerinizin silinmesini veya düzeltilmesini talep etme hakkına sahipsiniz.
  `;

  // --- 3. TİCARİ İLETİ / RIZA METNİ (Checkbox için) ---
  const marketingText = `
  TİCARİ ELEKTRONİK İLETİ ONAYI

  Bahçe-i Firdevs tarafından bana özel kampanya, tanıtım, indirim ve fırsatların sunulması amacıyla; iletişim bilgilerimin (SMS, E-posta, Arama) kullanılmasına ve tarafıma ticari elektronik ileti gönderilmesine onay veriyorum. Bu izni dilediğim zaman iptal edebilirim.
  `;

  // --- MODAL BİLEŞENİ ---
  const Modal = ({ title, content, onClose }) => (
    <div style={{
      position:'fixed', top:0, left:0, width:'100%', height:'100%',
      background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999
    }}>
      <div style={{
        background:'white', padding:'25px', borderRadius:'10px', width:'90%', maxWidth:'600px', 
        maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{marginTop:0, color:'var(--primary)', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>{title}</h3>
        <div style={{
          fontSize:'0.85rem', lineHeight:'1.6', whiteSpace:'pre-wrap', 
          margin:'15px 0', overflowY:'auto', flex:1, padding:'15px', background:'#f9f9f9', borderRadius:'5px', color:'#333'
        }}>
          {content}
        </div>
        <button onClick={onClose} className="btn btn-primary" style={{width:'100%'}}>Okudum, Kapat</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', padding: '30px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary)' }}>Kayıt Ol</h2>
      
      {error && <div style={{ color: '#D32F2F', marginBottom: '15px', fontSize: '0.9rem', textAlign:'center', background:'#FFEBEE', padding:'10px', borderRadius:'5px', border:'1px solid #FFCDD2' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Ad Soyad</label>
          <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
        </div>

        <div className="input-group">
          <label>E-posta</label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        </div>

        <div className="input-group">
          <label>Telefon (5xx...)</label>
          <input type="tel" maxLength="10" placeholder="5551234567" value={formData.phone} onChange={handlePhoneChange} required />
          <small style={{color:'var(--text-muted)', fontSize:'0.75rem'}}>Başında 0 olmadan 10 hane giriniz.</small>
        </div>

        <div className="input-group">
          <label>Şifre</label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={6} />
        </div>

        <div className="input-group">
          <label>Şifre Tekrar</label>
          <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
        </div>

        {/* --- İLETİŞİM İZNİ (CHECKBOX) --- */}
        <div style={{ marginTop: '15px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <input 
            type="checkbox" 
            id="marketing" 
            checked={formData.marketingAllowed} 
            onChange={e => setFormData({...formData, marketingAllowed: e.target.checked})} 
            style={{ width: '18px', height: '18px', marginTop:'3px', cursor:'pointer', flexShrink: 0 }}
          />
          <label htmlFor="marketing" style={{ fontSize: '0.8rem', lineHeight: '1.4', cursor: 'pointer', userSelect:'none', color:'var(--text-muted)' }}>
            Kampanya ve fırsatlardan haberdar olmak için <span onClick={(e) => { e.preventDefault(); setShowMarketingModal(true); }} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Rıza Metni</span> kapsamında iletişime izin veriyorum.
          </label>
        </div>

        {/* --- SÖZLEŞME VE KVKK ONAY UYARISI (BUTON ÜSTÜ) --- */}
        <div style={{ marginTop: '25px', fontSize: '0.75rem', textAlign: 'center', color: '#666', lineHeight: '1.5' }}>
          Üye Ol butonuna tıklayarak <span onClick={() => setShowContractModal(true)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>Üyelik Sözleşmesi</span>'ni ve <span onClick={() => setShowKvkkModal(true)} style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>KVKK Aydınlatma Metni</span>'ni okuduğunuzu ve kabul ettiğinizi onaylamış olursunuz.
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px', width: '100%' }}>
          {loading ? 'Kaydediliyor...' : 'Üye Ol'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
        Zaten hesabınız var mı? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Giriş Yap</Link>
      </div>

      {/* --- MODALLAR --- */}
      {showContractModal && <Modal title="Üyelik Sözleşmesi" content={membershipText} onClose={() => setShowContractModal(false)} />}
      {showKvkkModal && <Modal title="Kişisel Verilerin Korunması (KVKK)" content={kvkkText} onClose={() => setShowKvkkModal(false)} />}
      {showMarketingModal && <Modal title="İletişim İzni ve Rıza Metni" content={marketingText} onClose={() => setShowMarketingModal(false)} />}

    </div>
  );
}