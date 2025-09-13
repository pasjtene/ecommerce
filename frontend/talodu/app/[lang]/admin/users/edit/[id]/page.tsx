//[lang]/admin/users/edit/id/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../../../contexts/AuthContextNext';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: Role[];
  pin?: number;
}

interface Role {
  ID: number;
  Name: string;
  Description?: string;
}

interface AvailableRole {
  ID: number;           
  Name: string;   
  Description?: string; 
}

interface UpdateUserRequest {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: number[];
}

interface ApiResponse {
  message: string;
  user: User;
}

export default function EditUser() {
  const { token, showLogin, onRequireLogin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  const [user, setUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<AvailableRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchAvailableRoles();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get<ApiResponse>(API_BASE_URL + `/users/${userId}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      setUser(response.data.user);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          onRequireLogin?.();
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to fetch user');
        }
      } else {
        setError('Failed to fetch user');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const response = await axios.get(API_BASE_URL +'/users/roles', {
        headers: {
          'Authorization': `${token}`
        }
      });
      setAvailableRoles(response.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');

    try {
      const updateData: UpdateUserRequest = {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        roles: user.roles.map(role => role.ID)
      };

      const response = await axios.put(API_BASE_URL +`/users/${userId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        alert('User updated successfully!');
        router.push('/admin/users');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          onRequireLogin?.();
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to update user');
        }
      } else {
        setError('Failed to update user');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (!user) return;

    if (checked) {
      const roleToAdd = availableRoles.find(role => role.ID === roleId);
      if (roleToAdd) {
        setUser({
          ...user,
          roles: [...user.roles, { 
            ID: roleToAdd.ID, 
            Name: roleToAdd.Name, 
            Description: roleToAdd.Description 
          }]
        });
      }
    } else {
      setUser({
        ...user,
        roles: user.roles.filter(role => role.ID !== roleId)
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

  if (!user) {
    return (
      <div className="alert alert-danger" role="alert">
        User not found
        <button 
          type="button" 
          className="btn-close float-end" 
          onClick={() => router.back()}
          aria-label="Close"
        ></button>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">Edit User: {user.username}</h1>
          <button
            className="btn btn-outline-secondary"
            onClick={() => router.back()}
          >
            ← Back to Users
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
                <div className="col-md-6 mb-3">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.username || ''}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={user.email || ''}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.first_name || ''}
                    onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.last_name || ''}
                    onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Roles *</label>
                {availableRoles.length === 0 ? (
                  <div className="text-muted">Loading roles...</div>
                ) : (
                  <div className="row">
                    {availableRoles.map((role) => (
                      <div key={role.ID} className="col-md-6 mb-2">
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`role-${role.ID}`}
                            checked={user.roles.some(r => r.ID === role.ID)}
                            onChange={(e) => handleRoleChange(role.ID, e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor={`role-${role.ID}`}>
                            {role.Name}
                            {role.Description && (
                              <small className="text-muted d-block">{role.Description}</small>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    'Update User'
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