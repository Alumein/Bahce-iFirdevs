-- 1. KATEGORİLERİ EKLE
INSERT INTO categories (id, name, description) VALUES
(1, 'Güller (Kutu & Vazoda)', 'Aşkın simgesi kırmızı, beyaz, renkli ve solmayan güller.'),
(2, 'Orkideler', 'Zarafetin simgesi yerli ve ithal orkide çeşitleri.'),
(3, 'Saksı & Salon Bitkileri', 'Ofis ve ev için dayanıklı yeşil yapraklı bitkiler.'),
(4, 'Papatya & Gerbera', 'Mevsimin en taze papatya ve gerbera aranjmanları.'),
(5, 'Lilyum & Lisyantüs', 'Mis kokulu lilyumlar ve zarif lisyantüs buketleri.'),
(6, 'Tasarım Çiçekler & Buketler', 'Özel kraft kağıtlı, modern butik tasarımlar.'),
(7, 'Teraryum & Minyatür Bahçeler', 'Sukulent ve kaktüslerle hazırlanan cam fanus tasarımları.'),
(8, 'Merasim & Çelenk', 'Düğün, açılış ve cenaze için ayaklı sepet ve çelenkler.'),
(9, 'Kek & Çikolata Buketleri', 'Yenilebilir lezzetli hediye seçenekleri.');

-- ID sayacını düzelt (9'dan sonrasını versin)
ALTER SEQUENCE categories_id_seq RESTART WITH 10;

-- 2. ÜRÜNLERİ EKLE
-- GÜLLER
INSERT INTO products (category_id, name, price_try, stock, short_description, image_url) VALUES
(1, '101 Kırmızı Gül - Büyük Aşk', 5500.00, 5, 'Siyah ithal kağıda sarılı, devasa boyutta 101 adet birinci sınıf kırmızı gül.', 'https://images.unsplash.com/photo-1572454591674-2739f30d8c40?auto=format&fit=crop&w=800&q=80'),
(1, 'Vazoda 11 Kırmızı Gül', 950.00, 30, 'Şık silindir cam vazoda, cipsofilyalarla süslenmiş 11 kırmızı gül.', 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=800&q=80'),
(1, 'Kutuda Beyaz Güller (25 Adet)', 1800.00, 10, 'Siyah silindir kutu içerisinde 25 adet saf beyaz gül.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'),
(1, 'Sarı Güller (Vazoda)', 850.00, 20, 'Dostluğu ve sıcaklığı temsil eden 15 adet sarı gül.', 'https://images.unsplash.com/photo-1582794543139-8ac5f10668d9?auto=format&fit=crop&w=800&q=80'),
(1, 'Solmayan Gül (Fanusta)', 650.00, 50, 'Özel işlem görmüş, 2 yıl solmayan şoklanmış kırmızı gül.', 'https://images.unsplash.com/photo-1590074251260-2b10a26d71b3?auto=format&fit=crop&w=800&q=80');

-- ORKİDELER
INSERT INTO products (category_id, name, price_try, stock, short_description, image_url) VALUES
(2, 'Tek Dal Beyaz Orkide', 950.00, 20, 'Seramik saksıda, zarif ve asil tek dal Phalaenopsis orkide.', 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=800&q=80'),
(2, 'Çift Dal Mor Orkide', 1250.00, 15, 'Dolgun çiçekli, çift dal mor (fuşya) orkide.', 'https://images.unsplash.com/photo-1566912663068-7942016f9628?auto=format&fit=crop&w=800&q=80'),
(2, 'Mavi Orkide (Royal Blue)', 1600.00, 8, 'Özel renklendirilmiş, nadir bulunan asil mavi orkide.', 'https://images.unsplash.com/photo-1662377088248-11998c754042?auto=format&fit=crop&w=800&q=80');

-- SAKSI BİTKİLERİ
INSERT INTO products (category_id, name, price_try, stock, short_description, image_url) VALUES
(3, 'Barış Çiçeği (Spatifilyum)', 600.00, 25, 'Hava temizleyici özelliği olan, beyaz çiçekli dayanıklı salon bitkisi.', 'https://images.unsplash.com/photo-1593696954577-ab3d39317b97?auto=format&fit=crop&w=800&q=80'),
(3, 'Deve Tabanı (Monstera)', 1400.00, 10, 'Büyük ve delikli yapraklarıyla trend salon bitkisi (100-120cm).', 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80'),
(3, 'Massengena (Drazena)', 1100.00, 12, 'Çift gövdeli, ofis köşeleri için ideal, dayanıklı ağaçsı bitki.', 'https://images.unsplash.com/photo-1612362555330-56575d6637df?auto=format&fit=crop&w=800&q=80'),
(3, 'Paşa Kılıcı (Sansevieria)', 550.00, 30, 'Bakımı en kolay, susuzluğa dayanıklı, hava temizleyen kılıç çiçeği.', 'https://images.unsplash.com/photo-1620126487776-926362706346?auto=format&fit=crop&w=800&q=80');

-- PAPATYA
INSERT INTO products (category_id, name, price_try, stock, short_description, image_url) VALUES
(4, 'Beyaz Papatya Buketi', 500.00, 40, 'Doğallıktan yana olanlar için kucak dolusu beyaz papatyalar.', 'https://images.unsplash.com/photo-1606041011872-596597976b25?auto=format&fit=crop&w=800&q=80'),
(4, 'Renkli Gerberalar (Vazoda)', 600.00, 25, 'Turuncu, sarı ve pembe gerberalardan oluşan enerji dolu vazo aranjmanı.', 'https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?auto=format&fit=crop&w=800&q=80');

-- TASARIM
INSERT INTO products (category_id, name, price_try, stock, short_description, image_url) VALUES
(6, 'Kır Bahçesi Buketi', 800.00, 20, 'Mevsimin en taze kır çiçekleri, başak ve yeşilliklerle hazırlanan buket.', 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=800&q=80'),
(6, 'Gelin Buketi (Beyaz Lale)', 1500.00, 5, 'Düğün ve nikah için özel tasarım, sade beyaz laleler.', 'https://images.unsplash.com/photo-1596047264008-896f55cb3365?auto=format&fit=crop&w=800&q=80');

-- MERASİM
INSERT INTO products (category_id, name, price_try, stock, short_description, image_url) VALUES
(8, 'Kırmızı Beyaz Çelenk (Cenaze)', 2500.00, 99, 'Karanfil ve gerberalarla hazırlanan, kuşak yazısı dahil klasik çelenk.', 'https://images.unsplash.com/photo-1595955246116-c813b0128082?auto=format&fit=crop&w=800&q=80'),
(8, 'Ayaklı Sepet (Ferforje)', 3000.00, 99, 'Açılış ve düğünler için lüks, çift katlı, mevsim çiçekli ayaklı sepet.', 'https://images.unsplash.com/photo-1519225421980-715cb0202128?auto=format&fit=crop&w=800&q=80');