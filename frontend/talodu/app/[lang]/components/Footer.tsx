// app/[lang]/components/Footer.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  return (
    <footer className="py-5" style={{ backgroundColor: '#e6f2ff', color: 'tomato' }}>
      <div className="container">
        <div className="row">
          {/* Column 1 - Logo */}
          <div className="col-md-3 mb-4 mb-md-0">
            <Link href={`/${pathname.split('/')[1]}`} className="d-flex align-items-center text-decoration-none">
              <div className="me-2">
                <Image 
                  src="/logo.png" 
                  alt="Talodu Logo" 
                  width={40} 
                  height={40} 
                  className="img-fluid"
                />
              </div>
              <span className="fs-4 fw-bold" style={{ color: 'tomato' }}>TALODU.COM</span>
            </Link>
            <p className="mt-3" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
              Your trusted online shopping destination for quality products.
            </p>
          </div>

          {/* Column 2 - Shop */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 style={{ color: 'tomato' }}>Shop</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/shop/new-arrivals`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  New Arrivals
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/shop/bestsellers`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Bestsellers
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/shop/deals`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Deals & Discounts
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/shop/gift-cards`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 style={{ color: 'tomato' }}>Company</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/about-us`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/careers`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Careers
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/blog`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Blog
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/press`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Support */}
          <div className="col-md-3">
            <h5 style={{ color: 'tomato' }}>Support</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/contact-us`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/faq`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  FAQ
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/privacy-policy`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/terms-of-service`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-top mt-4 pt-4" style={{ borderColor: 'rgba(255, 99, 71, 0.3)' }}>
          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                &copy; {new Date().getFullYear()} Talodu.com. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="d-inline-flex">
                <Link href="#" className="me-3" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  <i className="bi bi-facebook"></i>
                </Link>
                <Link href="#" className="me-3" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  <i className="bi bi-twitter"></i>
                </Link>
                <Link href="#" className="me-3" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  <i className="bi bi-instagram"></i>
                </Link>
                <Link href="#" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  <i className="bi bi-linkedin"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}