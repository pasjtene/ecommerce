import { useState, useRef } from 'react';
import './ProductImageGallery.css'; // We'll create this CSS file
import { ProductImage, Product } from '../auth/types';
import { API_IMAGES, API_BASE_URL } from '../auth/api'
import ProductEditComponent from './ProductEditComponent'
import axios  from 'axios';
import { toast } from 'react-toastify'



const ProductImageGallery = ({ images, product }: { images: ProductImage[], product: Product }) => {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(images[0] || null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
 

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setHoverPosition({ x, y });
  };

  const handleSave = async (updatedProduct: Product) => {
    console.log("The prduct to update: ", updatedProduct)
    try {
      const response = await axios.put(API_BASE_URL+`/products/${product.ID}`, updatedProduct);
      setCurrentProduct(response.data);
      console.log("The updated prduct ...: ", response.data)
      console.log("The updated prduct shop is ...: ", response.data.ShopID)
      setIsEditing(false);
      // Show success toast
          toast.success(`Product updated savedsuccessfully`);
        } catch (error) {
          toast.error('Failed to update products');
          console.log(error)
      // Show error toast
    }
  };

  return (
    <div className="container mt-4">
      <div>{currentProduct.name}</div>

      <div className="container mt-4">
        {isEditing ? (
          <ProductEditComponent 
            product={currentProduct}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
          </>
          )
          }
      </div>
        
        




      <div className="row">
        {/* Main Image Display Area - Left Side */}
        <div className="col-lg-8">
          <div 
            className="card mb-4 shadow-sm main-image-container"
            ref={imageRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
          >
            {selectedImage ? (
              <>
                <img
                  src={API_BASE_URL+selectedImage.url}
                  alt={selectedImage.altText || 'Product image'}
                  className="main-product-image"
                />
                {/* Magnifying glass lens */}
                {isHovering && (
                  <div 
                    className="magnifier-lens"
                    style={{
                      left: `${hoverPosition.x}%`,
                      top: `${hoverPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}
              </>
            ) : (
              <div className="no-image-placeholder">
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
                    onClick={() => setSelectedImage(image)}
                    onMouseEnter={() => setSelectedImage(image)}
                  >
                    <img
                      src={API_BASE_URL+image.url}
                      alt={image.altText || 'Product thumbnail'}
                      className={`img-thumbnail ${selectedImage?.ID === image.ID ? 'active-thumbnail' : ''}`}
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

        {/* Right Side - Product Details + Magnified Image */}
        <div className="col-lg-4 position-relative">
          {/* Magnified Image Preview (appears on hover) */}
          {isHovering && selectedImage && (
            <div 
              className="magnified-preview"
              style={{
                backgroundImage: `url(${API_BASE_URL+selectedImage.url})`,
                backgroundPosition: `${hoverPosition.x}% ${hoverPosition.y}%`,
              }}
            />
          )}

          {/* Product Details Card */}
          <div className="card shadow-sm product-details-card">
            <div className="card-body">
              <h4 className="card-title">Product Details</h4>
              
              {selectedImage ? (
                <>
                  <div className="mb-3">
                    <h6>Image Information</h6>
                    <p className="text-muted small mb-1">
                      {selectedImage.altText || 'No description available'}
                    </p>
                    <p className="small">
                      {selectedImage.url.split('/').pop()}
                    </p>
                  </div>

                  <hr />
           

                  <div className="d-grid gap-2">
                    <button onClick={() => setIsEditing(true)}
                    className="btn btn-primary">
                      Edit product
                    </button>
                    <button className="btn btn-outline-secondary">
                      View Full Details
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-4">
                  Select an image to see details
                </div>
              )}
            </div>
          </div>
 {/* Product Details Card */}

  {/* Product Details Card */}
  <div className="card shadow-sm product-details-card">
            <div className="card-body">
              <h4 className="card-title">Product Details</h4>
              
              {selectedImage ? (
                <>
                  <div className="mb-3">
                    <h6>Image Information</h6>
                    <p className="text-muted small mb-1">
                      {selectedImage.altText || 'No description available'}
                    </p>
                    <p className="small">
                      {selectedImage.url.split('/').pop()}
                    </p>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <h6>Prix</h6>
                    {product.price ? (
                      <h5 className="text-primary">${product.price.toFixed(2)}</h5>
                    ) : (
                      <p className="text-muted">Le prix du produit n'est pas disponible</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <h6>Stock</h6>
                    {product.stock ? (
                      <h5 className="text-primary">En Stock: {product.stock} disponible</h5>
                    ) : (
                      <p className="text-muted">Ce produit n'est pas disponible</p>
                    )}
                  </div>

                  
                    {selectedImage.price ? (
                      <div className="mb-3">
                    <h6>Pricing</h6>
                      <h5 className="text-primary">${selectedImage.price.toFixed(2)}</h5>
                      </div>
                    ) : (
                      <p className="text-muted">Cette version n'a pas un prix special</p>
                    )}
                  

              

                  <div className="mb-3">
                    <h6>SKU</h6>
                    <p className="text-muted small">
                      {selectedImage.sku || 'Not specified'}
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
                  Select an image to see details
                </div>
              )}
            </div>
          </div>
 {/* Product Details Card */}




        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;