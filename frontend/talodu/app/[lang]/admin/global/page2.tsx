//admin/global/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function GlobalSettings() {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    currency: 'USD',
    emailNotifications: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Error loading settings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">Global Settings</h1>
          <button 
            className="btn btn-outline-secondary"
            onClick={fetchSettings}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
            {message}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage('')}
            ></button>
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Site Configuration</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="siteName" className="form-label">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="currency" className="form-label">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="siteDescription" className="form-label">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  className="form-control"
                  disabled={loading}
                  placeholder="Brief description of your ecommerce site..."
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleChange}
                      className="form-check-input"
                      disabled={loading}
                    />
                    <label htmlFor="maintenanceMode" className="form-check-label">
                      Maintenance Mode
                    </label>
                  </div>
                  <small className="form-text text-muted">
                    When enabled, the site will be in maintenance mode
                  </small>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      className="form-check-input"
                      disabled={loading}
                    />
                    <label htmlFor="emailNotifications" className="form-check-label">
                      Email Notifications
                    </label>
                  </div>
                  <small className="form-text text-muted">
                    Receive email notifications for important events
                  </small>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={fetchSettings}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
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