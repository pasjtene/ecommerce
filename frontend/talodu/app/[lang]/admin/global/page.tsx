
// app/[lang]/admin/global/page.tsx
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContextNext';

interface DisplaySettings {
  showFeaturedProducts: boolean;
  showRecentlyViewed: boolean;
  showAllProducts: boolean;
  showAllImages: boolean;
  featuredProductsTitle: string;
  featuredProductsCount: number;
  recentlyViewedCount: number;
  showCarousel: boolean;
  carouselTransition: 'fade' | 'slide' | 'zoom' | 'flip';
  carouselInterval: number;
  carouselTransitionDuration: number;
}

interface GlobalSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  currency: string;
  emailNotifications: boolean;
  displaySettings: DisplaySettings;
}

interface SiteImage {
  ID: number;
  url: string;
  altText: string;
  isVisible: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SiteLogo {
  ID: number;
  url: string;
  altText: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}



export default function GlobalSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<GlobalSettings>({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    currency: 'USD',
    emailNotifications: true,
    displaySettings: {
      showFeaturedProducts: true,
      showCarousel: true,
      showRecentlyViewed: true,
      showAllProducts: true,
      showAllImages: false,
      featuredProductsTitle: "Featured Products You'll Love",
      featuredProductsCount: 8,
      recentlyViewedCount: 8,
      carouselTransition: 'fade',
      carouselTransitionDuration: 600,
      carouselInterval: 5000

    }
  });

  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [siteLogos, setSiteLogos] = useState<SiteLogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageLoading, setImageLoading] = useState<number | null>(null);
  const [logoLoading, setLogoLoading] = useState<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingLogos, setUploadingLogos] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  useEffect(() => {
    fetchSettings();
    fetchSiteImages();
    fetchSiteLogos();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setSettings(response.data);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      setMessage(error.response?.data?.error || 'Error loading settings');
    }
  };

  const fetchSiteImages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/site-images`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setSiteImages(response.data.images || []);
    } catch (error: any) {
      console.error('Error fetching site images:', error);
      setMessage(error.response?.data?.error || 'Error loading site images');
    }
  };

  const fetchSiteLogos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/site-logos`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setSiteLogos(response.data.logos || []);
    } catch (error: any) {
      console.error('Error fetching site logos:', error);
      setMessage(error.response?.data?.error || 'Error loading site logos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/settings`, settings, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setMessage('Settings saved successfully!');
      setSettings(response.data.settings);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setMessage(error.response?.data?.error || 'Error saving settings');
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

  // Site Images Functions
  const handleUploadSiteImages = async (files: FileList) => {
    if (files.length === 0) return;

    setUploadingImages(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/site-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${token}`,
        },
      });

      setSiteImages(prev => [...prev, ...response.data.images]);
      setMessage('Site images uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error uploading site images:', error);
      setMessage(error.response?.data?.error || 'Error uploading site images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleToggleImageVisibility = async (imageId: number) => {
    setImageLoading(imageId);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/site-images/${imageId}/visibility`, 
        {}, 
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setSiteImages(prev => prev.map(img => 
        img.ID === imageId ? response.data.image : img
      ));
    } catch (error: any) {
      console.error('Error toggling image visibility:', error);
      setMessage(error.response?.data?.error || 'Error updating image visibility');
    } finally {
      setImageLoading(null);
    }
  };

  const handleDeleteSiteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setImageLoading(imageId);
    try {
      await axios.delete(`${API_BASE_URL}/admin/site-images/${imageId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setSiteImages(prev => prev.filter(img => img.ID !== imageId));
      setMessage('Image deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      setMessage(error.response?.data?.error || 'Error deleting image');
    } finally {
      setImageLoading(null);
    }
  };

  // Site Logos Functions
  const handleUploadSiteLogos = async (files: FileList) => {
    if (files.length === 0) return;

    setUploadingLogos(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('logos', files[i]);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/site-logos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${token}`,
        },
      });

      setSiteLogos(prev => [...prev, ...response.data.logos]);
      setMessage('Site logos uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error uploading site logos:', error);
      setMessage(error.response?.data?.error || 'Error uploading site logos');
    } finally {
      setUploadingLogos(false);
    }
  };

  const handleSetPrimaryLogo = async (logoId: number) => {
    setLogoLoading(logoId);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/site-logos/${logoId}/primary`, 
        {}, 
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      // Update all logos - set the selected one as primary, others as non-primary
      setSiteLogos(prev => prev.map(logo => ({
        ...logo,
        isPrimary: logo.ID === logoId
      })));
      setMessage('Primary logo set successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error setting primary logo:', error);
      setMessage(error.response?.data?.error || 'Error setting primary logo');
    } finally {
      setLogoLoading(null);
    }
  };

  const handleDeleteSiteLogo = async (logoId: number) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;

    setLogoLoading(logoId);
    try {
      await axios.delete(`${API_BASE_URL}/admin/site-logos/${logoId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setSiteLogos(prev => prev.filter(logo => logo.ID !== logoId));
      setMessage('Logo deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      setMessage(error.response?.data?.error || 'Error deleting logo');
    } finally {
      setLogoLoading(null);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-12">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">Global Settings</h1>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => {
              fetchSettings();
              fetchSiteImages();
              fetchSiteLogos();
            }}
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

        {/* Site Configuration Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Site Configuration</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="siteName" className="form-label">Site Name *</label>
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
                  <label htmlFor="currency" className="form-label">Currency</label>
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
                <label htmlFor="siteDescription" className="form-label">Site Description</label>
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

        {/* Site Images Management Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Site Carousel Images</h5>
            <small className="text-muted">Manage images for site banners and carousels</small>
          </div>
          <div className="card-body">
            {/* Upload Section */}
            <div className="mb-4">
              <label className="form-label">Upload Site Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleUploadSiteImages(e.target.files)}
                className="form-control"
                disabled={uploadingImages}
              />
              <div className="form-text">
                Upload multiple images for site banners and carousels
              </div>
            </div>

            {/* Images Grid */}
            {siteImages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No site images uploaded yet</p>
              </div>
            ) : (
              <div className="row g-3">
                {siteImages.map((image) => (
                  <div key={image.ID} className="col-md-4 col-lg-3">
                    <div className={`card ${!image.isVisible ? 'opacity-50' : ''}`}>
                      <img
                        src={API_BASE_URL + image.url}
                        alt={image.altText}
                        className="card-img-top"
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                      <div className="card-body p-2">
                        <div className="btn-group w-100" role="group">
                          <button
                            className={`btn btn-sm ${image.isVisible ? 'btn-success' : 'btn-outline-secondary'}`}
                            disabled={imageLoading === image.ID}
                            onClick={() => handleToggleImageVisibility(image.ID)}
                            title={image.isVisible ? 'Hide image' : 'Show image'}
                          >
                            {imageLoading === image.ID ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : image.isVisible ? (
                              '👁️'
                            ) : (
                              '👁️‍🗨️'
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={imageLoading === image.ID}
                            onClick={() => handleDeleteSiteImage(image.ID)}
                            title="Delete image"
                          >
                            {imageLoading === image.ID ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              '🗑️'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Site Logos Management Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Site Logos</h5>
            <small className="text-muted">Upload multiple logos and set one as primary</small>
          </div>
          <div className="card-body">
            {/* Upload Section */}
            <div className="mb-4">
              <label className="form-label">Upload Site Logos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleUploadSiteLogos(e.target.files)}
                className="form-control"
                disabled={uploadingLogos}
              />
              <div className="form-text">
                Upload multiple logos and set one as primary for your site
              </div>
            </div>

            {/* Logos Grid */}
            {siteLogos.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No site logos uploaded yet</p>
              </div>
            ) : (
              <div className="row g-3">
                {siteLogos.map((logo) => (
                  <div key={logo.ID} className="col-md-4 col-lg-3">
                    <div className="card">
                      <div className="position-relative">
                        <img
                          src={API_BASE_URL + logo.url}
                          alt={logo.altText}
                          className="card-img-top"
                          style={{ height: '150px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                        />
                        {logo.isPrimary && (
                          <div className="position-absolute top-0 start-0 m-2">
                            <span className="badge bg-primary">Primary</span>
                          </div>
                        )}
                      </div>
                      <div className="card-body p-2">
                        <div className="btn-group w-100" role="group">
                          {!logo.isPrimary && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              disabled={logoLoading === logo.ID}
                              onClick={() => handleSetPrimaryLogo(logo.ID)}
                              title="Set as primary"
                            >
                              {logoLoading === logo.ID ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                '★ Set Primary'
                              )}
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={logoLoading === logo.ID}
                            onClick={() => handleDeleteSiteLogo(logo.ID)}
                            title="Delete logo"
                          >
                            {logoLoading === logo.ID ? (
                              <span className="spinner-border spinner-border-sm" />
                            ) : (
                              '🗑️'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Display Settings Section */}
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">Products Page Display Settings</h5>
          </div>
          <div className="card-body">
            <div className="row">
            {/* Add Carousel Toggle */}
              <div className="col-md-6 mb-3">
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    id="showCarousel"
                    name="showCarousel"
                    checked={settings.displaySettings.showCarousel}
                    onChange={handleDisplaySettingChange}
                    className="form-check-input"
                    disabled={loading}
                  />
                  <label htmlFor="showCarousel" className="form-check-label fw-medium">
                    Show Site Images Carousel
                  </label>
                </div>
                <small className="form-text text-muted">
                  Display a rotating carousel of site images at the top of the products page
                </small>
              </div>


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