import React, { useState, useEffect, useCallback } from 'react';
import { SiteImage } from '../hooks/useSiteImages';

interface SiteImagesCarouselProps {
  images: SiteImage[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showControls?: boolean;
  transitionDuration?: number;
  transitionType?: 'fade' | 'slide' | 'zoom' | 'flip';
}

const SiteImagesCarousel: React.FC<SiteImagesCarouselProps> = ({
  images,
  autoPlay = true,
  interval = 5000,
  showIndicators = true,
  showControls = true,
  transitionDuration = 600,
  transitionType = 'zoom'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  // Preload images for smoother transitions
  useEffect(() => {
    images.forEach((image) => {
      const img = new Image();
      img.src = API_BASE_URL + image.url;
    });
  }, [images, API_BASE_URL]);

  // Smooth transition to next slide
  const goToSlide = useCallback((index: number, dir: 'next' | 'prev' = 'next') => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setDirection(dir);
    
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 10);
  }, [currentIndex, isTransitioning]);

  // Auto-play functionality with smooth transitions
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || isTransitioning) return;

    const timer = setTimeout(() => {
      goToSlide((currentIndex + 1) % images.length, 'next');
    }, interval);

    return () => clearTimeout(timer);
  }, [currentIndex, images.length, autoPlay, interval, isTransitioning, goToSlide]);

  const goToPrevious = () => {
    if (isTransitioning) return;
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(newIndex, 'prev');
  };

  const goToNext = () => {
    if (isTransitioning) return;
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex, 'next');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  if (images.length === 0) {
    return null;
  }

  // Get transition class based on type
  const getTransitionClass = () => {
    const baseClass = 'carousel-item';
    const transitioningClass = isTransitioning ? 'transitioning' : '';
    
    switch (transitionType) {
      case 'slide':
        return `${baseClass} ${transitioningClass} slide-${direction}`;
      case 'zoom':
        return `${baseClass} ${transitioningClass} zoom`;
      case 'flip':
        return `${baseClass} ${transitioningClass} flip-${direction}`;
      case 'fade':
      default:
        return `${baseClass} ${transitioningClass} fade`;
    }
  };

  return (
    <div className="carousel-container position-relative mb-5">
      <div 
        className="carousel"
        style={{ 
          maxHeight: '500px', 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Carousel items with smooth transitions */}
        <div className="carousel-inner rounded-3" style={{ height: '500px', position: 'relative' }}>
          {images.map((image, index) => (
            <div
              key={image.ID}
              className={`${getTransitionClass()} ${index === currentIndex ? 'active' : ''}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transition: `all ${transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
              }}
            >
              <img
                src={API_BASE_URL + image.url}
                className="carousel-image"
                alt={image.altText || 'Site image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: '12px'
                }}
              />
              {/* Optional: Add captions */}
              {image.altText && (
                <div className="carousel-caption">
                  <div className="caption-content">
                    <h5>{image.altText}</h5>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar for auto-play */}
        {autoPlay && images.length > 1 && (
          <div className="carousel-progress">
            <div 
              className="progress-bar" 
              style={{ 
                animationDuration: `${interval}ms`,
                animationPlayState: isTransitioning ? 'paused' : 'running'
              }}
            />
          </div>
        )}

        {/* Controls */}
        {showControls && images.length > 1 && (
          <>
            <button
              className="carousel-control prev"
              type="button"
              onClick={goToPrevious}
              disabled={isTransitioning}
            >
              <span className="control-icon">‹</span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control next"
              type="button"
              onClick={goToNext}
              disabled={isTransitioning}
            >
              <span className="control-icon">›</span>
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`indicator ${index === currentIndex ? 'active' : ''} ${isTransitioning ? 'disabled' : ''}`}
              onClick={() => !isTransitioning && goToSlide(index, index > currentIndex ? 'next' : 'prev')}
              aria-label={`Go to slide ${index + 1}`}
              disabled={isTransitioning}
            >
              <div className="indicator-progress" />
            </button>
          ))}
        </div>
      )}

      {/* Enhanced CSS for smooth transitions */}
      <style jsx>{`
        .carousel-container {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .carousel-inner {
          perspective: 1000px;
        }

        .carousel-item {
          opacity: 0;
          transform: translateX(100%);
          z-index: 0;
        }

        .carousel-item.active {
          opacity: 1;
          transform: translateX(0);
          z-index: 1;
        }

        /* Fade transition */
        .carousel-item.fade {
          transform: translateX(0);
        }

        .carousel-item.fade.transitioning {
          opacity: 0;
        }

        .carousel-item.fade.active {
          opacity: 1;
        }

        /* Slide transition */
        .carousel-item.slide-next {
          transform: translateX(100%);
        }

        .carousel-item.slide-prev {
          transform: translateX(-100%);
        }

        .carousel-item.slide-next.active,
        .carousel-item.slide-prev.active {
          transform: translateX(0);
        }

        /* Zoom transition */
        .carousel-item.zoom {
          transform: scale(1.1);
        }

        .carousel-item.zoom.transitioning {
          opacity: 0;
          transform: scale(1);
        }

        .carousel-item.zoom.active {
          opacity: 1;
          transform: scale(1);
        }

        /* Flip transition */
        .carousel-item.flip-next {
          transform: rotateY(90deg);
          transform-origin: right center;
        }

        .carousel-item.flip-prev {
          transform: rotateY(-90deg);
          transform-origin: left center;
        }

        .carousel-item.flip-next.active,
        .carousel-item.flip-prev.active {
          transform: rotateY(0deg);
        }

        /* Progress bar */
        .carousel-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          z-index: 2;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          width: 0%;
          animation: progress linear forwards;
        }

        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Enhanced controls */
        .carousel-control {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 3;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          opacity: 0.8;
        }

        .carousel-control:hover:not(:disabled) {
          background: white;
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .carousel-control:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .carousel-control.prev {
          left: 20px;
        }

        .carousel-control.next {
          right: 20px;
        }

        .control-icon {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          line-height: 1;
        }

        /* Enhanced indicators */
        .carousel-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          padding: 10px;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.2);
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          padding: 0;
        }

        .indicator:hover:not(.disabled) {
          background: rgba(0, 0, 0, 0.4);
          transform: scale(1.2);
        }

        .indicator.active {
          background: #4f46e5;
          transform: scale(1.3);
        }

        .indicator.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .indicator-progress {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        /* Enhanced captions */
        .carousel-caption {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          width: 80%;
        }

        .caption-content {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          padding: 15px 25px;
          border-radius: 25px;
          color: white;
          animation: fadeInUp 0.6s ease;
        }

        .caption-content h5 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 500;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .carousel-control {
            width: 40px;
            height: 40px;
          }

          .control-icon {
            font-size: 20px;
          }

          .carousel-control.prev {
            left: 10px;
          }

          .carousel-control.next {
            right: 10px;
          }

          .caption-content {
            padding: 10px 20px;
          }

          .caption-content h5 {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SiteImagesCarousel;