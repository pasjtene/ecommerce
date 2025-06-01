// app/product/[id]/page.tsx
import { Metadata } from 'next';
import axios from 'axios';
import { Product } from '../../../src/pages/presentation/auth/types';
import ProductDetailsClient from './ProductDetailsClient';

// Define the expected params type
type PageParams = {
  id: string;
};

async function getProduct(id: string): Promise<Product | null> {
  const productId = id?.toString().split('-').pop();
  if (!productId) return null;
  
  try {
    const API_URL = process.env.API_BASE_URL || "http://127.0.0.1:8888";
    const response = await axios.get<{ product: Product }>(
      `${API_URL}/products/${productId}`
    );
    return response.data.product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolvedParams = await params;
  const SITE_NAME = "https://talodu.com";
  const product = await getProduct(resolvedParams.id);
  
  return {
    title: product ? `${product.name} | Talodu.com` : 'Product Not Found | Talodu',
    description: product?.description || 'The requested product could not be found.',
    ...(product ? {
      openGraph: {
        type: 'website',
        url: `https://talodu.com/product/${resolvedParams.id}`,
        siteName: 'Talodu.com',
        images: product.images?.[0]?.url ? [{
          //url: SITE_NAME+product.images[0].url,
          url: `https://talodu.com${product.images[0].url}`,
          alt: product.images[0].altText || product.name,
        }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Discover ${product.name} on Talodu`,
        images: product.images?.[0]?.url ? [SITE_NAME+product.images[0].url] : [],
      }
    } : {})
  };
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return (
      <div className="container my-5 text-center">
        <h1>Product Not Found</h1>
        <p>The product you are looking for does not exist or is unavailable.</p>
        <p><a href="/">Go back to homepage</a></p>
      </div>
    );
  }

  return <ProductDetailsClient initialProduct={product} />;
}