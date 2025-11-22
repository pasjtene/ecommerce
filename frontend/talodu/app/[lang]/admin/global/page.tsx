
// app/[lang]/admin/global/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface DisplaySettings {
  showFeaturedProducts: boolean;
  showRecentlyViewed: boolean;
  showAllProducts: boolean;
  showAllImages: boolean;
  featuredProductsTitle: string;
  featuredProductsCount: number;
  recentlyViewedCount: number;
}

interface GlobalSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  currency: string;
  emailNotifications: boolean;
  displaySettings: DisplaySettings;
}

export default function GlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings>({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    currency: 'USD',
    emailNotifications: true,
    displaySettings: {
      showFeaturedProducts: true,
      showRecentlyViewed: true,
      showAllProducts: true,
      showAllImages: false,
      featuredProductsTitle: "Featured Products You'll Love",
      featuredProductsCount: 8,
      recentlyViewedCount: 8,
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  useEffect(() => {
    fetchSettings();
  }, []);

  // fetchSettings function
const fetchSettings = async () => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/admin/settings`);
    if (response.ok) {
      const data = await response.json();
      setSettings(data);
    } else {
      throw new Error('Failed to fetch settings');
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    setMessage('Error loading settings');
  }
};


//  handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');
  
  try {
    
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (response.ok) {
      const result = await response.json();
      setMessage('Settings saved successfully!');
      setSettings(result.settings); // Update with returned settings
      setTimeout(() => setMessage(''), 3000);
    } else {
      const error = await response.json();
      setMessage(error.error || 'Error saving settings');
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

  const handleDisplaySettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const field = name as keyof DisplaySettings;
    
    setSettings(prev => ({
      ...prev,
      displaySettings: {
        ...prev.displaySettings,
        [field]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                 type === 'number' ? parseInt(value) : value
      }
    }));
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
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

        <div className="card shadow-sm mb-4">
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

        {/* Display Settings Section */}
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Products Page Display Settings</h5>
            <small className="text-muted">Control which sections are shown on the products page</small>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    id="showFeaturedProducts"
                    name="showFeaturedProducts"
                    checked={settings.displaySettings.showFeaturedProducts}
                    onChange={handleDisplaySettingChange}
                    className="form-check-input"
                    disabled={loading}
                  />
                  <label htmlFor="showFeaturedProducts" className="form-check-label fw-medium">
                    Show Featured Products Section
                  </label>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    id="showRecentlyViewed"
                    name="showRecentlyViewed"
                    checked={settings.displaySettings.showRecentlyViewed}
                    onChange={handleDisplaySettingChange}
                    className="form-check-input"
                    disabled={loading}
                  />
                  <label htmlFor="showRecentlyViewed" className="form-check-label fw-medium">
                    Show Recently Viewed Section
                  </label>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    id="showAllProducts"
                    name="showAllProducts"
                    checked={settings.displaySettings.showAllProducts}
                    onChange={handleDisplaySettingChange}
                    className="form-check-input"
                    disabled={loading}
                  />
                  <label htmlFor="showAllProducts" className="form-check-label fw-medium">
                    Show All Products Section
                  </label>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    id="showAllImages"
                    name="showAllImages"
                    checked={settings.displaySettings.showAllImages}
                    onChange={handleDisplaySettingChange}
                    className="form-check-input"
                    disabled={loading}
                  />
                  <label htmlFor="showAllImages" className="form-check-label fw-medium">
                    Show All Images Section
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="row mt-4 pt-4 border-top">
              <div className="col-md-6 mb-3">
                <label htmlFor="featuredProductsTitle" className="form-label">
                  Featured Products Title
                </label>
                <input
                  type="text"
                  id="featuredProductsTitle"
                  name="featuredProductsTitle"
                  value={settings.displaySettings.featuredProductsTitle}
                  onChange={handleDisplaySettingChange}
                  className="form-control"
                  disabled={loading || !settings.displaySettings.showFeaturedProducts}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label htmlFor="featuredProductsCount" className="form-label">
                  Featured Products Count
                </label>
                <input
                  type="number"
                  id="featuredProductsCount"
                  name="featuredProductsCount"
                  value={settings.displaySettings.featuredProductsCount}
                  onChange={handleDisplaySettingChange}
                  className="form-control"
                  min="1"
                  max="20"
                  disabled={loading || !settings.displaySettings.showFeaturedProducts}
                />
              </div>

              <div className="col-md-3 mb-3">
                <label htmlFor="recentlyViewedCount" className="form-label">
                  Recently Viewed Count
                </label>
                <input
                  type="number"
                  id="recentlyViewedCount"
                  name="recentlyViewedCount"
                  value={settings.displaySettings.recentlyViewedCount}
                  onChange={handleDisplaySettingChange}
                  className="form-control"
                  min="1"
                  max="20"
                  disabled={loading || !settings.displaySettings.showRecentlyViewed}
                />
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
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  'Save Display Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}