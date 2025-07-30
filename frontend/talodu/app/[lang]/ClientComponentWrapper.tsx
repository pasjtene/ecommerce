
// app/[lang]/ClientComponentWrapper.tsx
'use client';
import { AuthProvider } from './contexts/AuthContextNext';
import HeaderNext from './HeaderNext';
import Footer from './components/Footer'
import dynamic from 'next/dynamic';
import React, { useState, useCallback } from 'react';
import { CartProvider } from './contexts/CartContext';
import CookieConsent from './components/CookieConsent';
import { CurrencyProvider } from './contexts/CurrencyContext';

const Login = dynamic(() => import('./Login'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
const Register = dynamic(() => import('./Register'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ClientComponentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleShowLogin = useCallback(() => {
    setShowLogin(true);
  }, []);
  
  return (
    <CurrencyProvider>
    <CartProvider>
      <AuthProvider 
        showLogin={handleShowLogin}
        onRequireLogin={handleShowLogin} 
      >
        <HeaderNext />
        <Login 
          show={showLogin} 
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
            
          }}
        />

        <Register
          show={showRegister} 
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
            
          }}
        />
        {children}
        <Footer/>
         <CookieConsent />
      </AuthProvider>
    </CartProvider>
    </CurrencyProvider>
  );
}