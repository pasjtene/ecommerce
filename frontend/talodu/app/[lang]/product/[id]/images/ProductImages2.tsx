// app/[lang]/product/[id]/images/ProductImages.tsx
'use client'
import Modal from 'react-bootstrap/Modal';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
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
import 'styled-jsx/style';

interface ProductImageProps {
  product: Product;
}

interface ImageModalState {
  show: boolean;
  currentIndex: number;
  isZoomed: boolean; // Add this
  zoomOffset: { x: number; y: number };
  direction: 'left' | 'right' | null;
}

interface Dictionary {
  product_image: {
    add_product_image: string;
    current_images: string;
    choose_files: string;
    delete: string;
  };
}



const defaultDictionary: Dictionary = {
  product_image: {
    add_product_image: 'Add product image',
    current_images: "Current images",
    choose_files: "Choose files",
    delete: "Delete",
  },
};

const ProductImages = ({ product }: ProductImageProps) => {
  const params = useParams();
  const [translation, setDictionary] = useState<Dictionary>(defaultDictionary);
  const [token, setToken] = useState<string | null>(null);
  const { user, isShopOwner, hasRole, hasAnyRole } = useAuth();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<ProductImage[]>(product.images);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiError, setApiError] = useState<AppError>();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [imageModal, setImageModal] = useState<ImageModalState>({
    show: false,
    currentIndex: 0,
    isZoomed: false,
    zoomOffset: { x: 0, y: 0 },
    direction: null
  });

  const handleDeleteError = (error: AppError) => {
    setApiError(error);
    setShowErrorModal(true);
  };

  const handleImageClick = (index: number) => {
    setImageModal({
      show: true,
      currentIndex: index,
      isZoomed: false,
      zoomOffset: { x: 0, y: 0 },
      direction: null
    });
  };

  const handleCloseModal = () => {
    setImageModal({ ...imageModal, show: false });
  };

  const handlePrev = () => {
  setImageModal(prev => ({
    ...prev,
    currentIndex: (prev.currentIndex - 1 + images.length) % images.length,
    direction: 'left',
    isZoomed: false, // Reset zoom when changing images
    zoomOffset: { x: 0, y: 0 }
  }));
};

  const handleNext = () => {
  setImageModal(prev => ({
    ...prev,
    currentIndex: (prev.currentIndex + 1) % images.length,
    direction: 'right',
    isZoomed: false, // Reset zoom when changing images
    zoomOffset: { x: 0, y: 0 }
  }));
};

  useEffect(() => {
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
      // toast.error('Failed to delete products');
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
          <div>
            <h2 className="">{product.name}</h2>
          </div>

          <div className='col-lg-8'>
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

          <div className='mt-2'>
            <h5 className=''>Current Images</h5>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <div>
                {selectedImages.length > 0 && (
                  <button
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
                {images.map((image, index) => (
                  <div key={image.ID} className='col'>
                    <div className='card h-100 shadow-sm'>
                      <img
                        src={API_URL + image.url}
                        alt={image.altText || 'Product image'}
                        className='card-img-top img-thumbnail'
                        style={{ height: '200px', objectFit: 'cover' }}
                        onClick={() => handleImageClick(index)}
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

      {/* Image Modal with Thumbnails */}
      <Modal 
        show={imageModal.show} 
        onHide={handleCloseModal}
        centered
        size="xl"
        className="image-modal"
        backdropClassName="modal-backdrop-transparent"
        fullscreen="sm-down"
      >
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
                      from { transform: translateX(100%); }
                      to { transform: translateX(0); }
                    }

                    @keyframes slideInRight {
                      from { transform: translateX(-100%); }
                      to { transform: translateX(0); }
                    }
                      @keyframes slideOutLeft {
                      from { transform: translateX(0); }
                      to { transform: translateX(-100%); }
                    }

                    @keyframes slideOutRight {
                      from { transform: translateX(0); }
                      to { transform: translateX(100%); }
                    }
            .main-image-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                cursor: zoom-in;
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
                }
                  .main-image.zoomed.grabbing {
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
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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

        
          
          .main-image-container1 {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            
            position: relative;
            height: 90vh;
            margin: 30px;

            overflow: hidden;
            
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
    }
    

          .nav-button {
            position: absolute;
            background-color: rgba(0,0,0,0.5);
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
            background-color: rgba(0,0,0,0.7);
          }

          .close-button {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: rgba(0,0,0,0.5);
            border: none;
            color: white;
            font-size: 1.5rem;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 11;
          }

          .close-button:hover {
            background-color: rgba(0,0,0,0.7);
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

    /* Mobile styles */
    @media (max-width: 767px) {
      .modal-content-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
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

        
          <Modal.Body style={{ padding: 0 }} className="p-0">
    <div className="modal-content-container">
      {/* Main image area */}
      <div className="main-image-container">
        <button 
          onClick={handleCloseModal}
          className="close-button"
        >
          <FaTimes />
        </button>
        
        <button 
          onClick={handlePrev}
          className="nav-button"
          style={{ left: '10px' }}
        >
            <FaArrowLeft />
        </button>

        {/* Image Slider */}
        <div 
          className="image-slider"
          onTouchStart={(e) => {
                setTouchStartX(e.touches[0].clientX);
            }}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (diff > 50) {
            // Swipe left - go to next image
            handleNext();
            } else if (diff < -50) {
            // Swipe right - go to previous image
            handlePrev();
            }
            
    setTouchStartX(null);
  }}
        >
            {images.map((image, index) => {
            const position = 
              index === imageModal.currentIndex ? 'current' :
              index === (imageModal.currentIndex + 1) % images.length ? 'next' :
              index === (imageModal.currentIndex - 1 + images.length) % images.length ? 'previous' :
              'hidden';

            const animationClass = 
              position === 'current' && imageModal.direction === 'left' ? 'entering-left' :
              position === 'current' && imageModal.direction === 'right' ? 'entering-right' :
              position === 'previous' && imageModal.direction === 'left' ? 'exiting-left' :
              position === 'next' && imageModal.direction === 'right' ? 'exiting-right' : '';

            return (
                <div 
                key={image.ID} 
                className={`slide ${position} ${animationClass}`}
              >
                <div 
                  className="main-image-wrapper"
                  onClick={() => {
                    setImageModal(prev => ({
                      ...prev,
                      isZoomed: !prev.isZoomed,
                      zoomOffset: { x: 0, y: 0 }
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
                     setImageModal(prev => ({
                      ...prev,
                      zoomOffset: { x: -offsetX, y: -offsetY }
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
                >
                  <img
                    src={API_URL + images[imageModal.currentIndex]?.url}
                    alt={images[imageModal.currentIndex]?.altText || 'Product image'}
                    className={`main-image ${imageModal.isZoomed ? 'zoomed' : ''}`}
                    style={{
                        transform: imageModal.isZoomed 
                        ? `scale(2) translate(${imageModal.zoomOffset.x}px, ${imageModal.zoomOffset.y}px)`
                        : 'none'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
         <button 
          onClick={handleNext}
          className="nav-button"
          style={{ right: '20px' }}
        >
          <FaArrowRight />
        </button>
      </div>
       {/* Thumbnail container - now at bottom for mobile */}
      <div className="thumbnail-container-pr">
        {images.map((image, index) => (
          <img
            key={image.ID}
            src={API_URL + image.url}
            alt={image.altText || 'Product thumbnail'}
            className={`thumbnail-item ${imageModal.currentIndex === index ? 'active' : ''}`}
            onClick={() => setImageModal(prev => ({ ...prev, currentIndex: index }))}
          />
        ))}
      </div>
      </div>
    
               
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductImages;