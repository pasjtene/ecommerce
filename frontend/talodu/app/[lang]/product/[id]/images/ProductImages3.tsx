'use client'
import Modal from 'react-bootstrap/Modal';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import React, { useState, useEffect, useRef } from 'react';
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

interface ProductImageProps {
  product: Product;
}

interface ImageModalState {
  show: boolean;
  currentIndex: number;
  isZoomed: boolean;
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
  const [transitionDuration] = useState(500); // Transition duration in ms
  //const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const setImageRef = (index: number) => (el: HTMLImageElement | null) => {
    imageRefs.current[index] = el;
  };

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
      isZoomed: false,
      zoomOffset: { x: 0, y: 0 }
    }));
  };

  const handleNext = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % images.length,
      direction: 'right',
      isZoomed: false,
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
                        className={`btn ${files.length === 0 ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={handleUpload}
                        disabled={uploading || files.length === 0}>
                        {uploading ? `Uploading... ${progress}%` : 'Upload'}
                      </button>
                      {files.length > 0 && (
                        <div className="mt-3">
                          <p>Selected files:</p>
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li key={index} className="list-group-item">{file.name}</li>
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
                    onClick={() => setShowConfirmModal(true)}
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

      {(!isShopOwner(product.shop) && !hasAnyRole(['SuperAdmin', 'Admin']) && (
        <div className="alert alert-warning">You are not authorized to view this page</div>
      ))}

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

      {/* Image Modal with smooth transitions */}
      <Modal 
        show={imageModal.show} 
        onHide={handleCloseModal}
        centered
        size="xl"
        fullscreen="sm-down"
        className="p-0"
      >
        <Modal.Body className="p-0 d-flex flex-column h-100 position-relative">
          {/* Close button */}
          <button 
            onClick={handleCloseModal}
            className="position-absolute top-0 end-0 m-3 bg-dark bg-opacity-50 border-0 rounded-circle text-white d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px', zIndex: 11 }}
          >
            <FaTimes />
          </button>
          
          {/* Main image container */}
          <div 
            className="flex-grow-1 position-relative d-flex align-items-center justify-content-center overflow-hidden"
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const touchEndX = e.changedTouches[0].clientX;
              const diff = touchStartX - touchEndX;
              
              if (diff > 50) handleNext();
              else if (diff < -50) handlePrev();
              setTouchStartX(null);
            }}
          >
            {/* Navigation buttons */}
            <button 
              onClick={handlePrev}
              className="position-absolute start-0 ms-3 bg-dark bg-opacity-50 border-0 rounded-circle text-white d-flex align-items-center justify-content-center"
              style={{ width: '60px', height: '60px', zIndex: 10 }}
            >
              <FaArrowLeft />
            </button>
            
            <button 
              onClick={handleNext}
              className="position-absolute end-0 me-3 bg-dark bg-opacity-50 border-0 rounded-circle text-white d-flex align-items-center justify-content-center"
              style={{ width: '60px', height: '60px', zIndex: 10 }}
            >
              <FaArrowRight />
            </button>
            
            {/* Image slider with transitions */}
            <div className="position-relative w-100 h-100">
        {images.map((image, index) => {
          const isActive = index === imageModal.currentIndex;
          const isPrevious = index === (imageModal.currentIndex - 1 + images.length) % images.length;
          const isNext = index === (imageModal.currentIndex + 1) % images.length;
          
          let transform = '';
          if (isActive) transform = 'translateX(0)';
          else if (isPrevious) transform = 'translateX(-100%)';
          else if (isNext) transform = 'translateX(100%)';
          else transform = 'translateX(0)';
          
          return (
            <div
              key={image.ID}
              className={`position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center`}
              style={{
                transform,
                transition: `transform ${transitionDuration}ms ease-in-out, opacity ${transitionDuration}ms ease-in-out`,
                zIndex: isActive ? 2 : 1,
                opacity: isActive ? 1 : 0.5,
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            >
              <img
                ref={setImageRef(index)}
                src={API_URL + image.url}
                alt={image.altText || 'Product image'}
                className={`img-fluid ${imageModal.isZoomed ? 'zoomed' : ''}`}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  transform: imageModal.isZoomed 
                    ? `scale(2) translate(${imageModal.zoomOffset.x}px, ${imageModal.zoomOffset.y}px)`
                    : 'none',
                  transition: imageModal.isZoomed ? 'none' : `transform ${transitionDuration}ms ease-out`,
                  cursor: imageModal.isZoomed ? 'grab' : 'zoom-in'
                }}
                onClick={(e) => {
                    if (!imageModal.isZoomed) {
                    setImageModal(prev => ({
                      ...prev,
                      isZoomed: !prev.isZoomed,
                      zoomOffset: { x: 0, y: 0 }
                    }));
                  }
                }}
                onMouseMove={(e) => {
                  if (!imageModal.isZoomed) return;
                  
                  const wrapper = e.currentTarget;
                  const rect = wrapper.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const percentX = x / rect.width;
                  const percentY = y / rect.height;
                  const offsetX = (percentX - 0.5) * wrapper.offsetWidth;
                  const offsetY = (percentY - 0.5) * wrapper.offsetHeight;
                  
                  setImageModal(prev => ({
                    ...prev,
                    zoomOffset: { x: -offsetX, y: -offsetY }
                  }));
                }}
                onMouseDown={(e) => {
                  if (imageModal.isZoomed) {
                    e.currentTarget.style.cursor = 'grabbing';
                  }
                  
                         
                        

            {/* Image slider with transitions */}
          </div>
          
          {/* Thumbnail container */}
          <div className="d-flex flex-nowrap overflow-x-auto p-2 bg-dark bg-opacity-75">
            {images.map((image, index) => (
              <img
                key={image.ID}
                src={API_URL + image.url}
                alt={image.altText || 'Product thumbnail'}
                className={`rounded me-2 ${imageModal.currentIndex === index ? 'border border-primary border-3' : 'border border-secondary'}`}
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  objectFit: 'cover', 
                  cursor: 'pointer',
                  transition: 'border-color 0.3s ease'
                }}
                onClick={() => {
                  const direction = index > imageModal.currentIndex ? 'right' : 'left';
                  setImageModal(prev => ({ 
                    ...prev, 
                    currentIndex: index,
                    direction,
                    isZoomed: false,
                    zoomOffset: { x: 0, y: 0 }
                  }));
                }}
              />
            ))}
          </div>
        </Modal.Body>
      </Modal>

      {/* Add global CSS for transitions */}
      <style jsx global>{`
        .image-modal .modal-content {
          background-color: transparent;
          border: none;
        }
        
        .image-modal .modal-body {
          padding: 0;
        }
        
        .zoomed {
          transform: scale(2);
          cursor: grab;
          transition: transform 0.3s ease-out;
        }
        
        .zoomed.grabbing {
          cursor: grabbing;
          transition: none;
        }
      `}</style>
    </div>
  );
};

export default ProductImages;