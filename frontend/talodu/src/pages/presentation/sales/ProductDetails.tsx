import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation} from 'react-router-dom';
import { useFormik } from 'formik';
import { ApexOptions } from 'apexcharts';
import Page from '../../../layout/Page/Page';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
    SubHeaderLeft,
    SubHeaderRight,
    SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Button from '../../../components/bootstrap/Button';
import { demoPagesMenu } from '../../../menu';
import tableData from '../../../common/data/dummyProductData';
import Avatar from '../../../components/Avatar';
import USERS from '../../../common/data/userDummyData';
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
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import showNotification from '../../../components/extras/showNotification';
import useDarkMode from '../../../hooks/useDarkMode';
import { User, Product, ProductImage, Shop} from '../auth/types';
import axios  from 'axios';
import { API_IMAGES, API_BASE_URL } from '../auth/api'
import ProductImageGallery from './ProductImageGallery'
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { toast } from 'react-toastify';

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

interface LocationState {
    product?: Product;
  }

const ProductDetails = () => {
    const { darkModeStatus } = useDarkMode();
    const [images, setImages] = useState<ProductImage[]>([])

    const { state } = useLocation();
    const navigate = useNavigate();
    //const product = state?.product as Product | undefined;

    const { id } = useParams<{ id: string }>();
    const { slug } = useParams<{ slug: string }>();
   // const navigate = useNavigate();
   const location = useLocation();

    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    //const [error, setError] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    //const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch images
    useEffect(() => {
        const fetchImages = async () => {
          try {
            const stateProduct = state?.product;
            const productId = product?.Slug?.split('-').pop();
            const prodid = id?.split('-').pop();
            const response = await axios.get<{ images: ProductImage[] }>(
              API_BASE_URL+`/images/product/${prodid}`

            );
            setImages(response.data.images);
            setError(null);
          } catch (err) {
            if (axios.isAxiosError(err)) {
                // Handle Axios errors (response errors, network errors, etc.)
                setError(err.response?.data?.error || err.message);
              } else if (err instanceof Error) {
                // Handle other Error types
                setError(err.message);
              } else {
                // Handle cases where it's not an Error
                setError('An unknown error occurred');
              }
            }
          };
        
          fetchImages();
        }, [product?.ID, refresh]);


        useEffect(() => {
            // Check if product was passed in state
            const state = location.state as LocationState;
             const stateProduct = state?.product;
            if (stateProduct) {
            // if (stateProduct && stateProduct.Slug === slug) {
            console.log("The product is: ",stateProduct)
              setProduct(stateProduct);
              

              setLoading(false);
            } else {
                const productId = slug?.split('-').pop();
                const prodid = id?.split('-').pop();
                if (!prodid) {
                setError('Invalid product URL');
                return;
                }
              // Fetch product if not in state
              //fetchProduct();
              fetchProduct(prodid);
              
            }
          }, [id, location.state, slug]);

          useEffect(() => {
            // Check if product was passed in state
                const state = location.state as LocationState;
             const stateProduct = state?.product;
            // fetchShop(state?.product?.ShopID)
            if (stateProduct) {
            // if (stateProduct && stateProduct.Slug === slug) {
            console.log("The product is: ",stateProduct)
              setProduct(stateProduct);
        
            }
          }, []);



          const fetchProduct = async (id: string) => {
            try {
              setLoading(true);
              const response = await axios.get<{product:Product, shop:Shop}>(
                API_BASE_URL+`/products/${id}`
              );
              console.log("The product fetched response is: ",response.data)
              console.log("The shop fetched response is: ",response.data.shop)
             // setShop(response.data.shop);
              setProduct(response.data.product);
              setError(null);
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
            console.log("The files: ",files);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0 || !product?.ID) return;
    
        setUploading(true);
        const formData = new FormData();
        
        // For multiple files
        files.forEach((file) => {
          formData.append('images', file);
        });

    try {
        const response = await axios.post(
          API_BASE_URL+`/images/product/${product?.ID}/batch`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                }
            },
          }
        );
  
        alert('Images uploaded successfully!');
        //console.log(response.data);
        // Update the images state with the new images
        setImages(prevImages => [...prevImages, ...response.data.images]);
        setFiles([]);
      } catch (error) {
        console.error('Upload failed:', error);
        
         if (axios.isAxiosError(error)) {
                    // The error has a response from the server
                    alert('Upload failed. Please try again.'+error.response?.statusText);
                    if (error.response) {
                        toast.error(`Failed to create product: ${error.response.data.error || error.message}`);
                    } 
                }
            //    alert('Upload failed. Please try again.');

      } finally {
        setUploading(false);
        setProgress(0);
      }
    };

    // @ts-ignore
    const itemData = tableData.filter((item) => item.id.toString() === id.toString());
    const data = itemData[0];

  
    const TABS: ITabs = {
        SUMMARY: 'Summary',
        COMMENTS: 'Comments',
        EDIT: 'Edit',
    };
    const [activeTab, setActiveTab] = useState(TABS.SUMMARY);

    const [editItem, setEditItem] = useState<IValues>(data);
    const formik = useFormik({
        initialValues: {
            name: '',
            price: 0,
            stock: 0,
            category: '',
        },
        validate,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        if (editItem) {
            formik.setValues({
                name: editItem.name,
                price: editItem.price,
                stock: editItem.stock,
                category: editItem.category,
            });
        }
        return () => {
            formik.setValues({
                name: '',
                price: 0,
                stock: 0,
                category: '',
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editItem]);

    if (loading) return <div>Loading product details...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <>
         <Helmet>
                <title>{product.name} | Otantic Packaging</title>
                <meta name="description" content={product.description} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.description} />
                
                <meta property="og:url" content={`https://yourstore.com/products/${product.Slug}`} />
                <link rel="canonical" href={`https://yourstore.com/products/${product.Slug}`} />
            </Helmet>
         
            {/**
             * <PageWrapper title={demoPagesMenu.sales.subMenu.product.text}>
             */}
            <PageWrapper title={product.name} description={product.description} >
            
            <SubHeader>
                <SubHeaderLeft>
                    <Button color='info' isLink icon='ArrowBack' onClick={() => navigate(-1)}>
                        Back to List
                    </Button>
                    <SubheaderSeparator />
                    <Avatar
                        srcSet={USERS.RYAN.srcSet}
                        src={USERS.RYAN.src}
                        size={32}
                        color={USERS.RYAN.color}
                    />
                    <span>
                        <strong>{`${USERS.RYAN.name} ${USERS.RYAN.surname}`}</strong>
                    </span>
                    <span className='text-muted'>Owner</span>
                </SubHeaderLeft>
                <SubHeaderRight>
                    <span className='text-muted fst-italic me-2'>Last update:</span>
                    <span className='fw-bold'>13 hours ago</span>
                </SubHeaderRight>
            </SubHeader>
            <Page>
                <a 
                    href="#"  // Replace with your actual link
                    className='text-decoration-none display-6 py-3 text-danger'
                    style={{
                        cursor: 'pointer',
                        
                    }}
                    >
                    By {product?.shop.name}
                    </a>
                <div className='display-4 fw-bold py-3'> {product?.name}</div>

                <div className="container py-4">
                {images?.length > 0 ? (
                    <ProductImageGallery images={images} product={product} />
                ):(<div>No images</div>)}
                </div>



        {/** Image galery */}
        <div className="mt-4">
        <h5 className="mb-3">Current Images</h5>
            {images?.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
                {images.map((image) => (
                  <div key={image.ID} className="col">
                    <div className="card h-100 shadow-sm">
                      <img 
                        src={image.url} 
                        alt={image.altText || 'Product image'} 
                        className="card-img-top img-thumbnail"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <h6 className="card-title text-truncate">
                          {image.url.split('/').pop()}
                        </h6>
                        {image.altText && (
                          <p className="card-text text-muted small">
                            {image.altText}
                          </p>
                        )}
                      </div>
                      <div className="card-footer bg-white">
                        <div className="d-flex justify-content-between">
                          <button className="btn btn-sm btn-outline-primary">
                            Set as Primary
                          </button>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                No images available for this product
              </div>
            )}
          </div>

    {/**  End Image galery */}



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
                                    <CardBody >
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
                                                                disabled={uploading || files.length === 0}
                                                            >
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
                                                                    isLight
                                                                    icon='Delete'
                                                                    onClick={() => {
                                                                        setEditItem({
                                                                            ...editItem,
                                                                            image: undefined,
                                                                        });
                                                                    }}>
                                                                    Delete Image
                                                                </Button>
                                                            </div>
                                                             {/** Image galery */}
                                                            
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
                                                icon='Save'
                                                type='submit'
                                                isDisable={!formik.isValid && !!formik.submitCount}>
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

export default ProductDetails;