// app/[lang]/product/[id]/abouts/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductAboutsEditor from './ProductAboutsEditor';
import { Product } from '../../../types';
import LoadingSpinner from '../../../../api/LoadingSpinner';

import dynamic from 'next/dynamic';
const ProductAboutTranslationsText = dynamic(() => import('./ProductAboutTranslationsText'), {
	ssr: false,
});

export default function ProductTranslationPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';
  const [token, setToken] = useState<string | null>(null);
  

  useEffect(() => {
    // Only access localStorage on client side
    setToken(localStorage.getItem('j_auth_token'));
  }, []);

  const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/products/${params.id}`,
          {
            params: { lang: params.lang },
            headers: {
              Authorization: `${token}`
            }
          }
        );
        setProduct(response.data.product);
        //console.log("The product is: ",response.data.product)
      } catch (error) {
        toast.error('Failed to load product');
        //router.back();
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    if (!token) return; // Don't fetch until we have the token
    
    fetchProduct();
  }, [params.id, token]);

  

    if (loading || !product) {
        return <LoadingSpinner />;
    }


  return (
    <div className="container py-4">
      <button 
        onClick={() => router.push(`/${params.lang}/product/${product.Slug}`)}
        className="btn btn-outline-secondary mb-4"
      >
        Back to Product
      </button>
      
      <ProductAboutsEditor
        productId={product.ID}
        initialDetails={product.abouts}
    />
    	<div className='container mt-4'>
									
        <ProductAboutTranslationsText
            productId={product.ID}
            abouts={product.abouts}
            languages={['en', 'fr', 'es']}
        />
									
        </div>
    </div>
  );
}