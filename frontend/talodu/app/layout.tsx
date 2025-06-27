"use client"
import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../src/pages/presentation/sales/ProductImageGallery.css'
import { AuthProvider} from './AuthContextNext';
import './css/global.css'
import dynamic from 'next/dynamic';


//const Login = dynamic(() => import('./Login'), { ssr: false });



//export default function RootLayout({ children }: { children: React.ReactNode }) {

  export default function RootLayout({ children}: { children: React.ReactNode} ) {
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  //const router = useRouter();
  return (
    <html >
      <body>
        <AuthProvider onRequireLogin={() => setShowLogin(true)}
            onLoginSuccess={() => setShowLogin(false)}>
          
         
          {/* Optional: Add a loading state */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

//export default appWithTranslation(RootLayout);