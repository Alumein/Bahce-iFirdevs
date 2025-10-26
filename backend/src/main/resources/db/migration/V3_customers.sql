CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  full_name  VARCHAR(120) NOT NULL,
  email      VARCHAR(120) NOT NULL UNIQUE,
  phone      VARCHAR(30),
  password_hash VARCHAR(72) NOT NULL
);

-- orders tablosuna opsiyonel müşteri ilişkisi
ALTER TABLE orders
  ADD COLUMN customer_id BIGINT NULL REFERENCES customers(id);

CREATE INDEX idx_customers_email ON customers(email);
