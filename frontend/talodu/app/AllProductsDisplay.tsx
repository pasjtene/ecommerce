import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {Product} from './types';
import axios from 'axios';
import SubHeader, {
    SubHeaderLeft,
   
} from '../src/layout/SubHeader/SubHeader';
import Icon from '../src/components/icon/Icon';
import Input from '../src/components/bootstrap/forms/Input';
import { useSearchParams } from 'next/navigation';

const AllProductsDisplay  = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    //const [searchTerm, setSearchTerm] = useState('');
    const [API_BASE_URL, setApibaseUrl] = useState<string | null>(null);
    //const navigate = useNavigate();
    const router = useRouter();
    const [pagination, setPagination] = useState({
            page: 1,
            limit: 10,
            totalItems: 0,
            totalPages: 1
          });

          useEffect(() => {
        if (searchTerm) {
            fetchShopProducts(1, pagination.limit, searchTerm);
        }
    }, [searchTerm]);

      const fetchShopProducts = async (page = 1, limit = 10, search = ''):Promise<void> => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
                setApibaseUrl(API_BASE_URL);
                    if (!API_BASE_URL) {
                throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
                }
                    const response = await axios.get(API_BASE_URL+`/products`,{
                        //const response = await axios.get(API_BASE_URL+`/shops/${shop.ID}/products`,{
                
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
              console.log("The data...",response.data);
              setLoading(false);
            } catch (e: any) {
              setError(e.message);
              setLoading(false);
            }finally {
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

 
  const handleViewproductDetails = (product: Product) => {
    const url =   `/product/${product.Slug}`;
    router.push(url);
       
      };

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4"> {allImages.length} images</h2>
      <SubHeader>
            <SubHeaderLeft>
                <label
                    className='border-0 bg-transparent cursor-pointer me-0'
                    htmlFor='searchInput'>
                    <Icon icon='Search' size='2x' color='primary' />
                </label>
                <Input
                    id='searchInput'
                    //type='search'
                    type='text'
                    className='border-0 shadow-none bg-transparent'
                    placeholder='search....'
                    value={searchTerm}
                    onChange={(e:React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    
                />
            </SubHeaderLeft>
        
    </SubHeader>

    {/** Products */}
    <div className='m-4'>Tous les produits</div>
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
              //onClick={() => handleViewProductDetailsLug(prod)}
              //onClick={() => handleViewProductDetailsLug(prod)}
              onClick={() => handleViewproductDetails(prod)}
              
            
            >
              <img 
               src={API_BASE_URL+prod.images[0]?.url}
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
                    {(prod.price).toFixed(0)} FCFA
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

    {/** End product */}


        <div className='m-4'>Toutes les images</div>

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
                    {(image.price || image.productPrice).toFixed(0)} FCFA
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
    </div>
  );
};

export default AllProductsDisplay;