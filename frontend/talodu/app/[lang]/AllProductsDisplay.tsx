//app/[lang]/AllProductsDisplay.tsx

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product } from './types';
import axios from 'axios';
import { useCurrency } from './contexts/CurrencyContext';
import { useSearchParams } from 'next/navigation';
import FeaturedProducts from './product/[id]/FeaturedProducts';
import RecentlyViewedProducts from './product/[id]/RecentlyViewedProducts';
import { useSettings } from './hooks/useSettings';
import { useSiteImages } from './hooks/useSiteImages';
import SiteImagesCarousel from './components/SiteImagesCarousel';


interface Dictionary {
  product: {
    back_to_list: string;
    by_shop: string;
    no_images: string;
    edit_as: string;
    shop_owner: string;
    admin: string;
    super_admin: string;
    price: string;
  };
}

const defaultDictionary: Dictionary = {
  product: {
    back_to_list: 'Back to List',
    by_shop: 'By {shopName}',
    no_images: 'No images available',
    edit_as: 'Edit as:',
    shop_owner: 'Shop Owner',
    admin: 'Admin',
    super_admin: 'Super Admin',
    price: 'Price',
  },
};

const AllProductsDisplay = () => {
  const searchParams = useSearchParams();
  const { currency, currencyRate, currencySymbol, formatPrice } = useCurrency();
  const searchTerm = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [translation, setDictionary] = useState<Dictionary>(defaultDictionary);
  const [API_BASE_URL, setApibaseUrl] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  
  // Use the settings hook
  const { settings, loading: settingsLoading } = useSettings();
 
  // Use the site images hook
  const { siteImages, loading: siteImagesLoading } = useSiteImages();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    totalItems: 0,
    totalPages: 1
  });

  useEffect(() => {
    if (searchTerm) {
      fetchShopProducts(1, pagination.limit, searchTerm);
    }
  }, [searchTerm]);

  // Load translations
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await import(`./translations/${params.lang}.json`);
      setDictionary(dict.default);
    };
    loadDictionary();
  }, [params.lang]);

  const fetchShopProducts = async (page = 1, limit = 30, search = ''): Promise<void> => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
      setApibaseUrl(API_BASE_URL);
      if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
      }
      const response = await axios.get(API_BASE_URL + `/products`, {
        params: {
          page,
          limit,
          search: search.length > 0 ? search : undefined
        },
        headers: {
          //Authorization: `${jwtToken}`, // Include the JWT token in the Authorization header
        },
      });
      setProducts(response.data.products);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages
      });
      console.log("The data...", response.data);
      setLoading(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search - resets to page 1 when searching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 2 || searchTerm.length === 0) {
        fetchShopProducts(1, pagination.limit, searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
    setApibaseUrl(API_BASE_URL);
    if (!API_BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
    }

    fetchShopProducts(1, pagination.limit, searchTerm);
  }, []);

  if (loading || settingsLoading) {
    return <div className="text-center my-5">Loading products...</div>;
  }

  if (error) {
    return <div className="alert alert-danger my-5">{error}</div>;
  }

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

  const handleViewproductDetails = (product: Product) => {
    const url = `/product/${product.Slug}`;
    router.push(url);
  };

  const handleImageClick = (productSlug: string, productId: number) => {
    const url = `/product/${productSlug}`;
    router.push(url);
  };

  const handleViewproductBySlug = (productSlug: string) => {
    const url = `/product/${productSlug}`;
    router.push(url);
  };

  // Use default settings if not loaded
  const displaySettings = settings?.displaySettings || {
    showFeaturedProducts: settings?.displaySettings.showFeaturedProducts || true,
    showRecentlyViewed: true,
    showAllProducts: true,
    showAllImages: false,
    featuredProductsTitle: "Featured Products You'll Love",
    featuredProductsCount: settings?.displaySettings.featuredProductsCount || 8,
    recentlyViewedCount: settings?.displaySettings.recentlyViewedCount || 8,
    showCarousel: true,
    transitionDuration: settings?.displaySettings.carouselTransition || 'fade'
  };

  return (
    <div className="container mt-4 py-4">

    {/* Site Images Carousel - Conditionally rendered */}
      {displaySettings.showCarousel && siteImages.length > 0 && (
  <div className="row">
    <div className="col-12">
     
      <SiteImagesCarousel 
        images={siteImages}
        autoPlay={true}
        interval={settings?.displaySettings.carouselInterval || 5000}
        showIndicators={true}
        showControls={true}
        transitionDuration={settings?.displaySettings.carouselTransitionDuration || 600}
        transitionType={settings?.displaySettings.carouselTransition || 'fade'}
      />
    </div>
  </div>
)}

      {/* Featured Products Section - Conditionally rendered */}
      {displaySettings.showFeaturedProducts && (
        <div className="row mt-5">
          <div className="col-12">
            <FeaturedProducts
              currentProductId={"1"}
              maxItems={displaySettings.featuredProductsCount}
              title={displaySettings.featuredProductsTitle}
            />
          </div>
        </div>
      )}

      {/* Recently Viewed Products Section - Conditionally rendered */}
      {displaySettings.showRecentlyViewed && (
        <div className="row mt-5">
          <div className="col-12">
            <RecentlyViewedProducts
              currentProductId={"1"}
              maxItems={displaySettings.recentlyViewedCount}
            />
          </div>
        </div>
      )}

      {/* All Products Section - Conditionally rendered */}
      {displaySettings.showAllProducts && (
        <>
          <div className='m-4'>All products</div>
          {(products?.length > 0) && (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {products.map((prod) => (
                <div key={prod.ID} className="col">
                  <div className="card h-100 "
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: hoveredCard == prod.images[0]?.ID ? '0 0 20px rgba(13, 89, 219, 0.2)' : '0 0 15px rgba(0,0,0,0.2)',
                      transition: 'box-shadow 0.3s ease',
                      padding: hoveredCard == prod.images[0]?.ID ? '7px' : '12px', // Space between image and shadow
                    }}
                    onMouseEnter={() => setHoveredCard(prod.images[0]?.ID)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleViewproductDetails(prod)}
                  >
                    <img
                      src={API_BASE_URL + prod.images[0]?.url}
                      alt={prod.images[0]?.altText || `Product: ${prod.name}`}
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
                        {prod.description || prod.name}
                      </h5>
                      <p className="card-text">
                        <span className="fw-bold">
                          {formatPrice(prod.price)}
                        </span>
                      </p>
                      {prod.description && (
                        <p className="card-text small text-muted">
                          {prod.description}
                        </p>
                      )}
                    </div>
                    {!prod.images[0] && (
                      <div className="card-footer bg-primary bg-opacity-10">
                        <small className="text-primary">Pas d'image</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>)}
        </>
      )}

      {/* All Images Section - Conditionally rendered */}
      {displaySettings.showAllImages && (
        <>
          <div className='m-4'>All images</div>
          {(allImages?.length > 0) && (
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
                      src={API_BASE_URL + image.url}
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
                          {formatPrice(image.productPrice)}
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
            </div>)}
        </>
      )}

      {/* Show message if all sections are hidden */}
      {!displaySettings.showFeaturedProducts &&
        !displaySettings.showRecentlyViewed &&
        !displaySettings.showAllProducts &&
        !displaySettings.showAllImages && (
          <div className="text-center py-5">
            <h3>No Content to Display</h3>
            <p className="text-muted">
              All display sections are currently hidden. Enable sections in the admin settings.
            </p>
          </div>
        )}
    </div>
  );
};

export default AllProductsDisplay;