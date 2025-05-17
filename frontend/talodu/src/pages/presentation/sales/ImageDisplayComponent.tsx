import React, { useEffect, useState } from 'react';
import { User, Product, ProductImage, Shop} from '../auth/types';
import axios from 'axios';
import { API_BASE_URL } from '../auth/api'

interface ImageDisplayProps {
  shop: Shop;
}



const ImageDisplayComponent: React.FC<ImageDisplayProps> = ({ shop }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchShopProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_BASE_URL+`/shops/${shop.ID}/products`);
        setProducts(response.data.products);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopProducts();
  }, [shop.ID]);

  if (loading) {
    return <div className="text-center my-5">Loading products...</div>;
  }

  if (error) {
    return <div className="alert alert-danger my-5">{error}</div>;
  }

  const handleImageClick = (productSlug: string, productId: number) => {
    // navigate(`/products/${productSlug || productId}`);
   };

// Flatten all product images from the shop
  const allImages = products.flatMap(product => 
    (product.images || []).map(image => ({
      ...image,
      productName: product.name,
      productPrice: product.price,
      productSlug: product.Slug,
      productId: product.ID
    }))
  );

  if (!allImages || allImages.length === 0) {
    return (
      <div className="alert alert-info mt-4">
        No images available for products in this shop.
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">Nos Products</h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {allImages.map((image) => (
          <div key={image.ID} className="col">
            <div className="card h-100 "
             style={{ 
                border: 'none',
                cursor: 'pointer',
                boxShadow: hoveredCard == image.ID ? '0 0 20px rgba(13, 89, 219, 0.2)' : '0 0 15px rgba(0,0,0,0.2)',
                transition: 'box-shadow 0.3s ease',
                padding: hoveredCard == image.ID ? '7px' : '12px', // Space between image and shadow
              }}
              onMouseEnter={() => setHoveredCard(image.ID)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleImageClick(image.productSlug, image.productId)}
            
            >
              <img 
                src={API_BASE_URL+image.url} 
                alt={image.altText || `Product: ${image.productName}`}
                className="card-img-top img-fluid"
                style={{ 
                  height: '350px',
                  objectFit: 'cover',
                  width: '100%',
                  borderRadius: '0'
                }}
              />
              <div className="card-body">
                <h5 className="card-title text-truncate">
                  {image.description || image.productName}
                </h5>
                <p className="card-text">
                  <span className="fw-bold">
                    ${(image.price || image.productPrice).toFixed(2)}
                  </span>
                </p>
                {image.description && (
                  <p className="card-text small text-muted">
                    {image.description}
                  </p>
                )}
              </div>
              {image.isPrimary && (
                <div className="card-footer bg-primary bg-opacity-10">
                  <small className="text-primary">Featured</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageDisplayComponent;