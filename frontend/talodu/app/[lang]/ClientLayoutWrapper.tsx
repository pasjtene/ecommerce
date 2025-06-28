
// app/[lang]/ClientComponentWrapper.tsx
'use client';
import { AuthProvider } from './AuthContextNext';
import HeaderNext from './HeaderNext';
import dynamic from 'next/dynamic';
import React, { useState} from 'react';

const Login = dynamic(() => import('./Login'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ClientComponentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLogin, setShowLogin] = useState(false);
  
  return (
    <AuthProvider onRequireLogin={() => setShowLogin(true)}>
      <HeaderNext />
      <Login 
        show={showLogin} 
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {}}
      />
      {children}
    </AuthProvider>
  );
}
