'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContextNext';

interface Role {
  ID: number;
  Name: string;
  Description?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export default function RolesList() {
  const { token } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/roles`, {
        headers: { 'Authorization': `${token}` }
      });
      setRoles(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to fetch roles');
      } else {
        setError('Failed to fetch roles');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/roles/${roleId}`, {
        headers: { 'Authorization': `${token}` }
      });
      setRoles(roles.filter(role => role.ID !== roleId));
      alert('Role deleted successfully');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || 'Failed to delete role');
      } else {
        alert('Failed to delete role');
      }
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Role Management</h1>
        <Link href="/admin/roles/create" className="btn btn-primary">
          + Create New Role
        </Link>
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
          {roles.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No roles found</p>
              <Link href="/admin/roles/create" className="btn btn-primary mt-2">
                Create First Role
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.ID}>
                      <td>{role.ID}</td>
                      <td>
                        <strong>{role.Name}</strong>
                      </td>
                      <td>{role.Description || 'No description'}</td>
                      <td>
                        {role.CreatedAt ? new Date(role.CreatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Link
                            href={`/admin/roles/edit/${role.ID}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(role.ID)}
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
          )}
        </div>
      </div>
    </div>
  );
}