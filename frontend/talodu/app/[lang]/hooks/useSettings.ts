// app/[lang]/hooks/useSettings.ts
'use client';

import { useState, useEffect } from 'react';

interface DisplaySettings1 {
  showFeaturedProducts: boolean;
  showRecentlyViewed: boolean;
  showAllProducts: boolean;
  showAllImages: boolean;
  featuredProductsTitle: string;
  featuredProductsCount: number;
  recentlyViewedCount: number;
  showCarousel: boolean;
  carouselTransition: 'fade' | 'slide' | 'zoom' | 'flip';
  carouselInterval: number;
  carouselTransitionDuration: number;
}

interface DisplaySettings {
  showFeaturedProducts: boolean;
  showRecentlyViewed: boolean;
  showAllProducts: boolean;
  showAllImages: boolean;
  showCarousel: boolean;
  carouselAutoPlay: boolean;
  carouselInterval: number;
  carouselShowIndicators: boolean;
  carouselShowControls: boolean;
  carouselTransitionType: 'fade' | 'slide' | 'zoom' | 'flip';
  carouselTransitionDuration: number;
  featuredProductsTitle: string;
  featuredProductsCount: number;
  recentlyViewedCount: number;
}

export interface GlobalSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  currency: string;
  emailNotifications: boolean;
  displaySettings: DisplaySettings;
}



export const useSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';
        //const response = await fetch(`${API_BASE_URL}/admin/settings`);
        const response = await fetch(`${API_BASE_URL}/display/settings`);
        
        
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          setError('Failed to fetch settings');
        }
      } catch (err) {
        setError('Error loading settings');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};