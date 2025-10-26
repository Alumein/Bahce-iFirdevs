-- Sabit kategoriler (isim unique olduğundan tekrar çalıştırmada sorun yok)
INSERT INTO categories (name, description)
SELECT 'Buket', 'Klasik ve özel gün buketleri'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Buket');

INSERT INTO categories (name, description)
SELECT 'Gül', 'Kırmızı, beyaz, karışık güller'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Gül');

INSERT INTO categories (name, description)
SELECT 'Papatya', 'Papatya aranjmanları'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Papatya');

INSERT INTO categories (name, description)
SELECT 'Orkide', 'Saksı orkideleri'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Orkide');

INSERT INTO categories (name, description)
SELECT 'Sukulent', 'Saksı sukulentler'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Sukulent');

INSERT INTO categories (name, description)
SELECT 'Saksı', 'Saksı çiçekleri'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Saksı');

INSERT INTO categories (name, description)
SELECT 'Doğum Günü', 'Doğum günü için önerilenler'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Doğum Günü');

INSERT INTO categories (name, description)
SELECT 'Taziye', 'Taziye/başsağlığı çiçekleri'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Taziye');
