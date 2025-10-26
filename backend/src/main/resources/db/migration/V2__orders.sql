-- orders
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  buyer_name  VARCHAR(120) NOT NULL,
  buyer_email VARCHAR(120) NOT NULL,
  buyer_phone VARCHAR(30),
  address_line VARCHAR(180) NOT NULL,
  city VARCHAR(90) NOT NULL,
  district VARCHAR(90),
  notes VARCHAR(255),

  status VARCHAR(20) NOT NULL,
  payment_ref VARCHAR(100) UNIQUE,

  order_total_try NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX idx_orders_status ON orders(status);

-- order_items
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),

  product_name VARCHAR(150) NOT NULL,
  unit_price_try NUMERIC(12,2) NOT NULL,
  quantity INT NOT NULL,
  line_total_try NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
