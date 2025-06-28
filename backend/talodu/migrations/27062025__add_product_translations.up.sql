-- backend/migrations/[timestamp]_add_product_translations.up.sql
CREATE TABLE product_translations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    UNIQUE(product_id, language)
);
