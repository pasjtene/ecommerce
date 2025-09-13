'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../../../contexts/AuthContextNext';

interface Role {
  ID: number;
  Name: string;
  Description?: string;
}

export default function EditRole() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const roleId = params.id;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRole();
  }, [roleId]);

  const fetchRole = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles/${roleId}`, {
        headers: { 'Authorization': `${token}` }
      });
      setRole(response.data.role || response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to fetch role');
      } else {
        setError('Failed to fetch role');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setSaving(true);
    setError('');

    try {
      const response = await axios.put(`${API_BASE_URL}/roles/${roleId}`, {
        name: role.Name,
        description: role.Description
      }, {
        headers: { 'Authorization': `${token}` }
      });

      if (response.status === 200) {
        alert('Role updated successfully!');
        router.push('/admin/roles');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to update role');
      } else {
        setError('Failed to update role');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!role) return;
    
    setRole(prev => ({
      ...prev!,
      [e.target.name]: e.target.value
    }));
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

  if (!role) {
    return (
      <div className="alert alert-danger" role="alert">
        Role not found
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">Edit Role: {role.Name}</h1>
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.back()}
          >
            ← Back to Roles
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            <button 
              type="button" 
              className="btn-close float-end" 
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Role Name *</label>
                <input
                  type="text"
                  name="Name"
                  className="form-control"
                  value={role.Name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Description</label>
                <textarea
                  name="Description"
                  className="form-control"
                  value={role.Description || ''}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </button>
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
                    'Update Role'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
                 