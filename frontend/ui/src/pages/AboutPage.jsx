// Konum: frontend/ui/src/pages/AboutPage.jsx

import React from 'react';

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '40px 15px' }}>
      
      {/* --- BÖLÜM 1: HİKAYEMİZ --- */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px auto' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
          Biz Kimiz?
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
          Bahçe-i Firdevs olarak, doğanın en saf ve zarif hediyelerini sizlerle buluşturmak için yola çıktık. 
          Her bir çiçeğin bir hikayesi olduğuna inanıyor, sevdiklerinize duygularınızı en taze şekilde 
          iletmeniz için özenle çalışıyoruz. Butik tasarım anlayışımız ve müşteri memnuniyeti odaklı 
          hizmetimizle, en özel günlerinizde yanınızdayız.
        </p>
      </div>

      {/* --- BÖLÜM 2: İLETİŞİM KARTLARI --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        
        {/* Adres Kartı */}
        <div className="product-card" style={{ padding: '30px', textAlign: 'center', alignItems: 'center', height: 'auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📍</div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Adresimiz</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Hasanpaşa, Fatih Blv. F blok No:33 <br />Sultanbeyli/İstanbul
          </p>
        </div>

        {/* Telefon Kartı */}
        <div className="product-card" style={{ padding: '30px', textAlign: 'center', alignItems: 'center', height: 'auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📞</div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Telefon</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Her gün 09:00 - 22:00<br />
            <a href="tel:+905406383434" style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
              0 (540) 638 34 34
            </a>
          </p>
        </div>

        {/* E-posta Kartı */}
        <div className="product-card" style={{ padding: '30px', textAlign: 'center', alignItems: 'center', height: 'auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>✉️</div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>E-posta</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Her türlü sorunuz için:<br />
            <a href="mailto:info@bahce-ifirdevs.com.tr" style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
              info@bahce-ifirdevs.com.tr
            </a>
          </p>
        </div>
      </div>

      {/* --- BÖLÜM 3: INSTAGRAM --- */}
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        background: '#FEFDF5', 
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        marginBottom: '60px'
      }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '15px' }}>
          Bizi Takip Edin
        </h3>
        <p style={{ marginBottom: '25px', color: '#555' }}>
          En yeni tasarımlarımızı ve atölyemizden kareleri görmek için Instagram sayfamıza göz atın.
        </p>
        <a
          href="https://www.instagram.com/bahce_ifirdevs/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            fontSize: '1rem',
            padding: '12px 30px',
            color: 'white',
            borderRadius: '50px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)',
            boxShadow: '0 4px 15px rgba(193, 53, 132, 0.3)'
          }}
        >
          {/* Instagram Logosu */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.252-1.691 4.771-4.919 4.919-1.265.058-1.645.069-4.85.069s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.252 1.691-4.771 4.919-4.919 1.265-.058 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.79-4 4-4s4 1.79 4 4c0 2.21-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          @bahce_ifirdevs
        </a>
      </div>

      {/* --- BÖLÜM 4: GOOGLE MAPS (GÜNCELLENMİŞ HARİTA) --- */}
      <div className="product-card" style={{ padding: '10px', height: '450px', overflow: 'hidden', borderRadius: 'var(--radius)' }}>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3012.5550774494504!2d29.249246176527357!3d40.96932472182172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cad1be4cdc8fcf%3A0xf196bd875c4f9cdf!2zQmFow6dlLWkgRmlyZGV2cyDDh2nDp2Vrw6dpbGlr!5e0!3m2!1str!2str!4v1765203490307!5m2!1str!2str" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Bahçe-i Firdevs Konum"
        ></iframe>
      </div>

    </div>
  );
}