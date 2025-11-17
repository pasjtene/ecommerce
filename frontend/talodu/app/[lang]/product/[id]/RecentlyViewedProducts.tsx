'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product, Shop } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';

interface RecentlyViewedProductsProps {
  currentProductId?: string;
  maxItems?: number;
}

const RecentlyViewedProducts: React.FC<RecentlyViewedProductsProps> = ({ 
  currentProductId, 
  maxItems = 8 
}) => {
  const { getRecentProducts } = useRecentlyViewed();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();

  // Get recently viewed products, excluding the current one
  const recentProducts = getRecentProducts(currentProductId).slice(0, maxItems);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  const handleProductClick = (product: Product) => {
    router.push(`/${params.lang}/product/${product.ID}`);
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

  if (recentProducts.length === 0) {
    return null; // Don't show anything if no recently viewed products
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Recently Viewed</h3>
      
      <div className="row g-3">
        {recentProducts.map((product) => (
          <div key={product.ID} className="col-lg-3 col-md-4 col-sm-6">
            <div 
              className="card h-100 product-card"
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #dee2e6'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => handleProductClick(product)}
            >
              {/* Product Image */}
              <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={API_BASE_URL + product.images[0].url}
                    alt={product.name}
                    className="card-img-top h-100"
                    style={{ objectFit: 'cover' }}
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
                  <div className="position-absolute top-0 start-0 m-2">
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
                      product.stock <= 0 ? 'btn-outline-secondary' : 'btn-outline-primary'
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

export default RecentlyViewedProducts;