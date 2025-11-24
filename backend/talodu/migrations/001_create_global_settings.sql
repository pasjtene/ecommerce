-- migrations/001_create_global_settings.sql
-- +migrate Up
CREATE TABLE global_settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL DEFAULT 'Talodu',
    site_description TEXT DEFAULT '',
    maintenance_mode BOOLEAN DEFAULT false,
    currency VARCHAR(10) DEFAULT 'USD',
    email_notifications BOOLEAN DEFAULT true,
    display_settings JSONB DEFAULT '{
        "showFeaturedProducts": true,
        "showRecentlyViewed": true,
        "showAllProducts": true,
        "showAllImages": false,
        "featuredProductsTitle": "Featured Products You''ll Love",
        "featuredProductsCount": 8,
        "recentlyViewedCount": 8
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO global_settings (id, site_name, site_description) 
VALUES (1, 'Talodu', 'Your online super market');

CREATE INDEX idx_global_settings_id ON global_settings(id);

-- +migrate Down
DROP INDEX IF EXISTS idx_global_settings_id;
DROP TABLE IF EXISTS global_settings;