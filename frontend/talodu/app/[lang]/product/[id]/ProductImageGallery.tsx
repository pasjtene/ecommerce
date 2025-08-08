//[lang]/[lang]/[product]/[id]/ProductImageGallery.tsx
//Copy rights Pascal J. Tene, all rights reserved
'use client';
import Modal from 'react-bootstrap/Modal';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import React, { useState, useRef } from 'react';
import './ProductImageGallery.css'; // We'll create this CSS file
import { ProductImage, Product } from '../../types';
import LoadingSpinner from '../../../api/LoadingSpinner';
import { useAuth, AuthProvider } from '../../contexts/AuthContextNext';

interface ImageModalState {
	show: boolean;
	currentIndex: number;
	isZoomed: boolean;
	zoomOffset: { x: number; y: number };
	direction: 'left' | 'right' | null;
}

const ProductImageGallery = ({ images, product }: { images: ProductImage[]; product: Product }) => {
	const [selectedImage, setSelectedImage] = useState<ProductImage | null>(images[0] || null);
	const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const imageRef = useRef<HTMLDivElement>(null);
	const [currentProduct, setCurrentProduct] = useState<Product>(product);
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';
	const [touchStartX, setTouchStartX] = useState<number | null>(null);
	const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
	const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);

	const [imageModal, setImageModal] = useState<ImageModalState>({
		show: false,
		currentIndex: 0,
		isZoomed: false,
		zoomOffset: { x: 0, y: 0 },
		direction: null,
	});

	const handleTouchStart = (e: React.TouchEvent) => {
		if (!imageModal.isZoomed) return;

		setTouchStart({
			x: e.touches[0].clientX,
			y: e.touches[0].clientY,
		});
		setIsDragging(true);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!imageModal.isZoomed || !isDragging) return;
		e.preventDefault();

		const touch = e.touches[0];
		const deltaX = touch.clientX - touchStart.x;
		const deltaY = touch.clientY - touchStart.y;

		setImageModal((prev) => ({
			...prev,
			zoomOffset: {
				x: prev.zoomOffset.x + deltaX,
				y: prev.zoomOffset.y + deltaY,
			},
		}));

		setTouchStart({
			x: touch.clientX,
			y: touch.clientY,
		});
	};

	const handleTouchEnd = () => {
		setIsDragging(false);
	};

	const handleImageClick = (index: number) => {
		setImageModal({
			show: true,
			currentIndex: index,
			isZoomed: false,
			zoomOffset: { x: 0, y: 0 },
			direction: null,
		});
	};

	const handleCloseModal = () => {
		setImageModal({ ...imageModal, show: false });
	};

	const handlePrev = () => {
		setImageModal((prev) => ({
			...prev,
			currentIndex: (prev.currentIndex - 1 + images.length) % images.length,
			direction: 'left',
			isZoomed: false, // Reset zoom when changing images
			zoomOffset: { x: 0, y: 0 },
		}));
	};

	const handleNext = () => {
		setImageModal((prev) => ({
			...prev,
			currentIndex: (prev.currentIndex + 1) % images.length,
			direction: 'right',
			isZoomed: false, // Reset zoom when changing images
			zoomOffset: { x: 0, y: 0 },
		}));
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!imageRef.current) return;

		const { left, top, width, height } = imageRef.current.getBoundingClientRect();
		const x = ((e.clientX - left) / width) * 100;
		const y = ((e.clientY - top) / height) * 100;
		setHoverPosition({ x, y });
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div className='container mt-4'>
			<div>{currentProduct.name}</div>

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
							<div
								//className="main-image-wrapper1"
								onClick={() => {
									setImageModal((prev) => ({
										...prev,
										isZoomed: false,
										zoomOffset: { x: 0, y: 0 },
									}));
								}}>
								<img
									src={API_BASE_URL + selectedImage.url}
									alt={selectedImage.altText || 'Product image'}
									onClick={() => handleImageClick(currentImageIndex)}
									className='main-product-image'
									//className={`main-product-image ${imageModal.isZoomed ? 'zoomed' : ''}`}
								/>
							</div>
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
							images.map((image, index) => (
								<div
									key={image.ID}
									className='thumbnail-container me-2'
									//onClick={() => {setCurrentImageIndex(index), setSelectedImage(image)}}
									onClick={() => handleImageClick(currentImageIndex)}
									onMouseEnter={() => {
										(setCurrentImageIndex(index), setSelectedImage(image));
									}}>
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
				{/* Product Details Card */}
			</div>

			{/* Image Modal with Thumbnails */}
			<Modal
				show={imageModal.show}
				onHide={handleCloseModal}
				centered
				size='xl'
				className='image-modal'
				backdropClassName='modal-backdrop-transparent'
				fullscreen='sm-down'>
				<style jsx>{`
					.thumbnail-container-pa {
						display: flex;
						flex-direction: column;
						gap: 10px;
						padding: 20px;
						overflow-y: auto;
						max-height: 80vh;

						width: 120px;
						height: 90vh;
					}

					.thumbnail-container-pr {
						display: flex;
						gap: 10px;
						padding: 10px;
						overflow-x: auto;
					}

					.thumbnail-item {
						width: 80px;
						height: 80px;
						object-fit: cover;
						cursor: pointer;
						border: 2px solid transparent;
						border-radius: 4px;
						transition: all 0.2s ease;
					}
					.image-slider {
						position: relative;
						width: 100%;
						height: 100%;
						overflow: hidden;
					}
					.slide {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						display: flex;
						align-items: center;
						justify-content: center;
						transition: transform 0.5s ease-in-out;
					}
					.slide.current {
						transform: translateX(0);
						z-index: 1;
					}

					.slide.next {
						transform: translateX(100%);
					}

					.slide.previous {
						transform: translateX(-100%);
					}
					.slide.entering-left {
						transform: translateX(100%);
						animation: slideInLeft 0.5s forwards;
					}

					.slide.entering-right {
						transform: translateX(-100%);
						animation: slideInRight 0.5s forwards;
					}

					.slide.exiting-left {
						animation: slideOutLeft 0.5s forwards;
					}
					.slide.exiting-right {
						animation: slideOutRight 0.5s forwards;
					}

					@keyframes slideInLeft {
						from {
							transform: translateX(100%);
						}
						to {
							transform: translateX(0);
						}
					}

					@keyframes slideInRight {
						from {
							transform: translateX(-100%);
						}
						to {
							transform: translateX(0);
						}
					}
					@keyframes slideOutLeft {
						from {
							transform: translateX(0);
						}
						to {
							transform: translateX(-100%);
						}
					}

					@keyframes slideOutRight {
						from {
							transform: translateX(0);
						}
						to {
							transform: translateX(100%);
						}
					}
					.main-image-wrapper {
						position: relative;
						width: 100%;
						height: 100%;
						overflow: hidden;
						cursor: zoom-in;
						touch-action: none;
					}
					.main-image {
						border-radius: 4px;

						max-height: 100%;
						max-width: 100%;
						width: auto;
						height: auto;
						object-fit: contain;
						object-position: center center;
						transition: transform 0.2s ease-out;
					}
					.main-image.zoomed {
						transform: scale(2);
						cursor: grab;
						touch-action: none;
						pointer-events: auto;
					}
					.main-image.zoomed.grabbing,
					.main-image.zoomed:active {
						cursor: grabbing;
						transition: none;
					}

					/* For very tall/wide images (keep existing) */
					@media (max-aspect-ratio: 1/1) {
						.main-image {
							width: auto;
							height: 100%;
						}
					}

					@media (min-aspect-ratio: 1/1) {
						.main-image {
							width: 100%;
							height: auto;
						}
					}

					.thumbnail-item:hover {
						transform: scale(1.05);
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
						border-color: #aaa;
					}

					.thumbnail-item.active {
						border-color: #3b7ddd;
						box-shadow: 0 0 0 3px rgba(59, 125, 221, 0.5);
					}

					.modal-content-container {
						display: flex;
						flex-direction: row;
					}
					
					.main-image-container {
						flex: 1;
						display: flex;
						align-items: center;
						justify-content: center;
						position: relative;
						height: calc(100vh - 120px); /* Adjust based on your needs */
						overflow: hidden;
						touch-action: pan-y; /* Enable touch scrolling */
                        padding-top: 20px; 
                        padding-bottom: 20px;
					}

					.nav-button {
						position: absolute;
						background-color: rgba(0, 0, 0, 0.5);
						border: none;
						color: white;
						font-size: 2rem;
						width: 60px;
						height: 60px;
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						opacity: 0.7;
						transition: opacity 0.2s;
						z-index: 10;
					}
					.nav-button:hover {
						opacity: 1;
						background-color: rgba(0, 0, 0, 0.7);
					}

					.close-button {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        width: 44px;  /* Increased from 40px for better touch target */
                        height: 44px; 
                        background-color: rgba(0, 0, 0, 0.7) !important;
                        border: 2px solid white !important;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 11;
                        cursor: pointer;
                        padding: 0;
                        margin: 0;
                        color: white; /* Ensures SVG inherits this color */
                        }
                        .close-button svg {
                        width: 20px;  /* Slightly reduced from 24px to fit better */
                        height: 20px; 
                        filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5)); /* Adds contrast */
                        }

					.close-button:hover {
						background-color: rgba(0, 0, 0, 0.7);
					}

					/* Desktop styles */
					@media (min-width: 768px) {
						.modal-content-container {
							display: flex;
							flex-direction: row;
						}
						.thumbnail-container-pr {
							flex-direction: column;
							width: 120px;
							height: 90vh;
							overflow-y: auto;
						}
						.main-image-container {
							height: 90vh;
						}
					}

					@media (max-width: 430px) {
						/* Targets iPhone 8 and iphone 15 pro and similar small screens */
						.close-button {
                            top: 10px;
                            right: 10px;
                            width: 40px;
                            height: 40px;
                            background-color: rgba(0, 0, 0, 0.8) !important;
                        }
                        
                        .close-button svg {
                            width: 18px;
                            height: 18px;
                            stroke-width: 2.5; /* Slightly thicker for small screens */
                        }

						.nav-button {
							display: none;
						}
					}

					/* Mobile styles */
					@media (max-width: 767px) {
						.modal-content-container {
							display: flex;
							flex-direction: column;
							height: 100vh;
						}
						.main-image-wrapper {
							cursor: pointer;
						}

						.main-image.zoomed {
							cursor: pointer;
						}

						.thumbnail-container-pr {
							position: absolute;
							bottom: 0;
							left: 0;
							right: 0;
							z-index: 10;
						}
						.main-image-container {
							height: calc(100% - 80px); /* Account for thumbnails */
						}
					}
				`}</style>

				<Modal.Body style={{ padding: 0 }} className='p-0'>
					<div className='modal-content-container'>
						{/* Main image area */}
						<div className='main-image-container'>
							<button onClick={handleCloseModal} className='close-button'>
								 <svg 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24"
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3"  // Increased from 2 to 3
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
							</button>

							<button onClick={handlePrev} className='nav-button' style={{ left: '10px' }}>
								<FaArrowLeft />
							</button>

							{/* Image Slider */}
							<div
								className='image-slider border'
								onTouchStart={(e) => {
									// Only set touch start if not zoomed or not dragging
									if (!imageModal.isZoomed || !isDragging) {
										setTouchStartX(e.touches[0].clientX);
									}
								}}
								onTouchEnd={(e) => {
									// Only handle swipe if not zoomed or not dragging
									if (!imageModal.isZoomed || !isDragging) {
										if (touchStartX === null) return;
										const touchEndX = e.changedTouches[0].clientX;
										const diff = touchStartX - touchEndX;

										if (diff > 50) {
											// Swipe left - go to previous image
											handlePrev();
										} else if (diff < -50) {
											// Swipe right - go to next image
											handleNext();
										}

										setTouchStartX(null);
									}
								}}>
								{images.map((image, index) => {
									const position =
										index === imageModal.currentIndex
											? 'current'
											: index === (imageModal.currentIndex + 1) % images.length
												? 'next'
												: index === (imageModal.currentIndex - 1 + images.length) % images.length
													? 'previous'
													: 'hidden';

									const animationClass =
										position === 'current' && imageModal.direction === 'left'
											? 'entering-left'
											: position === 'current' && imageModal.direction === 'right'
												? 'entering-right'
												: position === 'previous' && imageModal.direction === 'left'
													? 'exiting-left'
													: position === 'next' && imageModal.direction === 'right'
														? 'exiting-right'
														: '';

									return (
										<div key={image.ID} className={`slide ${position} ${animationClass}`}>
											<div
												className='main-image-wrapper'
												onClick={() => {
													setImageModal((prev) => ({
														...prev,
														isZoomed: !prev.isZoomed,
														zoomOffset: { x: 0, y: 0 },
													}));
												}}
												onMouseMove={(e) => {
													if (!imageModal.isZoomed) return;

													const wrapper = e.currentTarget;
													const img = wrapper.querySelector('.main-image') as HTMLImageElement;
													if (!img) return;

													const rect = wrapper.getBoundingClientRect();
													const x = e.clientX - rect.left;
													const y = e.clientY - rect.top;
													const percentX = x / rect.width;
													const percentY = y / rect.height;
													const offsetX = (percentX - 0.5) * img.offsetWidth;
													const offsetY = (percentY - 0.5) * img.offsetHeight;
													setImageModal((prev) => ({
														...prev,
														zoomOffset: { x: -offsetX, y: -offsetY },
													}));
												}}
												onMouseDown={() => {
													if (imageModal.isZoomed) {
														const img = document.querySelector('.main-image.zoomed');
														img?.classList.add('grabbing');
													}
												}}
												onMouseUp={() => {
													const img = document.querySelector('.main-image.zoomed');
													img?.classList.remove('grabbing');
												}}
												onMouseLeave={() => {
													const img = document.querySelector('.main-image.zoomed');
													img?.classList.remove('grabbing');
												}}
												onTouchStart={handleTouchStart}
												onTouchMove={handleTouchMove}
												onTouchEnd={handleTouchEnd}>
												<img
													src={API_URL + images[imageModal.currentIndex]?.url}
													alt={images[imageModal.currentIndex]?.altText || 'Product image'}
													className={`main-image ${imageModal.isZoomed ? 'zoomed' : ''}`}
													style={{
														transform: imageModal.isZoomed
															? `scale(2) translate(${imageModal.zoomOffset.x}px, ${imageModal.zoomOffset.y}px)`
															: 'none',
													}}
												/>
											</div>
										</div>
									);
								})}
							</div>
							<button onClick={handleNext} className='nav-button' style={{ right: '20px' }}>
								<FaArrowRight />
							</button>
						</div>
						{/* Thumbnail container - now at bottom for mobile */}
						<div className='thumbnail-container-pr'>
							{images.map((image, index) => (
								<img
									key={image.ID}
									src={API_URL + image.url}
									alt={image.altText || 'Product thumbnail'}
									className={`thumbnail-item ${imageModal.currentIndex === index ? 'active' : ''}`}
									onClick={() => setImageModal((prev) => ({ ...prev, currentIndex: index }))}
								/>
							))}
						</div>
					</div>
				</Modal.Body>
			</Modal>
			{/* Image Modal with Thumbnails */}
		</div>
	);
};

export default ProductImageGallery;
