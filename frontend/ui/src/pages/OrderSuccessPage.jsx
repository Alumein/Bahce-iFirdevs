// Konum: frontend/ui/src/pages/OrderSuccessPage.jsx

import { Link } from 'react-router-dom';

export default function OrderSuccessPage() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Teşekkürler! 🎉</h2>
      <p>Siparişiniz başarıyla alındı.</p>
      <p>E-postanıza bilgilendirme e-maili iletilmiştir.</p>
      <p>Spam klasörünü kontrol etmeyi unutmayın.</p>
      <Link to="/">Anasayfaya Dön</Link>
    </div>
  );
}