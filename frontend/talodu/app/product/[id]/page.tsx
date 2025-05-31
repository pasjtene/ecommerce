// app/product/[id]/page.tsx
// This file is a Server Component by default, no 'use client' here.

import { Metadata } from 'next';
import axios from 'axios';
import { Product } from '../../../src/pages/presentation/auth/types'; // Import necessary types
import ProductDetailsClient from './ProductDetailsClient'; // Import the new Client Component

//interface ProductPageProps {
 // params: {
  //  id: string; // The dynamic segment from the URL, e.g., 'product-name-123'
 // };
  // searchParams: { [key: string]: string | string[] | undefined }; // If you use search params
//}

// --- Data Fetching for Metadata and Page Content ---
async function getProduct(id: string): Promise<Product | null> {
  const productId = id?.toString().split('-').pop(); // Extract numeric ID
  if (!productId) {
    return null;
  }
  try {
    // This runs on the server, so you can use your direct backend API URL
    // Make sure process.env.API_BASE_URL is available in your build environment
    const API_URL = process.env.API_BASE_URL || "http://127.0.0.1:8888";
    const response = await axios.get<{ product: Product }>(
      `${API_URL}/products/${productId}`
    );
    return response.data.product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null; // Or throw an error for Next.js to handle (e.g., 404)
  }
}

// --- Dynamic Metadata Generation (Server-Side) ---
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const product = await getProduct(params.id);
  
    if (!product) {
      return {
        title: 'Product Not Found | Talodu',
        description: 'The requested product could not be found.',
      };
    }

  const metadataBase = new URL('https://talodu.com');

  return {
    metadataBase, // Set the base URL for relative paths in metadata
    title: `${product.name} | Talodu`,
    description: product.description || `Discover ${product.name} and more products on Talodu, your online supermarket.`,
    openGraph: {
      title: product.name,
      description: product.description || `Discover ${product.name} and more products on Talodu.`,
      // Use 'website' or 'article' as a fallback for 'type'
      // The Open Graph 'product' type is often handled via specific properties, not the main 'type' field
      type: 'website', // Use a valid Open Graph type
      url: new URL(`/product/${product.Slug}`, metadataBase).toString(), // Ensure full URL
      siteName: 'Talodu', // Your site name
      images: product.images && product.images.length > 0 ? [
        {
          url: new URL(product.images[0].url, metadataBase).toString(), // Ensure full URL for images
          alt: product.images[0].altText || product.name,
          // You might also want to include width and height for images for better rendering
          // width: 1200, // Example dimensions
          // height: 630,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Talodu', // Your Twitter handle
      title: product.name,
      description: product.description || `Discover ${product.name} and more products on Talodu.`,
      images: product.images && product.images.length > 0 ? [product.images[0].url] : [],
    },
  };
}


// --- Page Component (Server Component) ---
// And here, directly type the destructured params:
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = await getProduct(params.id);
  
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