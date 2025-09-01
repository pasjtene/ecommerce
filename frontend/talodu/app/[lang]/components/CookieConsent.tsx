// app/[lang]/components/CookieConsent.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from 'react-bootstrap/Button';

interface CookieConsentTranslations {
  cookie_consent: {
    message: string;
    accept: string;
    reject: string;
    privacy_policy: string;
    cookie_policy: string;
  };
}

export default function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [translations, setTranslations] = useState<CookieConsentTranslations | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const lang = pathname.split('/')[1] || 'en';
        const module = await import(`../translations/${lang}.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    const checkConsent = () => {
      const consentGiven = localStorage.getItem('cookieConsent');
      const consentDate = localStorage.getItem('cookieConsentDate');
      //const sixMonthsInMs = 15552000000; // 6 months in milliseconds
      const thirtyMinutesInMs = 1800000;
      // 24h = 86 400 000
      // 48h = 172 800 000

      if (!consentGiven || 
          (consentDate && Date.now() - parseInt(consentDate) > 864000000)) { //10 days
        setVisible(true);
      }
    };

    loadTranslations();
    checkConsent();
  }, [pathname]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', Date.now().toString());
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', Date.now().toString());
    setVisible(false);
  };

  if (!visible || !translations) return null;

  return (
    <div className="fixed-bottom p-3" style={{
      right: '20px',
      bottom: '20px',
      left: 'auto',
      maxWidth: '420px',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .policy-link {
          color: tomato !important;
          text-decoration: none;
          transition: text-decoration 0.2s ease;
        }
        .policy-link:hover {
          text-decoration: underline !important;
        }
        .btn-tomato-hover:hover {
          background-color: tomato !important;
          border-color: tomato !important;
          color: white !important;
        }
      `}</style>
      
      <div className="d-flex flex-column gap-3">
        <p className="mb-0 small" style={{ lineHeight: '1.5' }}>
          {translations.cookie_consent.message}
        </p>
        
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleAccept}
            style={{ minWidth: '100px' }}
            className="btn-tomato-hover"
          >
            {translations.cookie_consent.accept}
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={handleReject}
            style={{ minWidth: '100px' }}
            className="btn-tomato-hover"
          >
            {translations.cookie_consent.reject}
          </Button>
        </div>
        
        <div className="d-flex gap-3 justify-content-center">
         <Link 
            href={`/${pathname.split('/')[1]}/privacy-policy`} 
            style={{ 
            fontSize: '0.75rem',
            color: 'tomato',
            textDecoration: 'none',
            transition: 'text-decoration 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
            {translations.cookie_consent.privacy_policy}
          </Link>

          <Link 
            href={`/${pathname.split('/')[1]}/cookie-policy`} 
            style={{ 
            fontSize: '0.75rem',
            color: 'tomato',
            textDecoration: 'none',
            transition: 'text-decoration 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
            {translations.cookie_consent.cookie_policy}
          </Link>
        </div>
      </div>
    </div>
  );
}