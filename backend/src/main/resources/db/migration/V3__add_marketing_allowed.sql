-- Mevcut customers tablosuna marketing_allowed sütununu ekle
ALTER TABLE customers
ADD COLUMN marketing_allowed BOOLEAN NOT NULL DEFAULT FALSE;