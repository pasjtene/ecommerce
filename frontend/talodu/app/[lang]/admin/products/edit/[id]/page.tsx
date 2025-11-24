//[lang]/admin/products/[id]/edit/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../../contexts/AuthContextNext';
import Link from 'next/link';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../../../src/components/bootstrap/Card';
import Input from '../../../../../../src/components/bootstrap/forms/Input';
import Button from '../../../../../../src/components/bootstrap/Button';

import ConfirmDelete from './ConfirmDeleteImages';
import ErrorModal from '../../../../utils/ErrorModal';

//import { Product, Shop, ProductCategory, ProductImage, AppError } from '../../../../types'
import {  AppError, Shop } from '../../../../types'

interface Product {
  ID: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  slug: string;
  isFeatured: boolean;
  featuredOrder: number;
  isVisible: boolean;
  shopID: number;
  shop: Shop
  categories: Category[];
  images: ProductImage[];
}

interface Category {
  ID: number;
  name: string;
}



interface ProductImage {
  ID: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  is_visible: boolean;
  created_at?: string;
}

export default function EditProduct() {
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addImage, setAddImage] = useState(false);
  const [error, setError] = useState('');
  const [imageActionLoading, setImageActionLoading] = useState<number | null>(null);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [images, setImages] = useState<ProductImage[]>(product?.images || []);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [apiError, setApiError] = useState<AppError>();
    const [showErrorModal, setShowErrorModal] = useState(false);



  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  useEffect(() => {
    fetchProduct();
    fetchShops();
    fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setProduct(response.data.product);
      setImages(response.data.product.images);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch product');
      } else {
        setError('Failed to fetch product');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shops`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setShops(response.data.shops || []);
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    }
  };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFiles(Array.from(e.target.files));
      }
    };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Image Management Functions
  const handleDeleteError = (error: AppError) => {
          setApiError(error);
          setShowErrorModal(true);
        };
      
        const handleDeleteImages = async (imageIds: string[]) => {
          try {
            setImages((prev) => prev.filter((i) => !imageIds.includes(i.ID.toString())));
            setSelectedImages([]);

            setProduct(prev => prev ? {
        ...prev,
        images: prev.images.filter((i) => !imageIds.map(Number).includes(i.ID))
      } : null);



          } catch (error) {
            // toast.error('Failed to delete products');
          }
        };


  const handleSetPrimary = async (imageId: number) => {
    try {
      setImageActionLoading(imageId);
      await axios.put(
        `${API_BASE_URL}/products/images/${imageId}/primary`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

       

      // Update local state - set all images to non-primary, then set the selected one as primary
      setProduct(prev => prev ? {
        ...prev,
        images: prev.images.map(img => ({
          ...img,
          is_primary: img.ID === imageId
        }))
      } : null);

      //setImages(product?.images|| images);

      alert('Primary image updated successfully');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to set primary image');
      } else {
        setError('Failed to set primary image');
      }
    } finally {
      setImageActionLoading(null);
    }
  };

  const handleToggleVisibility = async (imageId: number) => {
    try {
      setImageActionLoading(imageId);
      const response = await axios.put(
        `${API_BASE_URL}/products/images/${imageId}/visibility`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      // Update local state
      setProduct(prev => prev ? {
        ...prev,
        images: prev.images.map(img => 
          img.ID === imageId 
            ? { ...img, is_visible: response.data.image.isVisible }
            : img
        )
      } : null);

      //setImages(product?.images|| images);

      alert('Image visibility updated');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to update image visibility');
      } else {
        setError('Failed to update image visibility');
      }
    } finally {
      setImageActionLoading(null);
    }
  };

   const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId],
    );
  };

  const handleUpload = async () => {
    if (files.length === 0 || !product?.ID) return;

    setUploading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
      const response = await axios.post(
        `${API_URL}/images/product/${product?.ID}/batch`,
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

       // Update local state
      setProduct(prev => prev ? {
        ...prev,
        images: [...prev.images, ...response.data.images]
      } : null);



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

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;

    try {
      setImageActionLoading(imageId);
      await axios.delete(
        `${API_BASE_URL}/images/product/${imageId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      // Update local state - remove the deleted image
      setProduct(prev => prev ? {
        ...prev,
        images: prev.images.filter(img => img.ID !== imageId)
      } : null);

      alert('Image deleted successfully');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to delete image');
      } else {
        setError('Failed to delete image');
      }
    } finally {
      setImageActionLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      setSaving(true);
      await axios.put(
        `${API_BASE_URL}/products/${productId}`,
        {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          shop_id: product.shopID,
          categories: product.categories,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      alert('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to update product');
      } else {
        setError('Failed to update product');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category: Category) => {
    if (!product) return;

    const isSelected = product.categories.some(cat => cat.ID === category.ID);
    
    if (isSelected) {
      setProduct({
        ...product,
        categories: product.categories.filter(cat => cat.ID !== category.ID)
      });
    } else {
      setProduct({
        ...product,
        categories: [...product.categories, category]
      });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="alert alert-danger" role="alert">
        Product not found
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Edit Product</h1>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => router.push('/admin/products')}
        >
          ← Back to Products
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row">
        {/* Left Column - Product Details */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows={3}
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="price" className="form-label">Price</label>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="stock" className="form-label">Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        id="stock"
                        value={product.stock}
                        onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="shop" className="form-label">Shop</label>
                  <select
                    className="form-select"
                    id="shop"
                    value={product.shopID}
                    onChange={(e) => setProduct({ ...product, shopID: parseInt(e.target.value) })}
                    required
                  >
                    <option value="">Select a shop</option>
                    {shops.map(shop => (
                      <option key={shop.ID} value={shop.ID}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Categories</label>
                  <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {categories.map(category => (
                      <div key={category.ID} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={product.categories.some(cat => cat.ID === category.ID)}
                          onChange={() => handleCategoryToggle(category)}
                          id={`category-${category.ID}`}
                        />
                        <label className="form-check-label" htmlFor={`category-${category.ID}`}>
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={product.isFeatured}
                      onChange={(e) => setProduct({ ...product, isFeatured: e.target.checked })}
                      id="isFeatured"
                    />
                    <label className="form-check-label" htmlFor="isFeatured">
                      Featured Product
                    </label>
                  </div>
                </div>

                {product.isFeatured && (
                  <div className="mb-3">
                    <label htmlFor="featuredOrder" className="form-label">Featured Order</label>
                    <input
                      type="number"
                      className="form-control"
                      id="featuredOrder"
                      value={product.featuredOrder || 0}
                      onChange={(e) => setProduct({ ...product, featuredOrder: parseInt(e.target.value) || 0 })}
                    />
                    <div className="form-text">
                      Lower numbers appear first in featured products list
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={product.isVisible}
                      onChange={(e) => setProduct({ ...product, isVisible: e.target.checked })}
                      id="isVisible"
                    />
                    <label className="form-check-label" htmlFor="isVisible">
                      Product Visible to Customers
                    </label>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Saving...
                      </>
                    ) : (
                      'Update Product'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => router.push('/admin/products')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Image Management */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Product Images {product.images.length}</h5>
              <small className="text-muted">Manage product images and set primary display image</small>
            </div>
            <div className="card-body">
              {images.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No images uploaded yet</p>
                  <Link 
                    href={`/admin/products/${productId}/images`}
                    className="btn btn-primary"
                  >
                    Upload Images
                  </Link>
                </div>
              ) : (
                <div className="row g-3">
                  {product.images.map((image) => (
                    <div key={image.ID} className="col-md-6">
                      <div className={`card ${!image.is_visible ? 'opacity-50' : ''}`}>
                        <div className="position-relative">
                          <img
                            src={API_BASE_URL + image.url}
                            alt={image.alt_text || product.name}
                            className="card-img-top"
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                          {image.is_primary && (
                            <div className="position-absolute top-0 start-0 m-2">
                              <span className="badge bg-primary">Primary</span>
                            </div>
                          )}
                          {!image.is_visible && (
                            <div className="position-absolute top-0 end-0 m-2">
                              <span className="badge bg-secondary">Hidden</span>
                            </div>
                          )}
                        </div>
                        <div className="card-body p-2">
                          <div className="btn-group w-100" role="group">
                            {!image.is_primary && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                disabled={imageActionLoading === image.ID}
                                onClick={() => handleSetPrimary(image.ID)}
                                title="Set as primary"
                              >
                                {imageActionLoading === image.ID ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  '★'
                                )}
                              </button>
                            )}
                            <button
                              className={`btn btn-sm ${
                                image.is_visible ? 'btn-success' : 'btn-outline-secondary'
                              }`}
                              disabled={imageActionLoading === image.ID}
                              onClick={() => handleToggleVisibility(image.ID)}
                              title={image.is_visible ? 'Hide image' : 'Show image'}
                            >
                              {imageActionLoading === image.ID ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : image.is_visible ? (
                                '👁️'
                              ) : (
                                '👁️‍🗨️'
                              )}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              disabled={imageActionLoading === image.ID}
                              //onClick={() => handleDeleteImage(image.ID)}
                              onClick={() => {
                                    setShowConfirmModal(true);
                                    //e.stopPropagation();
                                    toggleImageSelection(image.ID.toString());
                                    }}
                              title="Delete image"
                            >
                              {imageActionLoading === image.ID ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                '🗑️'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {product.images.length > 0 && (
                <div className="mt-3">
                  <Button 
                    href={`/admin/products/${productId}/images`}
                    className="btn btn-outline-primary w-100"
                    onClick={()=> setAddImage(!addImage)}
                  >
                    Upload More Images
                  </Button>
                </div>
              )}

               {addImage && (
               <div className='mt-4'>
            <Card>
              <CardHeader>
                <CardLabel>
                  <CardTitle>Add Product Image</CardTitle>
                </CardLabel>
              </CardHeader>
              <CardBody>
                <div className='row'>
                  <div className='mt-2'>
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
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
               )}




            </div>
          </div>

          {/* Image Upload Instructions */}
          <div className="card mt-3">
            <div className="card-body">
              <h6>Image Guidelines</h6>
              <ul className="small text-muted mb-0">
                <li>Primary image will be used as the main display image</li>
                <li>Hidden images won't be shown to customers</li>
                <li>Only one image can be set as primary at a time</li>
                <li>Recommended size: 800x800 pixels or larger</li>
              </ul>
            </div>
          </div>

               <div>
        <ConfirmDelete
          shop={product.shop}
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onError={handleDeleteError}
          imageIds={selectedImages}
          onImagesDeleted={handleDeleteImages}
        />

        <ErrorModal
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          error={apiError}
        />
      </div>




        </div>
      </div>
    </div>
  );
}