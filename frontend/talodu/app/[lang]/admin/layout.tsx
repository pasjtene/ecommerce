'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/global', label: 'Global Settings', icon: '⚙️' },
    { href: '/admin/users', label: 'List Users', icon: '👥' },
    { href: '/admin/roles', label: 'Manage Roles', icon: '🔐' }, 
    { href: '/admin/products', label: 'Products', icon: '📦' },
    { href: '/admin/orders', label: 'Orders', icon: '📋' },
    { href: '/admin/settings', label: 'Site Settings', icon: '🌐' },
    { href: '/admin/help', label: 'Help', icon: '❓' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <div 
        className={`bg-white shadow-sm border-end d-flex flex-column ${isSidebarOpen ? 'col-md-3 col-lg-2' : 'col-auto'}`}
        style={{ transition: 'all 0.3s ease' }}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          {isSidebarOpen && (
            <h5 className="mb-0 text-primary fw-bold">Admin Panel</h5>
          )}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 p-2">
          <div className="nav flex-column">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link d-flex align-items-center py-3 px-2 text-decoration-none rounded ${
                  isActive(item.href) 
                    ? 'bg-primary text-white' 
                    : 'text-dark hover-bg-light'
                }`}
                style={{
                  transition: 'all 0.2s ease',
                  marginBottom: '0.25rem'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="me-3" style={{ fontSize: '1.1rem' }}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="fw-medium">{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer (optional) */}
        {isSidebarOpen && (
          <div className="p-3 border-top">
            <small className="text-muted">Admin v1.0</small>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 overflow-auto">
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}