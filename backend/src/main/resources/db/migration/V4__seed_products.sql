-- Kategori yoksa basit bir tane oluştur
INSERT INTO categories (name)
SELECT 'Buket'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name='Buket');

-- Kategori id'sini al
WITH c AS (
  SELECT id FROM categories WHERE name='Buket' LIMIT 1
)
INSERT INTO products (name, short_description, price_try, stock, category_id, image_url)
SELECT 'Gül Buketi', 'Klasik kirmizi güller', 499.90, 50, c.id, NULL FROM c
UNION ALL
SELECT 'Lale Buketi', 'Renkli lale karışımı', 349.90, 30, c.id, NULL FROM c
UNION ALL
SELECT 'Orkide', 'Saksı orkide', 899.00, 15, c.id, NULL FROM c
ON CONFLICT DO NOTHING;
