// app/product/[id]/ProductDetailsClient.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import Page from '../../../src/layout/Page/Page';
import Card, {
  CardBody,
  CardHeader,
  CardLabel,
  CardSubTitle,
  CardTitle,
} from '../../../src/components/bootstrap/Card';
import Icon from '../../../src/components/icon/Icon';
import Input from '../../../src/components/bootstrap/forms/Input';
import showNotification from '../../../src/components/extras/showNotification';
import { Product, ProductImage, Shop } from '../../types'; 
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';

// Dynamic import for client-only components
import dynamic from 'next/dynamic';

const DynamicProductImageGallery = dynamic(
  () => import('./ProductImageGallery'),
  { ssr: false }
);

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


interface ProductDetailsClientProps {
  initialProduct: Product; // Pass the fetched product from the Server Component
}

const ProductDetailsClient = ({ initialProduct }: ProductDetailsClientProps) => {
  //const { darkModeStatus } = useDarkMode();
  const router = useRouter();

  const [images, setImages] = useState<ProductImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>(initialProduct); // <--- CHANGE IS HERE
  //const [loading, setLoading] = useState(false); // Can be used for *client-side* re-fetches
  const [clientError, setClientError] = useState<string | null>(null); 
   // Initialize with initialProduct
  const [loading, setLoading] = useState(false); // Can be used for *client-side* re-fetches

   useEffect(() => {
    const fetchImages = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
        if (!currentProduct?.ID) {
          setClientError('Product ID not found.'); // Should ideally be handled before this component renders
          return;
        }

        const response = await axios.get<{ images: ProductImage[] }>(
          `${API_URL}/images/product/${currentProduct.ID}`,
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

    if (currentProduct) {
        fetchImages();
    }
  }, [currentProduct, refresh]); // Depend on currentProduct.ID for image fetching

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleShopNameClick = (shop:Shop) => {
    console.log("The shop is:",shop);
    if(shop.Slug) {
      router.push(`/shop/products/${shop.Slug}`);
    } else {
      router.push(`/shop/products/${shop.ID}`);
    }
    
  }

  const handleUpload = async () => {
    if (files.length === 0 || !currentProduct?.ID) return;

    setUploading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
      const response = await axios.post(
        `${API_URL}/images/product/${currentProduct?.ID}/batch`,
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
    name: initialProduct?.name || '',
    price: initialProduct?.price || 0,
    stock: initialProduct?.stock || 0,
    category: '', // Assuming category is handled elsewhere or fetched
  });

  const formik = useFormik({
    initialValues: {
      name: initialProduct?.name || '',
      price: initialProduct?.price || 0,
      stock: initialProduct?.stock || 0,
      category: '', // Assuming category is handled elsewhere or fetched
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
      // You would typically send `values` to an API to update the product
    },
  });

  useEffect(() => {
    // Update formik and editItem values if initialProduct changes (e.g., if re-fetched)
    if (initialProduct) {
      formik.setValues({
        name: initialProduct.name,
        price: initialProduct.price,
        stock: initialProduct.stock,
        category: '', // Update if category is part of Product type
      });
      setEditItem({
        name: initialProduct.name,
        price: initialProduct.price,
        stock: initialProduct.stock,
        category: '', // Update if category is part of Product type
      });
    }
  }, [initialProduct]); // Depend on initialProduct

  // No loading/error states for the *initial* product here, as that's handled by the Server Component
  // This component assumes it receives a valid `initialProduct`.

  return (
    <>
      <div>
        
        {/* Removed redundant loading/error checks, assuming initialProduct is valid */}
        <>
            <div className='row'>

            <div className='col-md-4 col-6 ms-4 mt-2'>
                <button

                    className="bg-transparent border-0 p-0 text-primary"
                    style={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                    e.currentTarget.style.color = '#bd2130'; // darker red
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                        e.currentTarget.style.color = '#dc3545'; // original red
                      }}
                        
                        //color='warning'
                        //className="btn btn-warning me-2 mb-2"
                        //isLight
                        onClick={() => router.back()}>
                        Retour a la Liste
                    </button>
                </div>


              <div className='col-lg-6 col-md-6 col-sm-6'>
                <span className='text-muted fst-italic me-2'>Last update:</span>
                <span className='fw-bold'>13 hours ago</span> {/* This needs to be dynamic */}
              </div>
            </div>

            <Page>
              <a className='text-decoration-none display-6 py-3 text-danger'
              onClick={()=>{handleShopNameClick(currentProduct?.shop)}} 
              style={{ cursor: 'pointer' }}>
                By {currentProduct?.shop?.name || 'Unknown Shop'}
              </a>
              <div className='display-4 fw-bold py-3'>{currentProduct?.name}</div>

               
                <div className='container py-4'>
                {images?.length > 0 ? (
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
            </>
        
        <div className="card h-100 mt-4 "
             style={{
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(13, 89, 219, 0.2)',
                transition: 'box-shadow 0.3s ease',
                padding:  '7px',
              }}
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
      </div>
    </>
  );
};

export default ProductDetailsClient;