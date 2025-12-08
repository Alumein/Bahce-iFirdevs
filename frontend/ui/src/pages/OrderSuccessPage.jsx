// Konum: frontend/ui/src/pages/OrderSuccessPage.jsx

import { Link } from 'react-router-dom';

export default function OrderSuccessPage() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Teşekkürler! 🎉</h2>
      <p>Siparişiniz başarıyla alındı.</p>
      <p>Backend (RabbitMQ) şu anda (simüle) onay e-postanızı hazırlıyor olmalı.</p>
      <Link to="/">Anasayfaya Dön</Link>
    </div>
  );
}