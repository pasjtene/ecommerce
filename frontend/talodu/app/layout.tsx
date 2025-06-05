"use client"
import React from 'react';
//import './globals.css'; // Your global styles
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../src/pages/presentation/sales/ProductImageGallery.css'
//import { AuthProvider} from '../src/pages/presentation/auth/AuthContextNext';
import { AuthProvider} from './AuthContextNext';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Optional: Add a loading state */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}