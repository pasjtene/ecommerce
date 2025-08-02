//app/[lang]/product/[id]/edit/ProductEditComponent.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { Product, Shop, ProductCategory } from '../../../types'
import axios from 'axios';
import { useParams } from 'next/navigation';
import LoadingSpinner from '../../../../api/LoadingSpinner';
import { toast } from 'react-toastify';

interface ProductEditProps {
  product: Product;
  onSave: (product: Product) => Promise<void>;
  onCancel: () => void;
}

interface Dictionary {
  product_edit: {
    edit_product: string;
    price: string;
    name: string;
    stock: string;
    description: string;
    shop: string;
    categories: string;
    cancel: string;
    save_changes: string;
    saving: string;
    fetch_error: string;
  };
}

const defaultDictionary: Dictionary = {
  product_edit: {
    edit_product: 'Edit product',
    price: "Price",
    name: "Name",
    stock: "Stock",
    description: "Description",
    shop: "Shop",
    categories: "Categories",
    cancel: "Cancel",
    save_changes: "Save Changes",
    saving: "Saving...",
    fetch_error: "Error loading data"
  },
};

const ProductEditComponent = ({ product, onSave, onCancel }: ProductEditProps) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const params = useParams();
  const [translation, setDictionary] = useState<Dictionary>(defaultDictionary);
  const [editedProduct, setEditedProduct] = useState<Product>({ 
    ...product,
    categories: product.categories || [],
    shop: product.shop || { ID: 0, name: '' }
  });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
   const [token, setToken] = useState<string | null>(null);
  

  useEffect(() => {
    // Only access localStorage on client side
    setToken(localStorage.getItem('j_auth_token'));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";
        const [categoriesRes, shopsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/shops`,
          {
            headers: {
              Authorization: `${token}`
            }
          })
        ]);
        
        setCategories(categoriesRes.data);
        setShops(shopsRes.data.shops);
        
        // Ensure shop is set correctly after fetching
        if (product.shop?.ID) {
          const currentShop = shopsRes.data.shops.find((s: Shop) => s.ID === product.shop.ID);
          if (currentShop) {
            setEditedProduct(prev => ({
              ...prev,
              shop: currentShop
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(translation.product_edit.fetch_error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [product.shop?.ID]);

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await import(`../../../translations/${params.lang}.json`);
        setDictionary(dict.default);
      } catch (error) {
        console.error('Error loading translations:', error);
      }
    };
    loadDictionary();
  }, [params.lang]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(editedProduct);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <LoadingSpinner />;
  }

  if (!translation) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>{translation.product_edit.edit_product}</h3>
        <div>
          <h2 className="mb-4">{product.name}</h2>
        </div>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">{translation.product_edit.name}</label>
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
              <label className="form-label">{translation.product_edit.price}</label>
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
              <label className="form-label">{translation.product_edit.stock}</label>
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
            <label className="form-label">{translation.product_edit.description}</label>
            <textarea
              className="form-control"
              name="description"
              value={editedProduct.description || ''}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">{translation.product_edit.shop}</label>
            <select
              className="form-select"
              name="shop"
              value={editedProduct.shop?.ID || ''}
              onChange={(e) => {
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
              disabled={isLoading}
            >
              <option value="">{translation.product_edit.shop}</option>
              {shops.map(shop => (
                <option key={shop.ID} value={shop.ID}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">{translation.product_edit.categories}</label>
            {categories.length > 0 ? (
              <div className="row">
                {categories.map(category => (
                  <div key={category.ID} className="col-md-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`category-${category.ID}`}
                        checked={editedProduct.categories?.some(c => c.ID === category.ID) || false}
                        onChange={(e) => handleCategoryChange(category.ID, e.target.checked)}
                        disabled={isLoading}
                      />
                      <label className="form-check-label" htmlFor={`category-${category.ID}`}>
                        {category.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No categories available</p>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
              disabled={isLoading}
            >
              {translation.product_edit.cancel}
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? translation.product_edit.saving : translation.product_edit.save_changes}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditComponent;