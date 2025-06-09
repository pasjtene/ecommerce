// app/product/[id]/page.tsx
'use client'; // Mark this as a Client Component since we use hooks and browser APIs

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import useDarkMode from '../../../src/hooks/useDarkMode';
import { Product, ProductImage, Shop } from '../../../src/pages/presentation/auth/types';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import HeaderNext from '../../../src/pages/_layout/_headers/HeaderNext';

// Dynamic import for client-only components
import dynamic from 'next/dynamic';
const DynamicProductImageGallery = dynamic(
  () => import('../../../src/pages/presentation/sales/ProductImageGallery'),
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

interface ProductDetailNextProps {
  product: Product | null;
  error?: string;
}

interface ProductDetailsClientProps {
  initialProduct: Product; // Pass the fetched product from the Server Component
}

const ProductDetailNext = ({ initialProduct }: ProductDetailsClientProps) => { 
  const { darkModeStatus } = useDarkMode();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [images, setImages] = useState<ProductImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  //const [currentProduct, setCurrentProduct] = useState<Product | null>(product);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //const displayError = propError || clientError;

   // Add useEffect to fetch product data
   useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = id?.toString().split('-').pop();
        if (!productId) {
          setError('Product ID not found in URL.');
          setLoading(false);
          return;
        }

        const API_URL = "/api";
        const response = await axios.get<{ product: Product }>(
            `${API_URL}/products/${productId}`
          );
          setCurrentProduct(response.data.product);
          setError(null);
        } catch (err) {
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.error || err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred while fetching product');
        }
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const API_URL = "/api"
        const productId = id?.toString().split('-').pop();
        if (!productId) {
          setClientError('Product ID not found in URL.');
          return;
        }

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

    if (currentProduct) {
        fetchImages();
    }
  }, [id, refresh, currentProduct]);

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
      const API_URL = "/api"
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
    name: currentProduct?.name || '',
    price: currentProduct?.price || 0,
    stock: currentProduct?.stock || 0,
    category:  '',
  });

  const formik = useFormik({
    initialValues: {
      name: currentProduct?.name || '',
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
    },
  });

  useEffect(() => {
    if (currentProduct) {
      formik.setValues({
        name: currentProduct.name,
        price: currentProduct.price,
        stock: currentProduct.stock,
        category: '',
      });
      setEditItem({
        name: currentProduct.name,
        price: currentProduct.price,
        stock: currentProduct.stock,
        category: '',
      });
    }
  }, [currentProduct]);

  if (loading) return <div>Loading product details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentProduct) return <div>Product not found</div>;

  return (
    <>
      <div>
        <HeaderNext/>
        {loading ? (
            <div>Loading product details...</div>
        ) : error ? (
            <div>Error: {error}</div>
        ) : !currentProduct ? (
            <div>Product not found</div>
        ) : (
            <>
        <div className='row'>
          <div className='col-md-6 col-lg-6 col-sm-6'>
            <Button color='info' onClick={() => router.back()}>
              Retour a la Liste
            </Button>
          </div>
          <div className='col-lg-6 col-md-6 col-sm-6'>
            <span className='text-muted fst-italic me-2'>Last update:</span>
            <span className='fw-bold'>13 hours ago</span>
          </div>
        </div>

        <Page>
          <a className='text-decoration-none display-6 py-3 text-danger' style={{ cursor: 'pointer' }}>
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
        )}
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

export default ProductDetailNext;

  




