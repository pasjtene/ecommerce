// app/[lang]/components/Footer.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import CountryCurrencySelector from './CountryCurrencySelector';

interface FooterTranslations {
  footer: {
    tagline: string;
    shop: {
      title: string;
      new_arrivals: string;
      bestsellers: string;
      deals: string;
      gift_cards: string;
    };
    company: {
      title: string;
      about: string;
      careers: string;
      blog: string;
      press: string;
    };
    support: {
      title: string;
      contact: string;
      faq: string;
      privacy: string;
      terms: string;
    };
    copyright: string;
    currency: string;
    country: string;
  };
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Conversion rate from base currency
}

interface Country {
  code: string;
  name: string;
  currency: string;
}

export default function Footer() {
  const pathname = usePathname();
  const [t, setTranslations] = useState<FooterTranslations | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  //const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const { currency, currencyRate, currencySymbol, formatPrice, setCurrency, selectedCountry,
      setSelectedCountry, } = useCurrency();
  
  // Sample data - you might want to fetch this from an API or config file
  const currencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.93 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 151.61 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.36 },
  ];

  const countries: Country[] = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
  ];

  useEffect(() => {
    const loadTranslations = async () => {
      const lang = pathname.split('/')[1];
      const translations = await import(`../translations/${lang}.json`);
      setTranslations(translations.default);
    };
    loadTranslations();
  }, [pathname]);

  useEffect(() => {
    // When country changes, update currency to match
    const newCountry = countries.find(c => c.code === selectedCountry);
    if (newCountry) {
      setSelectedCurrency(newCountry.currency);
    }
  }, [selectedCountry]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
    setCurrency(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
  };

  if (!t) {
    return null; // or loading state
  }

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
              {t.footer.tagline}
            </p>
          </div>

          {/* Column 2 - Shop */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 style={{ color: 'tomato' }}>{t.footer.shop.title}</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/shop/new-arrivals`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.shop.new_arrivals}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/shop/bestsellers`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.shop.bestsellers}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/shop/deals`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.shop.deals}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/shop/gift-cards`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.shop.gift_cards}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Company */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 style={{ color: 'tomato' }}>{t.footer.company.title}</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/about-us`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.company.about}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/careers`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.company.careers}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/blog`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.company.blog}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/press`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.company.press}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Support and Currency/Country Selector */}
          <div className="col-md-3">
            <h5 style={{ color: 'tomato' }}>{t.footer.support.title}</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/contact-us`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.support.contact}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/faq`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.support.faq}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/privacy-policy`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.support.privacy}
                </Link>
              </li>
              <li className="mb-2">
                <Link href={`/${pathname.split('/')[1]}/terms-of-service`} className="text-decoration-none" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
                  {t.footer.support.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

      

        <div className="border-top mt-4 pt-4" style={{ borderColor: 'rgba(255, 99, 71, 0.3)' }}>
          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0" style={{ color: 'rgba(255, 99, 71, 0.8)' }} 
                dangerouslySetInnerHTML={{ __html: t.footer.copyright.replace('{year}', new Date().getFullYear().toString()) }} />
            </div>

             {/* Country selector - now takes 4 columns */}
    
            <div className="col-md-6 text-center text-md-end">

              {/* Currency and country selector component */}
    <CountryCurrencySelector 
                translations={{
                  country: t.footer.country,
                  currency: t.footer.currency
                }}
                className="justify-content-center justify-content-md-end"
              />

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