//[lang]/[lang]/[product]/[id]/ProductImageGallery.tsx
//Copy rights Pascal J. Tene, all rights reserved
'use client';
import React, { useState, useRef } from 'react';
//import './ProductImageGallery.css'; // We'll create this CSS file
import { ProductImage, Product } from '../../types';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../../api/LoadingSpinner';
import { useAuth, AuthProvider } from '../../contexts/AuthContextNext';

//const ProductEditComponent = dynamic(() => import('./ProductEditComponent'), { ssr: false });
const ProductAboutSection = dynamic(() => import('./ProductAboutSection'), { ssr: false });

const ProductImageGallery = ({ images, product }: { images: ProductImage[]; product: Product }) => {
	const [selectedImage, setSelectedImage] = useState<ProductImage | null>(images[0] || null);
	const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
	const [isHovering, setIsHovering] = useState(false);
	const imageRef = useRef<HTMLDivElement>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [currentProduct, setCurrentProduct] = useState<Product>(product);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

	//const API_URL2 = "/api" //this should be routed to back end ip address via nginx proxy

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!imageRef.current) return;

		const { left, top, width, height } = imageRef.current.getBoundingClientRect();
		const x = ((e.clientX - left) / width) * 100;
		const y = ((e.clientY - top) / height) * 100;
		setHoverPosition({ x, y });
	};

	const handleSave = async (updatedProduct: Product) => {
		console.log('The prduct to update: ', updatedProduct);
		setLoading(true);
		try {
			const response = await axios.put(API_BASE_URL + `/products/${product.ID}`, updatedProduct);
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

	return (
		<div className='container mt-4'>
			<div>{currentProduct.name}</div>

{/* 

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

*/}
			

			<div className='row'>
				{/* Main Image Display Area - Left Side */}
				{/*<div className='col-lg-6'>*/}
					{/* row col-lg-6 start above */}

					<div
						className='card mb-4 shadow-sm main-image-container'
						ref={imageRef}
						//onMouseEnter={() => setIsHovering(true)}
						//onMouseLeave={() => setIsHovering(false)}
						onMouseMove={handleMouseMove}>
						{selectedImage ? (
							<>
								<img
									src={API_BASE_URL + selectedImage.url}
									alt={selectedImage.altText || 'Product image'}
									className='main-product-image'
								/>
								
							</>
						) : (
							<div className='no-image-placeholder'>
								<span className='text-muted'>No image selected</span>
							</div>
						)}
					</div>

					{/* Thumbnail Gallery */}
					<div className='thumbnail-gallery'>
						<h5 className='mb-3'>Product Images</h5>
						<div className='d-flex flex-row flex-nowrap overflow-auto pb-2'>
							{images?.length > 0 ? (
								images.map((image) => (
									<div
										key={image.ID}
										className='thumbnail-container me-2'
										onClick={() => setSelectedImage(image)}
										onMouseEnter={() => setSelectedImage(image)}>
										<img
											src={API_BASE_URL + image.url}
											alt={image.altText || 'Product thumbnail'}
											className={`img-thumbnail ${selectedImage?.ID === image.ID ? 'active-thumbnail' : ''}`}
										/>
										{image.isPrimary && (
											<span className='badge bg-primary position-absolute top-0 start-0'>
												Primary
											</span>
										)}
									</div>
								))
							) : (
								<div className='alert alert-info w-100'>No images available for this product</div>
							)}
						</div>
					</div>
					{/* row col-lg-6 end below */}
			{/*	</div> */}

				{/* Right Side - Product Details + Magnified Image */}
				<div className='col-lg-6 position-relative'>
					{/* Magnified Image Preview (appears on hover) 
					{isHovering && selectedImage && (
						<div
							className='magnified-preview'
							style={{
								backgroundImage: `url(${API_BASE_URL + selectedImage.url})`,
								backgroundPosition: `${hoverPosition.x}% ${hoverPosition.y}%`,
							}}
						/>
					)}
						*/}

				</div>
				{/* Product Details Card */}
				
				
			</div>
		</div>
	);
};

export default ProductImageGallery;
