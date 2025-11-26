import { useState, useEffect } from 'react';
import axios from 'axios';

export interface SiteImage {
  ID: number;
  url: string;
  altText: string;
  isVisible: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useSiteImages = () => {
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  const fetchSiteImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/site-images/visible`);
      setSiteImages(response.data.images || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch site images');
      console.error('Error fetching site images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteImages();
  }, []);

  return {
    siteImages,
    loading,
    error,
    refetch: fetchSiteImages
  };
};