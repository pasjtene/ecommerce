
// pages/product/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import Page from '../../src/layout/Page/Page';
import PageWrapper from '../../src/layout/PageWrapper/PageWrapper';
import Card, {
  CardBody,
  CardFooter,
  CardFooterLeft,
  CardFooterRight,
  CardHeader,
  CardLabel,
  CardSubTitle,
  CardTitle,
} from '../../src/components/bootstrap/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faShoppingCart,
  faSearch,
  faCog,
  faSignOutAlt,
  faChevronDown,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import Icon from '../../src/components/icon/Icon';
import Input from '../../src/components/bootstrap/forms/Input';
import showNotification from '../../src/components/extras/showNotification';
import useDarkMode from '../../src/hooks/useDarkMode';
import { Product, ProductImage, Shop } from '../../src/pages/presentation/auth/types'; // Ensure Shop is imported
import axios from 'axios';
import { API_BASE_URL } from '../../src/pages/presentation/auth/api';
import ProductImageGallery from '../../src/pages/presentation/sales/ProductImageGallery';
import { toast } from 'react-toastify';
import Head from 'next/head';
import Button from 'react-bootstrap/Button';
import { GetServerSideProps } from 'next'; // Import GetServerSideProps type
import  DashboardBookingHeader  from  '../../src/pages/_layout/_headers/DashboardBookingHeader'
import HeaderNext from  '../../src/pages/_layout/_headers/Headernext'

// --- Import dynamic for client-only components if needed ---
import dynamic from 'next/dynamic';
// Assuming ProductImageGallery might cause 'document is not defined'
const DynamicProductImageGallery = dynamic(
  () => import('../../src/pages/presentation/sales/ProductImageGallery'),
  { ssr: false }
);
// --- END dynamic import ---


interface IValues {
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

const validate = (values: IValues) => {
  const errors = {
    name: '',
    price: '',
    stock: '',
    category: '',
  };

  if (!values.name) {
    errors.name = 'Required';
  } else if (values.name.length < 3) {
    errors.name = 'Must be 3 characters or more';
  } else if (values.name.length > 20) {
    errors.name = 'Must be 20 characters or less';
  }

  if (!values.price) {
    errors.price = 'Required';
  } else if (values.price < 0) {
    errors.price = 'Price should not be 0';
  }

  if (!values.stock) {
    errors.stock = 'Required';
  }

  if (!values.category) {
    errors.category = 'Required';
  } else if (values.category.length < 3) {
    errors.category = 'Must be 3 characters or more';
  } else if (values.category.length > 20) {
    errors.category = 'Must be 20 characters or less';
  }

  return errors;
};

type TTabs = 'Summary' | 'Comments' | 'Edit';
interface ITabs {
  [key: string]: TTabs;
}

interface ProductDetailNextProps {
  // Now 'product' is always provided as a prop from getServerSideProps
  product: Product | null; // Make it null if not found, or directly Product if you redirect
  error?: string; // Prop for error message if fetching fails
}

const ProductDetailNext = ({ product, error: propError }: ProductDetailNextProps) => { // Directly use 'product' here
  const { darkModeStatus } = useDarkMode();
  const router = useRouter();
  const { id } = router.query; // id is still useful for other client-side logic or if product is null

  // State for images (still fetched client-side, or you could add another getServerSideProps call)
  const [images, setImages] = useState<ProductImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null); // Use a distinct name for client-side errors
  const [refresh, setRefresh] = useState(false);
  // 'product' state can still be used if you allow client-side updates/edits
  const [currentProduct, setCurrentProduct] = useState<Product | null>(product);
  const [loading, setLoading] = useState(false); // Loading is now managed by getServerSideProps initially

  // Consolidate error handling
  const displayError = propError || clientError;

  // Fetch images (still client-side, as images might be mutable/large)
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const API_URL = process.env.API_BASE_URL || "http://127.0.0.1:8888";
        //const API_URL2 = API_BASE_URL; // Use API_BASE_URL from your config
        const productId = id?.toString().split('-').pop();
        if (!productId) {
          setClientError('Product ID not found in URL.');
          return;
        }

        console.log("In fetch images. The API base URL is:", API_URL);
        //const API_URL = process.env.API_BASE_URL || "http://127.0.0.1:8888";

        const response = await axios.get<{ images: ProductImage[] }>(
          `${API_URL}/images/product/${productId}`,
        );
        setImages(response.data.images);
        setClientError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setClientError(err.response?.data?.error || err.message);
        } else if (err instanceof Error) {
          setClientError(err.message);
        } else {
          setClientError('An unknown error occurred while fetching images');
        }
      }
    };

    if (currentProduct) { // Only fetch images if product data is available
        fetchImages();
    }

  }, [id, refresh, currentProduct]); // Add currentProduct to dependency array

  // Removed the local fetchProduct function as data is now from getServerSideProps
  // Also removed the useEffect that called local fetchProduct

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !currentProduct?.ID) return;

    setUploading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/images/product/${currentProduct?.ID}/batch`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setProgress(percentCompleted);
            }
          },
        },
      );

      toast.success('Images uploaded successfully!');
      setImages((prevImages) => [...prevImages, ...response.data.images]);
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      if (axios.isAxiosError(error)) {
        toast.error(`Upload failed: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const TABS: ITabs = {
    SUMMARY: 'Summary',
    COMMENTS: 'Comments',
    EDIT: 'Edit',
  };
  const [activeTab, setActiveTab] = useState(TABS.SUMMARY);

  const [editItem, setEditItem] = useState<IValues>({
    name: currentProduct?.name || '',
    price: currentProduct?.price || 0,
    stock: currentProduct?.stock || 0,
    category:  '', // Use currentProduct for initial state
    //category: currentProduct?.category || '',
  });

  const formik = useFormik({
    initialValues: {
      name: currentProduct?.name || '', // Initialize Formik with actual product data
      price: currentProduct?.price || 0,
      stock: currentProduct?.stock || 0,
      category: '',
    },
    validate,
    onSubmit: (values) => {
      showNotification(
        <span className='d-flex align-items-center'>
          <Icon icon='Info' size='lg' className='me-1' />
          <span>Updated Successfully</span>
        </span>,
        'Product has been updated successfully',
      );
      // In a real app, you'd send 'values' to your backend to update the product
      // then likely refresh the currentProduct state or images if necessary.
    },
  });

  useEffect(() => {
    // Only update formik and editItem if the product prop changes (e.g., from a new server-side render)
    // or if currentProduct state changes internally due to client-side updates.
    if (currentProduct) {
      formik.setValues({
        name: currentProduct.name,
        price: currentProduct.price,
        stock: currentProduct.stock,
        //category: currentProduct.category,
        category: '',
      });
      setEditItem({
        name: currentProduct.name,
        price: currentProduct.price,
        stock: currentProduct.stock,
        category: '',
      });
    }
  }, [currentProduct]); // Depend on currentProduct state

  if (loading) return <div>Loading product details...</div>; // This loading state is for client-side operations only now.
  if (displayError) return <div>Error: {displayError}</div>; // Use the consolidated error
  if (!currentProduct) return <div>Product not found</div>; // Check currentProduct

  return (
    <>
      <Head>
        {/* Now product.name and product.description will be available on SSR */}
        <meta name='description' content={`Buy ${currentProduct.name} - ${currentProduct.description}`} />
        <title>{currentProduct.name} | Talodu</title>
      </Head>

      <PageWrapper>
        <HeaderNext/>
        <div className='row'>
          <div className='col-md-6 col-lg-6 col-sm-6'>
            <Button color='info' onClick={() => router.back()}>
              Retour a la Liste
            </Button>
          </div>
          <div className='col-lg-6 col-md-6 col-sm-6'>
            <span className='text-muted fst-italic me-2'>Last update:</span>
            <span className='fw-bold'>13 hours ago</span> {/* This needs to be dynamic from product */}
          </div>
        </div>

        <Page>
          <a className='text-decoration-none display-6 py-3 text-danger' style={{ cursor: 'pointer' }}>
            By {currentProduct?.shop?.name || 'Unknown Shop'}
          </a>
          <div className='display-4 fw-bold py-3'>{currentProduct?.name}</div>

          <div className='container py-4'>
            {images?.length > 0 ? (
              // Use DynamicProductImageGallery
              <DynamicProductImageGallery images={images} product={currentProduct} />
            ) : (
              <div>No images</div>
            )}
          </div>

          <div className='mt-4'>
            <h5 className='mb-3'>Current Images</h5>
            {images?.length > 0 ? (
              <div className='row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4'>
                {images.map((image) => (
                  <div key={image.ID} className='col'>
                    <div className='card h-100 shadow-sm'>
                      <img
                        src={image.url}
                        alt={image.altText || 'Product image'}
                        className='card-img-top img-thumbnail'
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className='card-body'>
                        <h6 className='card-title text-truncate'>{image.url.split('/').pop()}</h6>
                        {image.altText && (
                          <p className='card-text text-muted small'>{image.altText}</p>
                        )}
                      </div>
                      <div className='card-footer bg-white'>
                        <div className='d-flex justify-content-between'>
                          <button className='btn btn-sm btn-outline-primary'>Set as Primary</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='alert alert-info'>No images available for this product</div>
            )}
          </div>

          <div className='row h-100 mt-5'>
            <div className='col-lg-8'>
             
            
                  <Card>
                    <CardHeader>
                    <CardLabel >
                        <CardTitle>Product Image</CardTitle>
                      </CardLabel>
                    </CardHeader>
                    <CardBody>
                      <div className='row'>
                        <div className='col-lg-8'>
                          <div className='row g-4'>
                            <div className='col-12'>
                              <Input
                                type='file'
                                autoComplete='photo'
                                onChange={handleFileChange}
                                multiple
                                accept='image/*'
                              />
                            </div>

                            <button
                              onClick={handleUpload}
                              disabled={uploading || files.length === 0}>
                              {uploading ? `Uploading... ${progress}%` : 'Upload'}
                            </button>
                            {files.length > 0 && (
                              <div>
                                <p>Selected files:</p>
                                <ul>
                                  {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className='col-12'>
                              <Button
                                color='dark'
                               // isLight
                               // icon='Delete'
                                onClick={() => {
                                  setEditItem({
                                    ...editItem,
                                    image: undefined,
                                  });
                                }}>
                                Delete Image
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
             
            </div>
          </div>
        </Page>
        <div className="card h-100 mt-4 "
             style={{ 
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(13, 89, 219, 0.2)',
                transition: 'box-shadow 0.3s ease',
                padding:  '7px', // Space between image and shadow
              }}
              //onMouseEnter={() => setHoveredCard(image.ID)}
              //onMouseLeave={() => setHoveredCard(null)}
              //onClick={() => handleImageClick(image.productSlug, image.productId)}
              //onClick={() => handleImageClick(image.product)}
            
            >

              <div className='mt-4 mb-4 row ms-md-2 p-1 g-1'>
                    <div className='col-12 ms-2 ms-md-2 col-md-3 text-center ps-md-2'>
                        Copyright © 2025 - iShopPro - Version 4.4.2
                    </div>
                    <div className='col-12 col-md-4 text-start text-md-end pe-md-2'>
                        Talodu - Your online super market
                    </div>
                    <div className='col-12 col-md-4 text-start text-md-end pe-md-1'>
                        Talodu - Votre supermarché en Ligne
                    </div>
                </div>
            
            </div>
        
      </PageWrapper>
    </>
  );
};

export default ProductDetailNext;

// --- IMPORTANT: ADD getServerSideProps HERE ---
export const getServerSideProps: GetServerSideProps<ProductDetailNextProps> = async (context) => {
  const { id } = context.query;
  const productId = Array.isArray(id) ? id[id.length - 1] : id?.toString().split('-').pop();

  if (!productId) {
    return {
      notFound: true, // Return 404 if no ID is present
    };
  }

  try {
    const API_URL = process.env.API_BASE_URL || "http://127.0.0.1:8888"; // Use environment variable
    const response = await axios.get<{ product: Product; shop: Shop }>(
      `${API_URL}/products/${productId}`,
    );
    const productData = response.data.product;

    if (!productData) {
      return {
        notFound: true, // Product not found
      };
    }

    return {
      props: {
        product: productData,
      },
    };
  } catch (err) {
    console.error(`Error fetching product in getServerSideProps for ID ${productId}:`, err);
    // You can choose to show an error page, redirect, or pass null
    return {
      props: {
        product: null,
        error: 'Failed to load product details.',
      },
    };
  }
};



