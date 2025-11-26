import React, { useState, useEffect } from 'react';
import { SiteImage } from '../hooks/useSiteImages';
import 'styled-jsx/style';

interface SiteImagesCarouselProps {
  images: SiteImage[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showControls?: boolean;
}

const SiteImagesCarousel: React.FC<SiteImagesCarouselProps> = ({
  images,
  autoPlay = true,
  interval = 5000,
  showIndicators = true,
  showControls = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, autoPlay, interval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="carousel-container position-relative mb-5">
      <div 
        className="carousel slide" 
        data-bs-ride={autoPlay ? "carousel" : "false"}
        style={{ maxHeight: '500px', overflow: 'hidden' }}
      >
        {/* Indicators */}
        {showIndicators && images.length > 1 && (
          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                data-bs-target="#siteImagesCarousel"
                data-bs-slide-to={index}
                className={index === currentIndex ? 'active' : ''}
                aria-current={index === currentIndex ? 'true' : 'false'}
                aria-label={`Slide ${index + 1}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        )}

        {/* Carousel items */}
        <div className="carousel-inner rounded-3" style={{ height: '500px' }}>
          {images.map((image, index) => (
            <div
              key={image.ID}
              className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
              style={{ height: '100%' }}
            >
              <img
                src={API_BASE_URL + image.url}
                className="d-block w-100 h-100"
                alt={image.altText || 'Site image'}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
              {/* Optional: Add captions */}
              {image.altText && (
                <div className="carousel-caption d-none d-md-block">
                  <h5>{image.altText}</h5>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        {showControls && images.length > 1 && (
          <>
            <button
              className="carousel-control-prev"
              type="button"
              onClick={goToPrevious}
              style={{ width: '5%' }}
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              onClick={goToNext}
              style={{ width: '5%' }}
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>

      {/* Custom CSS for better styling */}
      <style jsx>{`
        .carousel-container {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .carousel-item {
          transition: transform 0.6s ease-in-out;
        }
        .carousel-indicators button {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin: 0 5px;
        }
        .carousel-caption {
          background: rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          padding: 10px 20px;
        }
      `}</style>
    </div>
  );
};

export default SiteImagesCarousel;