// components/ProductAboutSection.tsx
import React from 'react';
import {  ProductAbout } from '../../types';


const ProductAboutSection = ({ details }: { details: ProductAbout[] }) => {
  return (
    <div className="product-about-section">
      <h2 className="text-xl font-bold mb-4">About this item</h2>
      <ul className="space-y-2">
        {details.sort((a, b) => a.item_order - b.item_order).map((detail) => (
          
          <li key={detail.id} 
											
											className="p-3 border rounded bg-white flex items-center"
											>
											<span className="mr-3">☰</span>
											<span>{detail.about_text}</span>
											</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductAboutSection;


