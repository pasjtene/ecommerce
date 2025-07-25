'use client'
import React, { useState, useEffect } from 'react';
import { User, Role, Product, Shop, ProductCategory } from '../../types'
import axios from 'axios';
//import { API_BASE_URL } from '../auth/api'

interface ProductEditProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductEditComponent = ({ product, onSave, onCancel }: ProductEditProps) => {
    const [shops, setShops] = useState<Shop[]>([]);

    const [editedProduct, setEditedProduct] = useState<Product>({ ...product,
    categories: product.categories || [],
    shop: product.shop || shops[0] || { ID: '', name: ''}
      });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch available categories and shops
    const fetchData = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";
        const [categoriesRes, shopsRes] = await Promise.all([
          axios.get(API_BASE_URL+'/categories'),
          axios.get(API_BASE_URL+'/shops')
        ]);
        setCategories(categoriesRes.data);
        setShops(shopsRes.data.shops);
        console.log("The shops :",shopsRes.data.shops)
        console.log("The categories :",categoriesRes.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleCategoryChange = (categoryId: number, isChecked: boolean) => {
    setEditedProduct(prev => {
      const currentCategories = [...prev.categories || []];
      if (isChecked) {
        const categoryToAdd = categories.find(c => c.ID === categoryId);
        if (categoryToAdd) currentCategories.push(categoryToAdd);
      } else {
        const index = currentCategories.findIndex(c => c.ID === categoryId);
        if (index !== -1) currentCategories.splice(index, 1);
      }
      return { ...prev, categories: currentCategories };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedProduct);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Edit Product</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={editedProduct.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Price</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={editedProduct.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Stock</label>
              <input
                type="number"
                className="form-control"
                name="stock"
                value={editedProduct.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={editedProduct.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Shop</label>
            <select
              className="form-select"
              name="shop"
              value={editedProduct.shop?.ID}
              onChange={(e) => {
                console.log("The selected product is: ",editedProduct)
                const selectedShop = shops.find(s => s.ID === Number(e.target.value));

                if (selectedShop) {
                  setEditedProduct(prev => ({
                    ...prev,
                    shop: selectedShop,
                    ShopID: selectedShop.ID
                  }));
                }
              }}
              required
            >
              {shops.map(shop => (
                <option key={shop.ID} value={shop.ID}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Categories</label>
            <div className="row">
              {categories.map(category => (
                <div key={category.ID} className="col-md-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`category-${category.ID}`}
                      checked={editedProduct.categories?.some(c => c.ID === category.ID)}
                      onChange={(e) => handleCategoryChange(category.ID, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`category-${category.ID}`}>
                      {category.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditComponent;