"use client"
import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../src/pages/presentation/sales/ProductImageGallery.css'
import { AuthProvider} from './AuthContextNext';
import HeaderNext from './HeaderNext';
import './css/global.css'
import dynamic from 'next/dynamic';

const Login = dynamic(() => import('./Login'), { ssr: false });



export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  return (
    <html lang="en">
      <body>
        <AuthProvider onRequireLogin={() => setShowLogin(true)}
            onLoginSuccess={() => setShowLogin(false)}>
          <HeaderNext/>
          <Login 
                show={showLogin} 
                onClose={() => setShowLogin(false)}
                onSwitchToRegister={() => setShowAuthModal('register')}
                //onSwitchToRegister={/* ... */}
            />
          {/* Optional: Add a loading state */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}