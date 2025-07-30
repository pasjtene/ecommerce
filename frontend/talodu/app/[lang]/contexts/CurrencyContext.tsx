// app/[lang]/contexts/CurrencyContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Conversion rate from base currency (XAF)
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  currencyRate: number;
  currencySymbol: string;
  currencies: Currency[];
  countries: Country[];
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  isAutoDetected:boolean;
  formatPrice: (price: number) => string;

}

interface Country {
  code: string;
  name: string;
  currency: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Default currencies with XAF as base
const defaultCurrencies: Currency[] = [
  { code: 'XAF', name: 'CFA Franc', symbol: 'FCFA', rate: 1 }, // Base currency
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.0016 }, // 1 XAF = 0.0016 USD
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.0015 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.0013 },
  { code: 'NGN', name: 'Naira', symbol: '₦', rate: 1.2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 0.0021 }, // Canada
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 0.13 }, // India
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 0.24 } // Japan
];

// Countries with their default currencies
const defaultCountries: Country[] = [
  { code: 'CM', name: 'Cameroon', currency: 'XAF' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' }
];

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('XAF');
  const [currencyRate, setCurrencyRate] = useState(1);
  const [currencySymbol, setCurrencySymbol] = useState('FCFA');
  const [selectedCountry, setSelectedCountry] = useState('CM');
  const [currencies] = useState<Currency[]>(defaultCurrencies);
  const [countries] = useState<Country[]>(defaultCountries);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  

  // Detect user's country on initial load
  useEffect(() => {
    const detectUserCountry = async () => {
      try {
        // First check localStorage for existing preference
        const savedCountry = localStorage.getItem('selectedCountry');
        if (savedCountry) return;

        // Fallback to IP-based detection
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country;
         // Find matching country in our list
        const matchedCountry = countries.find(c => c.code === countryCode);
        if (matchedCountry) {
          setSelectedCountry(matchedCountry.code);
          setCurrency(matchedCountry.currency);
          setIsAutoDetected(true);
        }
      } catch (error) {
        console.error('Country detection failed:', error);
        // Fallback to default (Cameroon/XAF)
      }
    };

    detectUserCountry();
  }, [countries]);

  // Initialize from localStorage if available
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const savedCountry = localStorage.getItem('selectedCountry');

    if (savedCurrency) {
      const currencyData = currencies.find(c => c.code === savedCurrency);
      if (currencyData) {
        setCurrency(currencyData.code);
        setCurrencyRate(currencyData.rate);
        setCurrencySymbol(currencyData.symbol);
      }
    }

    if (savedCountry) {
      setSelectedCountry(savedCountry);
    }
  }, [currencies]);

  // Update currency data when currency changes
  useEffect(() => {
    const currencyData = currencies.find(c => c.code === currency);
    if (currencyData) {
      setCurrencyRate(currencyData.rate);
      setCurrencySymbol(currencyData.symbol);
      localStorage.setItem('selectedCurrency', currencyData.code);
    }
  }, [currency, currencies]);

  // Update country data when country changes
  useEffect(() => {
    localStorage.setItem('selectedCountry', selectedCountry);
    const countryData = countries.find(c => c.code === selectedCountry);
    if (countryData) {
      setCurrency(countryData.currency);
    }
  }, [selectedCountry, countries]);

   const handleManualSelection = (countryCode: string) => {
    setIsAutoDetected(false);
    setSelectedCountry(countryCode);
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setCurrency(country.currency);
    }
  };

const formatPrice = (price: number): string => {
    const convertedPrice = price * currencyRate;
    
    if (currency === 'XAF') {
      return `${Math.round(convertedPrice)} ${currencySymbol}`;
    }
    
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(convertedPrice);
    } catch (e) {
      // Fallback formatting if Intl fails
      return `${currencySymbol}${convertedPrice.toFixed(2)}`;
    }
  };



  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      currencyRate, 
      currencySymbol,
      currencies,
      countries,
      selectedCountry,
      setSelectedCountry:handleManualSelection,
      isAutoDetected,
      formatPrice,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}