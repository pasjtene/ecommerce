// hooks/useRecentlyViewed.ts
'use client';
import { useState, useEffect } from 'react';
import { Product } from '../types'

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';
const MAX_RECENT_ITEMS = 12;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load recently viewed products from localStorage on mount
  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        if (stored) {
          const products = JSON.parse(stored);
          setRecentlyViewed(products);
        }
      } catch (error) {
        console.error('Error loading recently viewed products:', error);
      }
    };

    loadRecentlyViewed();
  }, []);

  // Add a product to recently viewed
  const addToRecentlyViewed = (product: Product) => {
    try {
      setRecentlyViewed(prev => {
        // Remove the product if it already exists (to avoid duplicates)
        const filtered = prev.filter(p => p.ID !== product.ID);
        
        // Add the new product to the beginning
        const updated = [product, ...filtered];
        
        // Keep only the most recent items
        const trimmed = updated.slice(0, MAX_RECENT_ITEMS);
        
        // Save to localStorage
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));
        
        return trimmed;
      });
    } catch (error) {
      console.error('Error saving to recently viewed:', error);
    }
  };

  // Clear all recently viewed products
  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  };

  // Get recently viewed products excluding current product
  const getRecentProducts = (excludeProductId?: string) => {
    if (!excludeProductId) return recentlyViewed;
    return recentlyViewed.filter(product => product.ID.toString() !== excludeProductId);
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    getRecentProducts
  };
};