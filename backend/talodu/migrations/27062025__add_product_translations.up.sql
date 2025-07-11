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

CREATE TABLE product_abouts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    item_order INTEGER NOT NULL,
    about_text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_product
        FOREIGN KEY(product_id) 
        REFERENCES products(id)
        ON DELETE CASCADE
);

-- Create a trigger to update the updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_abouts_updated_at
BEFORE UPDATE ON product_abouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Product about translations table
CREATE TABLE product_about_translations (
    id SERIAL PRIMARY KEY,
    product_about_id INTEGER NOT NULL,
    language VARCHAR(5) NOT NULL, -- en, fr, es
    about_text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_product_about
        FOREIGN KEY(product_about_id) 
        REFERENCES product_abouts(id)
        ON DELETE CASCADE,
    
    CONSTRAINT unique_translation
        UNIQUE(product_about_id, language)
);

-- Update the original product_abouts table to remove the about_text
ALTER TABLE product_abouts DROP COLUMN about_text;