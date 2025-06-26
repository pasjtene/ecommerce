"use client"
import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../../src/pages/presentation/sales/ProductImageGallery.css'
import { AuthProvider} from './AuthContextNext';
import HeaderNext from './HeaderNext';
import './css/global.css'
import dynamic from 'next/dynamic';
//import { useRouter } from 'next/router';
//import { appWithTranslation } from 'next-i18next';
//import { AppProps } from 'next/app';
import { useParams, useRouter  } from 'next/navigation';

const Login = dynamic(() => import('./Login'), { ssr: false });



//export default function RootLayout({ children }: { children: React.ReactNode }) {

  export default function RootLayout({ children, params}: { children: React.ReactNode, params: { lang: string } } ) {
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();
  return (
    <html lang={params.lang}>
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

//export default appWithTranslation(RootLayout);