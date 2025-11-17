// /app/[lang]/product/[id]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import axios from 'axios';
import { Product, Shop } from '../../types';
import ProductDetailsClient from './ProductDetailsClient';

// Define the expected params type
type PageParams = {
  id: string;
  lang: string;
};

async function getProduct(id: string, lang: string): Promise<Product | null> {
  const productId = id?.toString().split('-').pop();
  if (!productId) return null;
  
  try {
    const API_URL = process.env.API_BASE_URL || "http://127.0.0.1:8888";
    const response = await axios.get<{ product: Product }>(
      `${API_URL}/products/${productId}?lang=${lang}`
    );
    return response.data.product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolvedParams = await params;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://talodu.com";
  const product = await getProduct(resolvedParams.id, resolvedParams.lang);
  
  if (!product) {
    return {
      title: 'Product Not Found | Talodu.com',
      description: 'The requested product could not be found.',
    };
  }

  // Get the first image URL and make it absolute
  const imageUrl = product.images?.[0]?.url 
    ? `${SITE_URL}${product.images[0].url}`
    : `${SITE_URL}/uploads/products/260/36490bed-1712-48d2-85d9-6d304000b8a9.jpeg`; // Fallback image
    //: `${SITE_URL}/images/logo.png`; // Fallback image
    

  const title = `${product.name} | Talodu.com`;
  const description = product.description 
    ? `${product.description.substring(0, 160)}...`
    : `Buy ${product.name} on Talodu.com`;

  const productUrl = `${SITE_URL}/${resolvedParams.lang}/product/${resolvedParams.id}`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      url: productUrl,
      siteName: 'Talodu.com',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.images?.[0]?.altText || product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
      creator: '@talodu', // Replace with our Twitter handle
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id, resolvedParams.lang);

  if (!product) {
    return (
      <div className="container my-5 text-center">
        <h1>Product Not Found</h1>
        <p>The product you are looking for does not exist or is unavailable.</p>
        <p><a href="/">Go back to homepage</a></p>
      </div>
    );
  }

  return <ProductDetailsClient initialProduct={product} shop={product.shop} />;
}