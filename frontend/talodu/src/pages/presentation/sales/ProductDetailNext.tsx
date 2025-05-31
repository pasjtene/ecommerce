// components/ProductDetailNext.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
//import Button from '../../../components/bootstrap/Button';
import Card, {
  CardBody,
  CardFooter,
  CardFooterLeft,
  CardFooterRight,
  CardHeader,
  CardLabel,
  CardSubTitle,
  CardTitle,
} from '../../../components/bootstrap/Card';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import showNotification from '../../../components/extras/showNotification';
import useDarkMode from '../../../hooks/useDarkMode';
import { Product, ProductImage, Shop } from '../auth/types';
import axios from 'axios';
import { API_BASE_URL } from '../auth/api';
import ProductImageGallery from './ProductImageGallery';
import { toast } from 'react-toastify';
import Head from 'next/head';
import Button from 'react-bootstrap/Button';

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
  product?: Product; // 'product' is the prop name, and it's of type 'Product' (which you already defined). The '?' makes it optional.
}

const ProductDetailNext = ({ product: initialProduct }: ProductDetailNextProps) => {
  const { darkModeStatus } = useDarkMode();
  const router = useRouter();
  const { id } = router.query;
  
  const [images, setImages] = useState<ProductImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [product, setProduct] =  useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        //const API_URL2 = "http://127.0.0.1:8888"
        const API_URL2 = "/api"

        const productId = id?.toString().split('-').pop();
        if (!productId) return;

        console.log("in fetc images..The API base URL is: ",API_BASE_URL)
        
        const response = await axios.get<{ images: ProductImage[] }>(
          `${API_URL2}/images/product/${productId}`,
         // `${API_BASE_URL}/images/product/${productId}`,
        );
        setImages(response.data.images);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchImages();
  }, [id, refresh]);

  useEffect(() => {
   // if (!initialProduct && id) {
      console.log("fetching product");
      fetchProduct(id?.toString().split('-').pop() as string);
   // }
  }, [id, initialProduct]);


  useEffect(() => {
    // Check if product is in router query (from client-side navigation)
    if (router.query.product) {
      try {
        setProduct(JSON.parse(router.query.product as string));
      } catch (e) {
        console.error('Error parsing product data', e);
      }
    } else {
      // Fetch product if page is refreshed or accessed directly
      fetchProduct(id?.toString().split('-').pop() as string);
    }
  }, [id, router.query.product]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      //const API_URL2 = "http://127.0.0.1:8888"
      const API_URL2 = "/api"

      const response = await axios.get<{ product: Product; shop: Shop }>(
        `${API_URL2}/products/${productId}`,
        //`${API_BASE_URL}/products/${productId}`,
      );
      setProduct(response.data.product);
      console.log("The product is: ",product);
      setError(null);
      const metaDescription = document.querySelector('meta[name="description"]');
			if (metaDescription) {
				console.log('description found.. setting description', metaDescription);
				metaDescription.setAttribute(
					'content',
					`Buy ${product?.name} - ${product?.description}`,
				);
			}
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !product?.ID) return;

    setUploading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/images/product/${product?.ID}/batch`,
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
        toast.error(`Upload failed: ${error.response?.statusText || error.message}`);
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
    name: product?.name || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    //category: product?.category || '',
    category: '',
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      price: 0,
      stock: 0,
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
    if (product) {
      formik.setValues({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: ''
      });
      setEditItem({
        name: product.name,
        price: product.price,
        stock: product.stock,
        //category: product.category,
        category: '',
      });
    }
  }, [product]);

  if (loading) return <div>Loading product details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <>
      <Head>
        <meta name='description' content={`Buy ${product?.name} - ${product?.description}`} />
        <title>{product.name} | Talodu</title>
      </Head>

      <PageWrapper title={product.name} description={product.description}>
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
            By {product?.shop?.name || 'Unknown Shop'}
          </a>
          <div className='display-4 fw-bold py-3'>{product?.name}</div>

          <div className='container py-4'>
            {images?.length > 0 ? (
              <ProductImageGallery images={images} product={product} />
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
              <Card
                stretch
                className='overflow-hidden'
                tag='form'
                noValidate
                onSubmit={formik.handleSubmit}>
                <CardHeader>
                  <CardLabel icon='Edit' iconColor='success'>
                    <CardTitle tag='div' className='h5'>
                      Edit
                    </CardTitle>
                    <CardSubTitle tag='div' className='h6'>
                      Product Details
                    </CardSubTitle>
                  </CardLabel>
                </CardHeader>
                <CardBody>
                  <Card>
                    <CardHeader>
                      <CardLabel icon='Photo' iconColor='info'>
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
                                //isLight
                                //icon='Delete'
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
                </CardBody>
                <CardFooter>
                  <CardFooterRight>
                    <Button
                      color='info'
                     // icon='Save'
                      type='submit'
                      //isDisable={!formik.isValid && !!formik.submitCount}
                      >
                      Save
                    </Button>
                  </CardFooterRight>
                </CardFooter>
              </Card>
            </div>
          </div>
        </Page>
      </PageWrapper>
    </>
  );
};

export default ProductDetailNext;