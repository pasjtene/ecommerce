// app/product/[id]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import axios from 'axios';
import { Product, Shop } from '../../../types';
import ShopEdit from './ShopEdit';


// Define the expected params type
type PageParams = {
  id: string;
};


async function getShop(id: string): Promise<Shop | null> {
    //Id is the last part of product slug which is a string separated by "_". This string is constructed at the backend 
    //When a product is created or updated
  const shopId = id?.toString().split('-').pop();
  if (!shopId) return null;
  
  try {
    const API_URL = process.env.API_BASE_URL || "http://127.0.0.1:8888";
    const response = await axios.get<{ shop: Shop }>(
      `${API_URL}/shops/${shopId}`
    );
    return response.data.shop;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolvedParams = await params;
  const SITE_NAME = "https://talodu.com";
  const shop = await getShop(resolvedParams.id);
  
  return {
    title: shop ? `${shop.name} | Talodu.com }` : 'Product Not Found | Talodu.com',
    description: shop ? `${shop.description} | Talodu.com - by ${shop.moto}` : 'Product Not Found | Talodu.com',
    //description: `product?.description + 'by' + ${product.shop.name}` || 'The requested product could not be found.',
    ...(shop ? {
      openGraph: {
        type: 'website',
        url: `https://talodu.com/product/${resolvedParams.id}`,
        siteName: 'Talodu.com',
      },
      twitter: {
        card: 'summary_large_image',
        title: shop.name,
        description: shop.description || `Discover ${shop.name} on Talodu`,
        //images: product.images?.[0]?.url ? [SITE_NAME+product.images[0].url] : [],
      }
    } : {})
  };
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  //const product = await getProduct(resolvedParams.id);
  const shop= await getShop(resolvedParams.id);

  if (!shop) {
    return (
      <div className="container my-5 text-center">
        <h1>Shop Not Found</h1>
        <p>The product you are looking for does not exist or is unavailable.</p>
        <p><a href="/">Go back to homepage</a></p>
      </div>
    );
  }

  return <ShopEdit shop={shop} />;


}