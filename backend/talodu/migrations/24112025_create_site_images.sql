-- Create site_images table
CREATE TABLE site_images (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(100),
    is_visible BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false
);

-- Create site_logos table
CREATE TABLE site_logos (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIM_time ZONE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(100),
    is_primary BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX idx_site_images_deleted_at ON site_images(deleted_at);
CREATE INDEX idx_site_logos_deleted_at ON site_logos(deleted_at);
CREATE INDEX idx_site_images_visible ON site_images(is_visible);
CREATE INDEX idx_site_logos_primary ON site_logos(is_primary);