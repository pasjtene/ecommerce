//app/[lang]/product/[id]/edit/ProductEditComponent.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { Product, Shop, ProductCategory, ProductImage, AppError } from '../../../types'
import axios from 'axios';
import { useParams } from 'next/navigation';
import LoadingSpinner from '../../../../api/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContextNext';
import ConfirmDelete from '../ConfirmDeleteImages';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../../src/components/bootstrap/Card';
import Input from '../../../../../src/components/bootstrap/forms/Input';
import ErrorModal from '../../../utils/ErrorModal';

interface ProductEditProps {
  product: Product;
  onSave: (product: Product) => Promise<void>;
  onCancel: () => void;
}

interface Dictionary {
  product_edit: {
    edit_product: string;
    price: string;
    name: string;
    stock: string;
    description: string;
    shop: string;
    categories: string;
    cancel: string;
    save_changes: string;
    saving: string;
    fetch_error: string;
  };
}

const defaultDictionary: Dictionary = {
  product_edit: {
    edit_product: 'Edit product',
    price: "Price",
    name: "Name",
    stock: "Stock",
    description: "Description",
    shop: "Shop",
    categories: "Categories",
    cancel: "Cancel",
    save_changes: "Save Changes",
    saving: "Saving...",
    fetch_error: "Error loading data"
  },
};

const ProductImages = ({ product, onSave, onCancel }: ProductEditProps) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const params = useParams();
  const [translation, setDictionary] = useState<Dictionary>(defaultDictionary);
  const [editedProduct, setEditedProduct] = useState<Product>({ 
    ...product,
    categories: product.categories || [],
    shop: product.shop || { ID: 0, name: '' }
  });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
   const [token, setToken] = useState<string | null>(null);
   const { user, isShopOwner, hasRole, hasAnyRole } = useAuth();
   const [selectedImages, setSelectedImages] = useState<string[]>([]);
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [files, setFiles] = useState<File[]>([]);
   //const [images, setImages] = useState<ProductImage[]>([]);
   const [images, setImages] = useState<ProductImage[]>(product.images);
   const [uploading, setUploading] = useState(false);
   const [progress, setProgress] = useState(0);
   const [apiError, setApiError] = useState<AppError>();
   const [showErrorModal, setShowErrorModal] = useState(false);
   const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';


   const handleDeleteError = (error: AppError) => {
		setApiError(error);
		setShowErrorModal(true);
	};
  

  useEffect(() => {
    // Only access localStorage on client side
    setToken(localStorage.getItem('j_auth_token'));
  }, []);

 

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await import(`../../../translations/${params.lang}.json`);
        setDictionary(dict.default);
      } catch (error) {
        console.error('Error loading translations:', error);
      }
    };
    loadDictionary();
  }, [params.lang]);

  const handleDeleteImages = async (imageIds: string[]) => {
		try {
			setImages((prev) => prev.filter((i) => !imageIds.includes(i.ID)));
			setSelectedImages([]);
		} catch (error) {
			//toast.error('Failed to delete products');
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
            //product.images.push(response.data.images)
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


  // Toggle product selection
	const toggleImageSelection = (imageId: string) => {
		setSelectedImages((prev) =>
			prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId],
		);
	};


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFiles(Array.from(e.target.files));
		}
	};

 

  if (!translation) {
    return <LoadingSpinner />;
  }

  return (

    <div>
        {(isShopOwner(product.shop) || hasAnyRole(['SuperAdmin', 'Admin'])) && (
            <div className='row h-100 mt-5'>

                  <div className='col-lg-8 mt-4 mb-4'>
                    <Card>
                        <CardHeader>
                            <CardLabel>
                                <CardTitle>Add Product Image</CardTitle>
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
                                        
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className='mt-4'>
                    <h5 className='mb-3'>Current Images</h5>
                    <div className='d-flex justify-content-between align-items-center mb-3'>
                        <div>
                            {selectedImages.length > 0 && (
                                <button
                                    //onClick={() => handleDeleteImages(selectedImages)}
                                    onClick={() => {
                                        setShowConfirmModal(true);
                                    }}
                                    className='btn btn-danger me-2'>
                                    Delete {selectedImages.length} selected
                                </button>
                            )}
                        </div>
                        <div>
                            <span className='text-muted'>
                                {selectedImages.length} of {images.length} selected
                            </span>
                        </div>
                    </div>
                    {images?.length > 0 ? (
                        <div className='row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4'>
                            {images.map((image) => (
                                <div key={image.ID} className='col'>
                                    <div className='card h-100 shadow-sm'>
                                        <img
                                            src={API_URL + image.url}
                                            alt={image.altText || 'Product image'}
                                            className='card-img-top img-thumbnail'
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className='card-body'>
                                            <h6 className='card-title text-truncate'>
                                                {image.url.split('/').pop()}
                                            </h6>
                                            {image.altText && (
                                                <p className='card-text text-muted small'>{image.altText}</p>
                                            )}
                                        </div>
                                        <div className='card-footer bg-white'>
                                            <div className='d-flex justify-content-between'>
                                                <button className='btn btn-sm btn-outline-primary'>
                                                    Set as Primary
                                                </button>
                                                <small className='text-danger'>delete image</small>
                                                <input
                                                    type='checkbox'
                                                    checked={selectedImages.includes(image.ID)}
                                                    //onChange={() => toggleImageSelection(image.ID)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleImageSelection(image.ID);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className='form-check-input'
                                                />
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

              
            </div>
        )}

        {(!isShopOwner(product.shop) && !hasAnyRole(['SuperAdmin', 'Admin'])) && (
            <div>
                You are not authorized to view this page
            </div>)}


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
  );
};

export default ProductImages;