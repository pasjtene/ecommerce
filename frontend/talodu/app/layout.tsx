import React from 'react';
//import './globals.css'; // Your global styles
import '../src/pages/presentation/sales/ProductImageGallery.css'
import { AuthProvider} from '../src/pages/presentation/auth/AuthContextNext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
    <html lang="fr">
      <body>{children}</body>
    </html>
    </AuthProvider>
  );
}