// app/[lang]/product/[id]/translations/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductEditComponent from './ProductEditComponent';
import { Product } from '../../../types';
import LoadingSpinner from '../../../../api/LoadingSpinner';

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

  	const handleSave = async (updatedProduct: Product) => {
		console.log('The prduct to update: ', updatedProduct);
		setLoading(true);
		try {
			const response = await axios.put(API_BASE_URL + `/products/${product?.ID}`, updatedProduct);
			//setCurrentProduct(response.data.product);
			setLoading(false);
			//router.push(`/product/${response.data.product.Slug}`);
			//setIsEditing(false);
			// Show success toast
			toast.success(`Product updated savedsuccessfully`);
		} catch (error) {
			toast.error('Failed to update products');
			console.log(error);
			// Show error toast
		}
	};

	if (loading) {
		return <LoadingSpinner />;
	}

  if (loading || !product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-4">
      <button 
        onClick={() => router.push(`/${params.lang}/product/${product.Slug}`)}
        className="btn btn-outline-secondary mb-4"
      >
        Back to Product
      </button>
      
      <ProductEditComponent
        product={product}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}