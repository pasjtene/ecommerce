// app/[lang]/admin/products/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../../../contexts/AuthContextNext';

interface Product {
  ID: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  slug: string;
  isFeatured: boolean;
  featuredOrder: number;
  shopID: number;
  shop: {
    ID: number;
    name: string;
  };
  categories: Category[];
}

interface Category {
  ID: number;
  name: string;
}

interface Shop {
  ID: number;
  name: string;
}

export default function EditProduct() {
  const { user, token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  useEffect(() => {
    fetchProduct();
    fetchShops();
    fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setProduct(response.data.product);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch product');
      } else {
        setError('Failed to fetch product');
      }
    } finally {
      setLoading(false);
    }
  };

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
    if (!product) return;

    try {
      setSaving(true);
      await axios.put(
        `${API_BASE_URL}/products/${productId}`,
        {
          ID: product.ID,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          //shop_id: product.shopID,
          ShopID: product.shopID,
          categories: product.categories,
          shop: product.shop,
          
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      alert('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to update product');
      } else {
        setError('Failed to update product');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category: Category) => {
    if (!product) return;

    const isSelected = product.categories.some(cat => cat.ID === category.ID);
    
    if (isSelected) {
      setProduct({
        ...product,
        categories: product.categories.filter(cat => cat.ID !== category.ID)
      });
    } else {
      setProduct({
        ...product,
        categories: [...product.categories, category]
      });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="alert alert-danger" role="alert">
        Product not found
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Edit Product</h1>
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
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows={3}
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
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
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
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
                        value={product.stock}
                        onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
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
                    value={product.shopID}
                    onChange={(e) => setProduct({ ...product, shopID: parseInt(e.target.value) })}
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
                          checked={product.categories.some(cat => cat.ID === category.ID)}
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

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={product.isFeatured}
                      onChange={(e) => setProduct({ ...product, isFeatured: e.target.checked })}
                      id="isFeatured"
                    />
                    <label className="form-check-label" htmlFor="isFeatured">
                      Featured Product
                    </label>
                  </div>
                </div>

                {product.isFeatured && (
                  <div className="mb-3">
                    <label htmlFor="featuredOrder" className="form-label">Featured Order</label>
                    <input
                      type="number"
                      className="form-control"
                      id="featuredOrder"
                      value={product.featuredOrder || 0}
                      onChange={(e) => setProduct({ ...product, featuredOrder: parseInt(e.target.value) || 0 })}
                    />
                    <div className="form-text">
                      Lower numbers appear first in featured products list
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  'Update Product'
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