// components/ProductAboutSection.tsx
import React from 'react';
import {  ProductAbout } from '../../types';


const ProductAboutSection = ({ abouts }: { abouts: ProductAbout[] }) => {
  return (
    <div className="product-about-section">
      <h6 className="text-secondary text-s mb-4">More details About this item</h6>
      <ul className="space-y-2">
        {abouts?.sort((a, b) => a.item_order - b.item_order).map((about) => (
          
          <li key={about.id} 
											
											className="p-3 border rounded bg-white flex items-center"
											>
											<span className="mr-3">☰</span>
											<span>{about.about_text}</span>
											</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductAboutSection;


