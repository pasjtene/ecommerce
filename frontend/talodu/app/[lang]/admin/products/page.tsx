//app/[lang]/admin/products/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContextNext';

interface Product {
  ID: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  slug: string;
  isFeatured: boolean;
  featuredOrder: number;
  shop: {
    ID: number;
    name: string;
    Slug?: string;
  };
  categories: Category[];
  images: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

interface Category {
  ID: number;
  name: string;
}

interface ProductImage {
  ID: number;
  url: string;
  alt_text?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface ProductsResponse {
  products: Product[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function ProductsList() {
  const { user, token, showLogin, onRequireLogin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingFeatured, setUpdatingFeatured] = useState<number | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  const fetchProducts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get<ProductsResponse>(`${API_BASE_URL}/products/admin`, {
        params: {
          page,
          limit: pagination.limit,
          ...(search && { search })
        },
        headers: {
          Authorization: `${token}`,
        },
      });

      setProducts(response.data.products);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch products');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage, searchTerm);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      setUpdatingFeatured(product.ID);
      const newFeaturedStatus = !product.isFeatured;
      
      const response = await axios.put(
        `${API_BASE_URL}/products/${product.ID}/featured`,
        {
          isFeatured: newFeaturedStatus,
          featuredOrder: newFeaturedStatus ? (product.featuredOrder || 0) : 0
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      // Update local state
      setProducts(prev => prev.map(p => 
        p.ID === product.ID 
          ? { ...p, isFeatured: newFeaturedStatus }
          : p
      ));

      // Show success message
      alert(`Product ${newFeaturedStatus ? 'added to' : 'removed from'} featured products`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to update featured status');
      } else {
        setError('Failed to update featured status');
      }
    } finally {
      setUpdatingFeatured(null);
    }
  };

  const handleUpdateFeaturedOrder = async (product: Product, order: number) => {
    try {
      await axios.put(
        `${API_BASE_URL}/products/${product.ID}/featured`,
        {
          isFeatured: product.isFeatured,
          featuredOrder: order
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      // Update local state
      setProducts(prev => prev.map(p => 
        p.ID === product.ID ? { ...p, featuredOrder: order } : p
      ));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to update featured order');
      } else {
        setError('Failed to update featured order');
      }
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      
      setProducts(products.filter(product => product.ID !== productId));
      alert('Product deleted successfully');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'Failed to delete product');
      } else {
        setError('Failed to delete product');
      }
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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error: {error}
        <button 
          type="button" 
          className="btn-close float-end" 
          onClick={() => setError('')}
          aria-label="Close"
        ></button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Product Management</h1>
        <Link href="/admin/products/create" className="btn btn-primary">
          + Add New Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search products by name, description, or shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                Search
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  fetchProducts(1, '');
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body">
          {products.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No products found</p>
              {searchTerm && (
                <button
                  className="btn btn-outline-primary mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    fetchProducts(1, '');
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Shop</th>
                      <th>Featured</th>
                      <th>Featured Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.ID}>
                        <td>{product.ID}</td>
                        <td>
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={API_BASE_URL+ product.images[0].url}
                              alt={product.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              className="rounded"
                            />
                          ) : (
                            <div 
                              className="bg-light text-muted d-flex align-items-center justify-content-center"
                              style={{ width: '50px', height: '50px' }}
                            >
                              No Image
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{product.name}</strong>
                          <br />
                          <small className="text-muted text-truncate" style={{ maxWidth: '200px' }}>
                            {product.description?.substring(0, 50)}...
                          </small>
                        </td>
                        <td>${product.price}</td>
                        <td>
                          <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td>{product.shop?.name}</td>
                        <td>
                          {product.isFeatured ? (
                            <span className="badge bg-warning text-dark">Featured</span>
                          ) : (
                            <span className="badge bg-secondary">No</span>
                          )}
                        </td>
                        <td>
                          {product.isFeatured && (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              style={{ width: '80px' }}
                              value={product.featuredOrder || 0}
                              onChange={(e) => handleUpdateFeaturedOrder(product, parseInt(e.target.value) || 0)}
                            />
                          )}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className={`btn btn-sm ${
                                product.isFeatured ? 'btn-warning' : 'btn-outline-warning'
                              }`}
                              disabled={updatingFeatured === product.ID}
                              onClick={() => handleToggleFeatured(product)}
                              title={product.isFeatured ? 'Remove from featured' : 'Make featured'}
                            >
                              {updatingFeatured === product.ID ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : product.isFeatured ? (
                                '★'
                              ) : (
                                '☆'
                              )}
                            </button>
                            <Link
                              href={`/admin/products/edit/${product.ID}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              Edit
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteProduct(product.ID)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <li
                        key={pageNum}
                        className={`page-item ${pagination.page === pageNum ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}

              <div className="text-muted text-center mt-2">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{' '}
                {pagination.totalItems} products
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}