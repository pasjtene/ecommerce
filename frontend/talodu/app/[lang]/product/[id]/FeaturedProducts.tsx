'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { Product, Shop } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../api/LoadingSpinner';

interface FeaturedProductsProps {
  currentProductId?: string;
  maxItems?: number;
  title?: string;
}

interface FeaturedProductsResponse {
  products: Product[];
  count: number;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  currentProductId, 
  maxItems = 8,
  title = "Featured Products"
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get<FeaturedProductsResponse>(
          `${API_BASE_URL}/products/featured?lang=${params.lang}&limit=${maxItems}`
        );
        setFeaturedProducts(response.data.products);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [params.lang, maxItems]);

  const handleProductClick = (product: Product) => {
    router.push(`/${params.lang}/product/${product.Slug}`);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleShopClick = (shop: Shop, e: React.MouseEvent) => {
    e.stopPropagation();
    if (shop.Slug) {
      router.push(`/${params.lang}/shop/products/${shop.Slug}`);
    } else {
      router.push(`/${params.lang}/shop/products/${shop.ID}`);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="text-center text-muted">{error}</div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null; // Don't show anything if no featured products
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4"> {featuredProducts.length} {title} </h3>
      
      <div className="row g-3">
        {featuredProducts.map((product) => (
          <div key={product.ID} className="col-lg-3 col-md-4 col-sm-6">
            <div 
              className="card h-100 product-card featured-product"
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid #ffc107', // Gold border for featured products
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 193, 7, 0.3)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => handleProductClick(product)}
            >
              {/* Featured Badge */}
              <div className="position-absolute top-0 start-0 m-2">
                <span className="badge bg-warning text-dark">
                  <i className="fas fa-star me-1"></i> Featured
                </span>
              </div>

              {/* Product Image */}
              <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={API_BASE_URL + product.images[0].url}
                    alt={product.name}
                    className="card-img-top h-160 "

                    style={{ 
                        objectFit: 'cover',
                        }}
                
                  />
                ) : (
                  <div 
                    className="d-flex align-items-center justify-content-center h-100 bg-light text-muted"
                  >
                    No Image
                  </div>
                )}
                
                {/* Stock Badge */}
                {product.stock <= 0 && (
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-danger">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="card-body d-flex flex-column">
                <h6 className="card-title text-truncate" title={product.name}>
                  {product.name}
                </h6>
                
                <p className="card-text text-muted small flex-grow-1">
                  {product.description && product.description.length > 80 
                    ? `${product.description.substring(0, 80)}...` 
                    : product.description
                  }
                </p>

                {/* Shop Info */}
                {product.shop && (
                  <p 
                    className="card-text small text-primary mb-2"
                    onClick={(e) => handleShopClick(product.shop, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    By {product.shop.name}
                  </p>
                )}

                {/* Price and Add to Cart */}
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="text-danger fw-bold">
                    {formatPrice(product.price)}
                  </span>
                  
                  <button
                    className={`btn btn-sm ${
                      product.stock <= 0 ? 'btn-outline-secondary' : 'btn-outline-warning'
                    }`}
                    disabled={product.stock <= 0}
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;