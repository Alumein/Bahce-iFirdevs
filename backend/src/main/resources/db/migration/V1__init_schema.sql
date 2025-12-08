-- 1. KATEGORİLER
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- 2. ÜRÜNLER
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    price_try DECIMAL(19, 2) NOT NULL,
    stock INTEGER NOT NULL,
    image_url VARCHAR(255),
    category_id BIGINT REFERENCES categories(id)
);

-- 3. MÜŞTERİLER
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50)
);

-- 4. ADRESLER
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    address_label VARCHAR(50),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. SİPARİŞLER
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    buyer_name VARCHAR(255),
    buyer_email VARCHAR(255),
    buyer_phone VARCHAR(50),
    address_line TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    notes TEXT,
    order_total_try DECIMAL(19, 2),
    status VARCHAR(50),
    customer_id BIGINT REFERENCES customers(id),
    payment_ref VARCHAR(255),
    delivery_date DATE,
    delivery_time VARCHAR(50)
);

-- 6. SİPARİŞ DETAYLARI
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Added previously
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Added previously
    product_name VARCHAR(255),
    unit_price_try DECIMAL(19, 2),
    quantity INTEGER,
    line_total_try DECIMAL(19, 2),
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id)
);

-- 7. SİPARİŞ GEÇMİŞİ (Log)
CREATE TABLE order_status_history (
    id BIGSERIAL PRIMARY KEY,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    note TEXT,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE
);

-- 8. YORUMLAR
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rating INTEGER NOT NULL,
    comment TEXT,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    order_id BIGINT
);

-- 9. KUPONLAR
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percentage INTEGER NOT NULL,
    expiration_date DATE NOT NULL,
    min_cart_amount DECIMAL(19, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 10. FAVORİLER
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uk_favorites_customer_product UNIQUE (customer_id, product_id)
);