// app/product/[id]/ProductDetailsClient.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
//import Page from '../../../src/layout/Page/Page';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../../../src/components/bootstrap/Card';

import Icon from '../../../../src/components/icon/Icon';
import Input from '../../../../src/components/bootstrap/forms/Input';
import showNotification from '../../../../src/components/extras/showNotification';
import { Product, ProductImage, Shop, AppError, ProductTranslation } from '../../types';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import LoadingSpinner from '../../../api/LoadingSpinner';
import { useAuth, AuthProvider } from '../../contexts/AuthContextNext';
import ConfirmDelete from './ConfirmDeleteImages';
import ErrorModal from '../../utils/ErrorModal';
import { useCart } from '../../contexts/CartContext';

// Dynamic import for client-only components
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

interface Dictionary {
	product: {
		back_to_list: string;
		by_shop: string;
		no_images: string;
		edit_as: string;
		shop_owner: string;
		admin: string;
		super_admin: string;
	};
}
const ProductEditComponent = dynamic(() => import('./ProductEditComponent'), { ssr: false });
const DynamicProductImageGallery = dynamic(() => import('./ProductImageGallery'), { ssr: false });
const ProductTranslationForm = dynamic(() => import('./ProductTranslationForm'), { ssr: false });

const ProductAboutsEditor = dynamic(() => import('./ProductAboutsEditor'), { ssr: false });
const ProductAboutSection = dynamic(() => import('./ProductAboutSection'), { ssr: false });
const ProductAboutTranslationsText = dynamic(() => import('./ProductAboutTranslationsText'), { ssr: false });

interface IValues {
	name: string;
	price: number;
	stock: number;
	category: string;
	image?: string;
}

// Initialize with default values
const defaultDictionary: Dictionary = {
	product: {
		back_to_list: 'Back to List',
		by_shop: 'By {shopName}',
		no_images: 'No images available',
		edit_as: 'Edit as:',
		shop_owner: 'Shop Owner',
		admin: 'Admin',
		super_admin: 'Super Admin',
	},
};

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
	initialProduct: Product;
	shop: Shop;
}

const ProductDetailsClient = ({ initialProduct, shop }: ProductDetailsClientProps) => {
	//const { darkModeStatus } = useDarkMode();
	const { addToCart } = useCart();
	const token = localStorage.getItem('j_auth_token');
	const router = useRouter();
	const params = useParams();
	const [isEditing, setIsEditing] = useState(false);
	//const [t, setDictionary] = useState<Dictionary | null>(null);
	const [t, setDictionary] = useState<Dictionary>(defaultDictionary);
	const [images, setImages] = useState<ProductImage[]>([]);
	const [files, setFiles] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [refresh, setRefresh] = useState(false);
	const [currentProduct, setCurrentProduct] = useState<Product>(initialProduct); // <--- CHANGE IS HERE
	const [clientError, setClientError] = useState<string | null>(null);
	// Initialize with initialProduct
	const [loading, setLoading] = useState(false);
	const { user, isShopOwner, hasRole, hasAnyRole } = useAuth();
	const [selectedImages, setSelectedImages] = useState<string[]>([]);
	const [enableEdit, setEnableEdit] = useState<boolean>(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [apiError, setApiError] = useState<AppError>();
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [isTranslating, setIsTranslating] = useState(false);
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

	const [currentProductTranslation, setCurrentProductTranslation] = useState<ProductTranslation>({
		ID: 0,
		PoductID: initialProduct.ID,
		language: '',
		name: '',
		description: '',
	});

	const handleDeleteError = (error: AppError) => {
		setApiError(error);
		setShowErrorModal(true);
	};

	

	const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

	// Load translations
	useEffect(() => {
		const loadDictionary = async () => {
			const dict = await import(`../../translations/${params.lang}.json`);
			setDictionary(dict.default);
		};
		loadDictionary();
	}, [params.lang]);

	// Apply translations to product data
	useEffect(() => {
		console.log("The products abouts is: ", initialProduct.abouts);
		console.log("The products is: ", initialProduct);
		
		//console.log("The language is: ",params.lang);
		if (initialProduct.translations) {
			const translation = initialProduct.translations.find((t: any) => t.language === params.lang);
			if (translation) {
				setCurrentProduct({
					...initialProduct,
					name: translation.name || initialProduct.name,
					description: translation.description || initialProduct.description,
				});
			}
		}
	}, [initialProduct, params.lang]);

	const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
	useEffect(() => {
		const fetchImages = async () => {
			try {
				const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
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

	// Toggle product selection
	const toggleImageSelection = (imageId: string) => {
		setSelectedImages((prev) =>
			prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId],
		);
	};

	// Toggle product selection
	const toggleEnableEdit = () => {
		setEnableEdit(!enableEdit);
	};


	const handleSave = async (updatedProduct: Product) => {
		console.log('The prduct to update: ', updatedProduct);
		setLoading(true);
		try {
			const response = await axios.put(API_BASE_URL + `/products/${currentProduct.ID}`, updatedProduct);
			setCurrentProduct(response.data.product);
			setLoading(false);
			router.push(`/product/${response.data.product.Slug}`);
			setIsEditing(false);
			// Show success toast
			toast.success(`Product updated savedsuccessfully`);
		} catch (error) {
			toast.error('Failed to update products');
			console.log(error);
			// Show error toast
		}
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	const handleSaveTranslation = async (updatedProductTranslation: ProductTranslation) => {
		console.log('The prduct to update: ', updatedProductTranslation);
		setLoading(true);
		try {
			const response = await axios.post(
				API_BASE_URL + `/products/translate/${initialProduct.ID}`,
				updatedProductTranslation,
				
				{
					headers: { 
					'Content-Type': 'application/json', 
					Authorization: `${token}` 
					}
				}
			);
			setLoading(false);
			router.push(`/product/${initialProduct.Slug}`);
			setIsTranslating(false);
			// Show success toast
			toast.success(`Product updated savedsuccessfully`);
		} catch (error) {
			toast.error('Failed to update products');
			//console.log(error);
			// Show error toast
		}
	};

	const handleDeleteImages = async (imageIds: string[]) => {
		try {
			setImages((prev) => prev.filter((i) => !imageIds.includes(i.ID)));
			setSelectedImages([]);
		} catch (error) {
			//toast.error('Failed to delete products');
		}
	};

	const handleShopNameClick = (shop: Shop) => {
		console.log('The shop is:', shop);
		if (shop.Slug) {
			router.push(`/shop/products/${shop.Slug}`);
		} else {
			router.push(`/shop/products/${shop.ID}`);
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
			const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
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

	if (!t) return <div>Loading...</div>;

	// No loading/error states for the *initial* product here, as that's handled by the Server Component
	// This component assumes it receives a valid `initialProduct`.

	return (
		<>
			<div className="container py-4">
				{/* Removed redundant loading/error checks, assuming initialProduct is valid */}
				<>
					<div className='row'>
						<div className='col-md-6 col-6 ms-4 mt-2'>
							<button
								className='bg-transparent border-0 p-0 text-primary'
								style={{
									cursor: 'pointer',
									textDecoration: 'none',
									transition: 'all 0.2s ease',
								}}
								onMouseOver={(e) => {
									e.currentTarget.style.textDecoration = 'underline';
									e.currentTarget.style.color = '#bd2130'; // darker red
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.textDecoration = 'none';
									e.currentTarget.style.color = '#dc3545'; // original red
								}}
								onClick={() => router.back()}>
								{t?.product.back_to_list}
							</button>
						</div>

						{(isShopOwner(shop) || hasAnyRole(['SuperAdmin', 'Admin'])) && (
							<div className='col-md-6 col-12 col-sm-12 col-lg-6 col-xs-12 ms-2 mt-2 mb-2'>
								<span className='text-muted fst-italic me-2'>{t.product.edit_as}:</span>
								{isShopOwner(shop) && (
									<span className='text-muted fst-italic me-2'>{t.product.shop_owner}</span>
								)}
								{hasAnyRole(['Admin']) && (
									<span className='text-muted fst-italic me-2'>{t.product.admin}</span>
								)}
								{hasAnyRole(['SuperAdmin']) && (
									<span className='text-muted fst-italic me-2'>{t.product.super_admin}</span>
								)}

								<input
									type='checkbox'
									checked={enableEdit}
									onChange={(e) => {
										e.stopPropagation();
										toggleEnableEdit();
									}}
									onClick={(e) => e.stopPropagation()}
									className='form-check-input'
								/>
							</div>
						)}
					</div>

					<div className='container mt-4'>
						{isEditing ? (
							<ProductEditComponent
								product={currentProduct}
								onSave={handleSave}
								onCancel={() => setIsEditing(false)}
							/>
						) : (
							<></>
						)}
					</div>

					<div>
						<a
							className='text-decoration-none display-6 py-3 text-danger'
							onClick={() => {
								handleShopNameClick(currentProduct?.shop);
							}}
							style={{ cursor: 'pointer' }}>
							{t.product.by_shop.replace(
								'{shopName}',
								currentProduct?.shop?.name || 'Unknown Shop',
							)}
						</a>
						<div className='display-4 fw-bold py-3'>{currentProduct?.name}</div>

						{(isShopOwner(shop) || hasAnyRole(['SuperAdmin', 'Admin'])) && (
							<div>
								{!isTranslating && (
									<a
										className='text-decoration-none  py-3 ms-3 text-success'
										onClick={() => {
											setIsTranslating(true);
										}}
										style={{ cursor: 'pointer' }}>
										Add translations
									</a>
								)}

								{isTranslating && (
									<a
										className='text-decoration-none  py-3 text-primary mx-3'
										onClick={() => {
											setIsTranslating(false);
										}}
										style={{ cursor: 'pointer' }}>
										Cancel translations
									</a>
								)}

								<div className='container mt-4'>
									{isTranslating ? (
										<ProductTranslationForm
											product={currentProduct}
											onSave={handleSaveTranslation}
											onCancel={() => setIsTranslating(false)}
										/>
									) : (
										<></>
									)}
								</div>

								<div className='container mt-4'>
									{isTranslating ? (
										<ProductAboutsEditor
											productId={currentProduct.ID}
											initialDetails={currentProduct.abouts}
										/>
									) : (
										<></>
									)}
								</div>

								<div className='container mt-4'>
									{isTranslating ? (
										<ProductAboutTranslationsText
											productId={currentProduct.ID}
											abouts={initialProduct.aboutst}
											languages={['en','fr','es']}
										/>
									) : (
										<></>
									)}
								</div>

								
							</div>
						)}

						<div className='row'>
							{/* Main Image Display Area - Left Side */}
							<div className='col-lg-6'>

								<div className='container py-4 border border-danger'>
									<div>
										<button onClick={() => handleAddToCart(currentProduct)} className='btn btn-danger'>
													Add to card
										</button>
									</div>
										{images?.length > 0 ? (
											<DynamicProductImageGallery images={images} product={currentProduct} />
										) : (
											<div>No images</div>
										)}
									</div>
							</div>
							
							<div className='col'>
								
								<h3 className="text-xl font-bold mb-4">{currentProduct.name}</h3>
								<div>
									{currentProduct.abouts.length > 0 ? (
										<ProductAboutSection abouts={currentProduct.abouts} />
									) : (
										<div>No addition details about this product</div>
									)}
								</div>
								<div></div>

							</div>

							<div className='col'>
								{user && (
										<div className='card shadow-sm product-details-card'>
											<div className='card-body'>
												<h4 className='card-title'>Product Details</h4>

												
													<>
														
														<hr />

														<div className='d-grid gap-2'>
															<button onClick={() => setIsEditing(true)} className='btn btn-danger'>
																Edit product
															</button>
															
														</div>
													</>
												
											</div>
										</div>
									)}

									{/* add product to card, fists section */}

									<div className='card-body'>
										<h4 className='card-title'>{currentProduct.price} XAF</h4>

											<>
												<div className='mb-3'>
													<h6>Product Information</h6>
													<p className='text-muted small mb-1'>Livraison: gratuite</p>
													<p className='small'>Expédition: 2500 fcfa</p>
												</div>

												<hr />

												<div className='mb-3'>
													<h6>Prix</h6>
													{currentProduct.price ? (
														<h5 className='text-primary'>{currentProduct.price.toFixed(2)} FCFA</h5>
													) : (
														<p className='text-muted'>Le prix du produit n'est pas disponible</p>
													)}
												</div>

												<div className='mb-3'>
													<h6>Stock</h6>
													{currentProduct.stock ? (
														<h5 className='text-primary'>En Stock: {currentProduct.stock} disponible</h5>
													) : (
														<p className='text-muted'>Ce produit n'est pas disponible</p>
													)}
												</div>

												{currentProduct.price ? (
													<div className='mb-3'>
														<h6>Pricing</h6>
														<h5 className='text-primary'>${currentProduct.price.toFixed(2)}</h5>
													</div>
												) : (
													<p className='text-muted'> </p>
												)}

												<div className='mb-3'>
													<h6>SKU</h6>
													<p className='text-muted small'>{currentProduct.stock || 'Not specified'}</p>
												</div>

												<div className='d-grid gap-2'>
													<button className='btn btn-primary'>Add to Cart</button>
													<button className='btn btn-outline-secondary'>Add to whish list</button>
												</div>
											</>
										
									</div>
									
									{/* End add p to c first section */}
							</div>


						</div>


						{/** if shop owner */}
						{enableEdit && (
							<div>
								{(isShopOwner(shop) || hasAnyRole(['SuperAdmin', 'Admin'])) && (
									<div className='row h-100 mt-5'>
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

										<div className='col-lg-8'>
											<Card>
												<CardHeader>
													<CardLabel>
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
								)}
							</div>
						)}

						{/** end check */}

						<div>
							<ConfirmDelete
								shop={shop}
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
				</>

				<div
					className='card h-100 mt-4 '
					style={{
						border: 'none',
						cursor: 'pointer',
						boxShadow: '0 0 20px rgba(13, 89, 219, 0.2)',
						transition: 'box-shadow 0.3s ease',
						padding: '7px',
					}}>
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
