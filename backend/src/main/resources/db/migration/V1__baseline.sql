-- category & product tabloları
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name VARCHAR(150) NOT NULL,
  short_description VARCHAR(255),
  price_try NUMERIC(12,2) NOT NULL,
  stock INT NOT NULL,
  category_id BIGINT NOT NULL REFERENCES categories(id),
  image_url VARCHAR(255)
);
