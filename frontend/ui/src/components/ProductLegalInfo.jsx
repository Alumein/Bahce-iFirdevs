// Konum: frontend/ui/src/components/ProductLegalInfo.jsx
//
// Ürün detay sayfasında gösterilen yasal bilgiler:
//   1. Mesafeli Satış Sözleşmesi
//   2. İptal ve İade Politikası
//   3. Teslimat Bilgileri
//
// 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
// Yönetmeliği'ne göre hazırlanmıştır. Site yalnızca canlı/çabuk bozulabilen
// çiçek ürünleri sattığından cayma hakkı istisnası (Yön. md. 15) esas alınmıştır.

import { useState } from 'react';

// ────────────────────────────────────────────────────────────────────────────
// SATICI BİLGİLERİ — tek yerden yönetilsin diye burada tutuluyor.
// ⚠️ "vergi" ve (varsa) "mersis" alanlarını KENDİ resmi bilgilerinizle doldurun.
//    Bu iki alan boş/yanlış kalırsa sözleşme hukuken eksik sayılır.
// ────────────────────────────────────────────────────────────────────────────
const SELLER = {
  unvan: 'Bahçe-i Firdevs Çiçekçilik Ticaret Limited Şirketi',
  adres: 'Hasanpaşa Mah., Fatih Blv. F Blok No:33, Sultanbeyli / İstanbul',
  telefon: '0 (540) 638 34 34',
  eposta: 'info@bahce-ifirdevs.com.tr',
  web: 'bahce-ifirdevs.com.tr',
  vergi: 'SULTANBEYLİ / 1311823512', // ⚠️ DOLDURUNUZ
  mersis: '0332153027900001',
};

// Tek bir açılır/kapanır bölüm
function AccordionItem({ icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '16px 20px',
          background: open ? '#FEFDF5' : '#fff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.05rem',
          color: 'var(--primary)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>{icon}</span>
          {title}
        </span>
        <span
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          ▶
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: '4px 20px 22px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.9rem',
            color: '#555',
            lineHeight: '1.75',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Madde başlığı ortak stili
const H = ({ children }) => (
  <p style={{ fontWeight: 'bold', color: 'var(--primary)', margin: '16px 0 6px' }}>
    {children}
  </p>
);

export default function ProductLegalInfo({ product }) {
  return (
    <section style={{ marginTop: '50px' }}>
      <h3
        style={{
          color: 'var(--primary)',
          fontFamily: 'var(--font-heading)',
          marginBottom: '8px',
        }}
      >
        Satış ve Teslimat Koşulları
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
        Siparişinizi tamamlamadan önce lütfen aşağıdaki belgeleri inceleyiniz.
        Sipariş vermeniz, bu koşulları okuduğunuz ve kabul ettiğiniz anlamına gelir.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* ────────────── 1) MESAFELİ SATIŞ SÖZLEŞMESİ ────────────── */}
        <AccordionItem icon="📜" title="Mesafeli Satış Sözleşmesi">
          <H>MADDE 1 — TARAFLAR</H>
          <p>
            <strong>SATICI</strong>
            <br />
            Ünvan: {SELLER.unvan}
            <br />
            Adres: {SELLER.adres}
            <br />
            Telefon: {SELLER.telefon}
            <br />
            E-posta: {SELLER.eposta}
            <br />
            Vergi Dairesi / Vergi No: {SELLER.vergi}
            <br />
            MERSIS No: {SELLER.mersis}
          </p>
          <p>
            <strong>ALICI</strong>
            <br />
            Sipariş sırasında belirtilen ad-soyad, teslimat/fatura adresi ve iletişim
            bilgilerine sahip müşteri.
          </p>

          <H>MADDE 2 — SÖZLEŞMENİN KONUSU</H>
          <p>
            İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait {SELLER.web} internet
            sitesinden elektronik ortamda sipariş verdiği, nitelikleri ve satış fiyatı
            sipariş sayfasında belirtilen ürünün satışı ve teslimi ile ilgili olarak
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
            Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülüklerinin
            belirlenmesidir.
          </p>

          <H>MADDE 3 — SÖZLEŞME KONUSU ÜRÜN BİLGİLERİ</H>
          <p>
            Ürünün cinsi, türü, miktarı ve KDV dahil satış bedeli, sipariş sayfasında ve
            sipariş onay bildiriminde belirtildiği gibidir.
            {product?.name && (
              <>
                {' '}
                Bu sayfadaki ürün: <strong>{product.name}</strong>
                {product?.priceTry ? ` — ${product.priceTry} TL (KDV dahil)` : ''}.
              </>
            )}{' '}
            Çiçekler canlı ve doğal ürünler olduğundan, tasarım ve renkte mevsim
            koşullarına göre eşdeğer ürünlerle küçük farklılıklar gösterebilir.
          </p>

          <H>MADDE 4 — GENEL HÜKÜMLER</H>
          <p>
            4.1. ALICI, ürünün temel nitelikleri, satış fiyatı, ödeme ve teslimat şekline
            ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda
            gerekli teyidi verdiğini kabul eder.
            <br />
            4.2. Sözleşme konusu ürün, yasal süre içinde ve siparişte belirtilen teslimat
            bilgileri doğrultusunda ALICI'ya veya gösterdiği adresteki kişiye teslim edilir.
            <br />
            4.3. Haklı bir mücbir sebep veya nakliyeyi engelleyen olağanüstü durum
            nedeniyle ürün süresinde teslim edilemezse SATICI durumu ALICI'ya bildirir.
          </p>

          <H>MADDE 5 — CAYMA HAKKI VE İSTİSNASI</H>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca{' '}
            <strong>
              çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler
            </strong>{' '}
            ile <strong>tüketici istekleri doğrultusunda özel olarak hazırlanan ürünler</strong>{' '}
            cayma hakkının istisnasıdır. Taze çiçek, buket ve aranjmanlar canlı, çabuk
            bozulabilen ve siparişe özel hazırlanan ürünler olduğundan,{' '}
            <strong>bu ürünlerde ALICI'nın 14 günlük cayma (iade) hakkı bulunmamaktadır.</strong>{' '}
            Ancak ALICI'ya ayıplı (kusurlu/hasarlı/yanlış) ürün teslim edilmesi halinde
            ALICI'nın 6502 sayılı Kanun'dan doğan hakları saklıdır (bkz. İptal ve İade
            Politikası).
          </p>

          <H>MADDE 6 — TESLİMAT</H>
          <p>
            Ürün, sipariş onayı ve ödemenin tamamlanmasının ardından "Teslimat Bilgileri"
            bölümünde belirtilen koşullar dahilinde teslim edilir. Ücretsiz teslimat
            eşiğinin altındaki siparişlerde kurye/teslimat ücreti ALICI tarafından karşılanır.
          </p>

          <H>MADDE 7 — UYUŞMAZLIKLARIN ÇÖZÜMÜ</H>
          <p>
            İşbu sözleşmeden doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı'nca her yıl
            belirlenen parasal sınırlar dahilinde ALICI'nın mal veya hizmeti satın aldığı
            ya da yerleşim yerindeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri
            yetkilidir.
          </p>

          <H>MADDE 8 — YÜRÜRLÜK</H>
          <p>
            ALICI, siparişi elektronik ortamda onayladığında işbu sözleşmenin tüm
            koşullarını kabul etmiş sayılır ve sözleşme bu anda yürürlüğe girer.
          </p>
        </AccordionItem>

        {/* ────────────── 2) İPTAL VE İADE POLİTİKASI ────────────── */}
        <AccordionItem icon="🔄" title="İptal ve İade Politikası">
          <H>1. Sipariş İptali</H>
          <p>
            Siparişiniz <strong>hazırlık aşamasına geçmeden önce</strong> iptal talebinde
            bulunabilirsiniz. Henüz hazırlanmamış siparişlerde ücret, ödeme yaptığınız
            yönteme 1-14 iş günü içinde iade edilir. Hazırlığı tamamlanmış veya kurye ile
            dağıtıma çıkmış siparişler, ürünün canlı yapısı gereği iptal edilemez.
          </p>

          <H>2. Cayma Hakkının İstisnası (Önemli)</H>
          <p>
            Sattığımız çiçek, buket ve aranjmanlar{' '}
            <strong>canlı, çabuk bozulabilen ve siparişe özel hazırlanan</strong>{' '}
            ürünlerdir. Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi gereği bu
            ürünlerde <strong>14 günlük cayma (iade) hakkı uygulanmaz.</strong> Bu nedenle
            beğenmeme veya vazgeçme gibi nedenlerle iade kabul edilememektedir.
          </p>

          <H>3. Ayıplı / Hatalı / Hasarlı Ürün</H>
          <p>
            Aşağıdaki durumlarda yasal haklarınız saklıdır; ürün ücretsiz olarak yenisiyle
            değiştirilir veya bedeli iade edilir:
          </p>
          <ul style={{ margin: '6px 0 6px 18px' }}>
            <li>Ürünün hasarlı veya solmuş teslim edilmesi,</li>
            <li>Sipariş edilenden farklı bir ürünün gönderilmesi,</li>
            <li>Eksik ürün teslimi.</li>
          </ul>
          <p>
            Bu durumda lütfen teslimattan itibaren <strong>en geç 24 saat içinde</strong>,
            ürünün <strong>fotoğrafı</strong> ve sipariş numaranız ile bizimle iletişime geçin:
            <br />
            📞 {SELLER.telefon} &nbsp;·&nbsp; ✉️ {SELLER.eposta}
          </p>

          <H>4. İade / Değişim Süreci</H>
          <p>
            Talebiniz incelenir; uygun bulunması halinde değişim ürünü en kısa sürede
            gönderilir veya iade tutarı ödeme yönteminize iade edilir. Banka/kart işlem
            süreleri nedeniyle iadenin hesabınıza yansıması 1-14 iş günü sürebilir.
          </p>
        </AccordionItem>

        {/* ────────────── 3) TESLİMAT BİLGİLERİ ────────────── */}
        <AccordionItem icon="🚚" title="Teslimat Bilgileri">
          <H>1. Teslimat Bölgesi</H>
          <p>
            Teslimatlarımız <strong>İstanbul içi özel kurye</strong> ile yapılmaktadır.
            İstanbul dışı teslimat talepleriniz için lütfen sipariş öncesinde bizimle
            iletişime geçiniz.
          </p>

          <H>2. Teslimat Süresi</H>
          <ul style={{ margin: '6px 0 6px 18px' }}>
            <li>
              Saat <strong>14:00</strong>'a kadar verilen siparişler <strong>aynı gün</strong>{' '}
              teslim edilir.
            </li>
            <li>14:00'dan sonra verilen siparişler ertesi gün teslim edilir.</li>
            <li>Belirli bir teslim tarihi/saat aralığı seçtiyseniz, teslimat o aralıkta yapılır.</li>
          </ul>

          <H>3. Teslimat Ücreti</H>
          <ul style={{ margin: '6px 0 6px 18px' }}>
            <li>
              <strong>3.500 TL ve üzeri</strong> siparişlerde teslimat{' '}
              <strong>ücretsizdir.</strong>
            </li>
            <li>Bu tutarın altındaki siparişlerde kurye ücreti sipariş özetinde belirtilir.</li>
          </ul>

          <H>4. Alıcıya Ulaşılamaması</H>
          <p>
            Belirtilen adreste alıcıya ulaşılamaması halinde kurye, gönderen veya alıcı ile
            iletişime geçer. Yanlış/eksik adres ya da alıcıya ulaşılamaması nedeniyle teslim
            edilemeyen siparişlerde ek teslimat ücreti doğabilir.
          </p>

          <H>5. Teslimat Onayı</H>
          <p>
            Teslimat tamamlandığında, talebiniz halinde tarafınıza bilgilendirme yapılır.
            Sorularınız için {SELLER.telefon} numaralı hattımızdan bize ulaşabilirsiniz.
          </p>
        </AccordionItem>
      </div>
    </section>
  );
}
