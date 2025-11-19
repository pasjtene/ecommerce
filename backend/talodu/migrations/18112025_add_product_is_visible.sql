ALTER TABLE products ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
CREATE INDEX idx_products_visible ON products (is_visible) WHERE is_visible = true;