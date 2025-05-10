import { useState } from 'react';
import { User, Product, ProductImage } from '../auth/types';



const ProductImageGallery = ({ images }: { images: ProductImage[] }) => {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(images[0] || null);
  const [hoveredImage, setHoveredImage] = useState<ProductImage | null>(null);

  // Display either the hovered image or the selected image
  const displayImage = hoveredImage || selectedImage;

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Main Image Display Area - Left Side */}
        <div className="col-lg-8">
          <div className="card mb-4 shadow-sm">
            {displayImage ? (
              <img
                src={displayImage.url}
                alt={displayImage.altText || 'Product image'}
                className="card-img-top"
                style={{ 
                  height: '500px', 
                  objectFit: 'contain',
                  backgroundColor: '#f8f9fa'
                }}
              />
            ) : (
              <div className="d-flex justify-content-center align-items-center" 
                   style={{ height: '500px', backgroundColor: '#f8f9fa' }}>
                <span className="text-muted">No image selected</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="thumbnail-gallery">
            <h5 className="mb-3">Product Images</h5>
            <div className="d-flex flex-row flex-nowrap overflow-auto pb-2">
              {images?.length > 0 ? (
                images.map((image) => (
                  <div 
                    key={image.ID} 
                    className="thumbnail-container me-2"
                    onMouseEnter={() => setHoveredImage(image)}
                    onMouseLeave={() => setHoveredImage(null)}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || 'Product thumbnail'}
                      className={`img-thumbnail ${selectedImage?.ID === image.ID ? 'active-thumbnail' : ''}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                    />
                    {image.isPrimary && (
                      <span className="badge bg-primary position-absolute top-0 start-0">
                        Primary
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="alert alert-info w-100">
                  No images available for this product
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details - Right Side */}
        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-body">
              <h4 className="card-title">Product Details</h4>
              
              {displayImage ? (
                <>
                  <div className="mb-3">
                    <h6>Image Information</h6>
                    <p className="text-muted small mb-1">
                      {displayImage.altText || 'No description available'}
                    </p>
                    <p className="small">
                      {displayImage.url.split('/').pop()}
                    </p>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <h6>Pricing</h6>
                    {displayImage.price ? (
                      <h5 className="text-primary">${displayImage.price.toFixed(2)}</h5>
                    ) : (
                      <p className="text-muted">Price not available</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <h6>SKU</h6>
                    <p className="text-muted small">
                      {displayImage.sku || 'Not specified'}
                    </p>
                  </div>

                  <div className="d-grid gap-2">
                    <button className="btn btn-primary">
                      Add to Cart
                    </button>
                    <button className="btn btn-outline-secondary">
                      View Full Details
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-4">
                  Hover over an image to see details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;