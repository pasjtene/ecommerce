// app/[lang]/product/[id]/ProductDetailsClient.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Product, ProductImage, Shop, AppError, ProductTranslation } from '../../types';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../api/LoadingSpinner';
import { useAuth, AuthProvider } from '../../contexts/AuthContextNext';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';

// Dynamic import for client-only components
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const DynamicProductImageGallery = dynamic(() => import('./ProductImageGallery'), { ssr: false });
const ProductAboutsEditor = dynamic(() => import('./ProductAboutsEditor'), { ssr: false });
const ProductAboutSection = dynamic(() => import('./ProductAboutSection'), { ssr: false });
const ProductAboutTranslationsText = dynamic(() => import('./ProductAboutTranslationsText'), {
	ssr: false,
});

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
		price: 'Price',
	},
};

interface ProductDetailsClientProps {
	initialProduct: Product;
	shop: Shop;
}

const ProductDetailsClient = ({ initialProduct, shop }: ProductDetailsClientProps) => {
	//const { darkModeStatus } = useDarkMode();
	const { currency, currencyRate, currencySymbol, formatPrice } = useCurrency();
	const { addToCart } = useCart();
	const token = localStorage.getItem('j_auth_token');
	const router = useRouter();
	const params = useParams();
	const [t, setDictionary] = useState<Dictionary>(defaultDictionary);
	const [images, setImages] = useState<ProductImage[]>([]);
	const [refresh, setRefresh] = useState(false);
	const [currentProduct, setCurrentProduct] = useState<Product>(initialProduct);
	const [clientError, setClientError] = useState<string | null>(null);
	// Initialize with initialProduct
	const [loading, setLoading] = useState(false);
	const { user, isShopOwner, hasRole, hasAnyRole } = useAuth();
	const [enableEdit, setEnableEdit] = useState<boolean>(false);
	const [isTranslating, setIsTranslating] = useState(false);
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

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
		console.log('The products abouts is: ', initialProduct.abouts);
		console.log('The products is: ', initialProduct);

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

	// Toggle product selection
	const toggleEnableEdit = () => {
		setEnableEdit(!enableEdit);
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	const handleShopNameClick = (shop: Shop) => {
		console.log('The shop is:', shop);
		if (shop.Slug) {
			router.push(`/${params.lang}/shop/products/${shop.Slug}`);
		} else {
			router.push(`/${params.lang}/shop/products/${shop.ID}`);
		}
	};

	if (!t) return <LoadingSpinner />;

	// This component assumes it receives a valid `initialProduct`.

	return (
		<>
			<div className='container py-4'>
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
									<div>
										<a
											className='text-decoration-none py-3 ms-3 text-success'
											onClick={() => {
												router.push(`/${params.lang}/product/${initialProduct.ID}/translations`);
											}}
											style={{ cursor: 'pointer' }}>
											Add translations
										</a>

										<a
											className='text-decoration-none py-3 ms-3 text-success'
											onClick={() => {
												router.push(`/${params.lang}/product/${initialProduct.ID}/edit`);
											}}
											style={{ cursor: 'pointer' }}>
											Edit product
										</a>

										<a
											className='text-decoration-none py-3 ms-3 text-success'
											onClick={() => {
												router.push(`/${params.lang}/product/${initialProduct.ID}/images`);
											}}
											style={{ cursor: 'pointer' }}>
											Images
										</a>

										<a
											className='text-decoration-none py-3 ms-3 text-success'
											onClick={() => {
												router.push(`/${params.lang}/product/${initialProduct.ID}/abouts`);
											}}
											style={{ cursor: 'pointer' }}>
											More details
										</a>
									</div>
								)}

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
											languages={['en', 'fr', 'es']}
										/>
									) : (
										<></>
									)}
								</div>
							</div>
						)}

						<div className='row'>
							{/* Main Image Display Area - Left Side */}
							<div className='col-lg-6 col-md-12'>
								<div className='container py-4 border border-secondary'>
									<div>
										<button
											onClick={() => handleAddToCart(currentProduct)}
											className='btn btn-danger'>
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

							{/*Product about details */}

							<div className='col-lg-3 col-md-6'>
								<h3 className='text-xl font-bold mb-4'>{currentProduct.name}</h3>
								<div>
									{currentProduct.abouts.length > 0 ? (
										<ProductAboutSection abouts={currentProduct.abouts} />
									) : (
										<div>No addition details about this product</div>
									)}
								</div>
								<div></div>
							</div>

							<div className='col-lg-3 col-md-6'>
								{/* add product to card, fists section */}
								<div className='card-body'>
									<h4 className='card-title'> {formatPrice(currentProduct.price)} </h4>

									<>
										<div className='mb-3'>
											<h6>Product Information</h6>
											<p className='text-muted small mb-1'>Livraison: gratuite</p>
											<p className='small'>Expédition: 2500 fcfa</p>
										</div>

										<hr />

										<div className='mb-3'>
											<h6>{t?.product.price}</h6>
											{currentProduct.price ? (
												<h5 className='text-primary'> {formatPrice(currentProduct.price)}</h5>
											) : (
												<p className='text-muted'>Le prix du produit n'est pas disponible</p>
											)}
										</div>

										<div className='mb-3'>
											<h6>Stock</h6>
											{currentProduct.stock ? (
												<h5 className='text-primary'>
													En Stock: {currentProduct.stock} disponible
												</h5>
											) : (
												<p className='text-muted'>Ce produit n'est pas disponible</p>
											)}
										</div>

										{currentProduct.price ? (
											<div className='mb-3'>
												<h6>Pricing</h6>
												<h5 className='text-primary'> {formatPrice(currentProduct.price)}</h5>
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
