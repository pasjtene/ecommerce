// app/[lang]/admin/products/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContextNext';

interface Shop {
  ID: number;
  name: string;
}

interface Category {
  ID: number;
  name: string;
}

export default function CreateProduct() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    shopID: 0,
    categories: [] as Category[],
    isFeatured: false,
    featuredOrder: 0
  });
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  useEffect(() => {
    fetchShops();
    fetchCategories();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shops`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setShops(response.data.shops || []);
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/products`,
        {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          shop_id: formData.shopID,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      alert('Product created successfully');
      router.push('/admin/products');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to create product');
      } else {
        setError('Failed to create product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: Category) => {
    const isSelected = formData.categories.some(cat => cat.ID === category.ID);
    
    if (isSelected) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(cat => cat.ID !== category.ID)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Create New Product</h1>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => router.push('/admin/products')}
        >
          ← Back to Products
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="price" className="form-label">Price</label>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="stock" className="form-label">Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        id="stock"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="shop" className="form-label">Shop</label>
                  <select
                    className="form-select"
                    id="shop"
                    value={formData.shopID}
                    onChange={(e) => setFormData({ ...formData, shopID: parseInt(e.target.value) })}
                    required
                  >
                    <option value="">Select a shop</option>
                    {shops.map(shop => (
                      <option key={shop.ID} value={shop.ID}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Categories</label>
                  <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {categories.map(category => (
                      <div key={category.ID} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.categories.some(cat => cat.ID === category.ID)}
                          onChange={() => handleCategoryToggle(category)}
                          id={`category-${category.ID}`}
                        />
                        <label className="form-check-label" htmlFor={`category-${category.ID}`}>
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => router.push('/admin/products')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}