import React from 'react';
import { User, Product, ProductImage, Shop} from '../auth/types';

interface ImageDisplayProps {
  shop: Shop;
}

const ImageDisplayComponent: React.FC<ImageDisplayProps> = ({ shop }) => {
  // Flatten all product images from the shop
  const allImages = shop.products.flatMap(product => 
    (product.images || []).map(image => ({
      ...image,
      productName: product.name,
      productPrice: product.price
    }))
  );

  if (!allImages || allImages.length === 0) {
    return (
      <div className="alert alert-info mt-4">
        No images available for products in this shop.
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">Product Gallery</h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {allImages.map((image) => (
          <div key={image.ID} className="col">
            <div className="card h-100 shadow-sm">
              <img 
                src={image.url} 
                alt={image.altText || `Product: ${image.productName}`}
                className="card-img-top img-fluid"
                style={{ 
                  height: '200px',
                  objectFit: 'cover',
                  width: '100%'
                }}
              />
              <div className="card-body">
                <h5 className="card-title text-truncate">
                  {/*image.name || image.productName*/}
                </h5>
                <p className="card-text">
                  <span className="fw-bold">
                    ${(image.price || image.productPrice).toFixed(2)}
                  </span>
                </p>
                {image.description && (
                  <p className="card-text small text-muted">
                    {image.description}
                  </p>
                )}
              </div>
              {image.isPrimary && (
                <div className="card-footer bg-primary bg-opacity-10">
                  <small className="text-primary">Featured</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageDisplayComponent;