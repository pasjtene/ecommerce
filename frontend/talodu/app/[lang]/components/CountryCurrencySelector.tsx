// app/[lang]/components/CountryCurrencySelector.tsx
'use client';

import { useCurrency } from '../contexts/CurrencyContext';

interface CountryCurrencySelectorProps {
  translations?: {
    country?: string;
    currency?: string;
  };
  className?: string;
}

export default function CountryCurrencySelector({ 
  translations = { country: 'Country', currency: 'Currency' },
  className = '' 
}: CountryCurrencySelectorProps) {
  const {
    currency,
    setCurrency,
    selectedCountry,
    setSelectedCountry,
    currencies,
    countries,
    isAutoDetected
  } = useCurrency();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
  };

  return (
    <div className={`d-flex flex-wrap gap-3 ${className}`}>
      {/* Country Selector */}
      <div className="d-flex align-items-center">
        <label htmlFor="country-select" className="me-2" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
            
       
           
       
      
        {countries.find(c => c.code === selectedCountry)?.name}   {translations.country}:
        </label>
        <select
          id="country-select"
          value={selectedCountry}
          onChange={handleCountryChange}
          className="form-select form-select-sm"
          style={{ 
            width: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: 'rgba(255, 99, 71, 0.5)',
            color: 'tomato'
          }}
        >
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Currency Selector */}
      <div className="d-flex align-items-center">
        <label htmlFor="currency-select" className="me-2" style={{ color: 'rgba(255, 99, 71, 0.8)' }}>
          {translations.currency}:
        </label>
        <select
          id="currency-select"
          value={currency}
          onChange={handleCurrencyChange}
          className="form-select form-select-sm"
          style={{ 
            width: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: 'rgba(255, 99, 71, 0.5)',
            color: 'tomato'
          }}
        >
          {currencies.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}