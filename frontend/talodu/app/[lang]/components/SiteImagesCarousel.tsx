import React, { useState, useEffect, useCallback } from 'react';
import { SiteImage } from '../hooks/useSiteImages';
import styles from './carousel.module.css';

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
  transitionType = 'fade'
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
    }, 50);
  }, [currentIndex, isTransitioning]);

  // Reset transitioning state after animation completes
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, transitionDuration]);

  // Auto-play functionality
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

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carousel}>
        {/* Carousel items */}
        <div className={styles.carouselInner}>
          {images.map((image, index) => (
            <div
              key={image.ID}
              className={`${styles.carouselItem} ${styles[transitionType]} ${styles[direction]} ${
                index === currentIndex ? styles.active : ''
              }`}
              style={{
                transition: `all ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
              }}
            >
              <img
                src={API_BASE_URL + image.url}
                className={styles.carouselImage}
                alt={image.altText || 'Site image'}
              />
              {/* Optional: Add captions */}
              {image.altText && (
                <div className={styles.carouselCaption}>
                  <div className={styles.captionContent}>
                    <h5>{image.altText}</h5>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar for auto-play */}
        {autoPlay && images.length > 1 && (
          <div className={styles.carouselProgress}>
            <div 
              className={styles.progressBar}
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
              className={`${styles.carouselControl} ${styles.prev}`}
              type="button"
              onClick={goToPrevious}
              disabled={isTransitioning}
            >
              <span className={styles.controlIcon}>‹</span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className={`${styles.carouselControl} ${styles.next}`}
              type="button"
              onClick={goToNext}
              disabled={isTransitioning}
            >
              <span className={styles.controlIcon}>›</span>
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className={styles.carouselIndicators}>
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''} ${
                isTransitioning ? styles.disabled : ''
              }`}
              onClick={() => !isTransitioning && goToSlide(index, index > currentIndex ? 'next' : 'prev')}
              aria-label={`Go to slide ${index + 1}`}
              disabled={isTransitioning}
            >
              <div className={styles.indicatorProgress} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SiteImagesCarousel;