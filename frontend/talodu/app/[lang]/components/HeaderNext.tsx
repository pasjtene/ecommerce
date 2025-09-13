//[lang]/components/HeaderNext.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Translation } from '../types';
import { useRouter,useParams, usePathname, } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth} from '../contexts/AuthContextNext';
import { useCart } from '../contexts/CartContext';
import {
  faUser,
  faShoppingCart,
  faSearch,
  faCog,
  faSignOutAlt,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import dynamic from 'next/dynamic';
import { useCurrency } from '../contexts/CurrencyContext';
import CountryCurrencySelector from './CountryCurrencySelector';

const Login = dynamic(() => import('../Login'), { ssr: false });
const Register = dynamic(() => import('../Register'), { ssr: false });



const HeaderNext = () => {
    const { user,hasAnyRole, logout: contextLogout } = useAuth();
    const { currency, currencyRate, currencySymbol, formatPrice, setCurrency, selectedCountry,
      setSelectedCountry, } = useCurrency();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    //const [cartItemCount, setCartItemCount] = useState(0); // This should ideally come from global state/context
    const { cartItemCount, cartItems } = useCart();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
    const [t, setTranslation] = useState<Translation | null>(null);

    // Load translation
    useEffect(() => {
      const loadTranslation = async () => {
        const t = await import(`../translations/${params.lang}.json`);
        setTranslation(t.default);
      };
      loadTranslation ();
    }, [params.lang]);
    
    // Add language switcher in header

        const changeLanguage = (locale: string) => {
        const newPathname = (pathname || '/').replace(`/${params.lang}`, '') || '/';

        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedCurrency', currency);
            localStorage.setItem('selectedCountry', selectedCountry);

            {/*In certain circumstances, Cart items will be lost if not stored when switching language */}
            localStorage.setItem('langCart', JSON.stringify(cartItems));
        }
        

        if (typeof document !== 'undefined') {
            document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
        }

        router.push(`/${locale}${newPathname}`);
       
        };


    // Close dropdown when clicking outside 
    useEffect(() => {
        // Ensure this code only runs in the browser environment
        if (typeof document !== 'undefined') {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setShowDropdown(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery)}`); // <-- Use router.push
        }
    };

      const logout = () => {
        contextLogout();
        //setShowAuthModal('login');
        setShowDropdown(false);
    };

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
    };

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

    if (!t) return null; // or loading state

    return (
        <>
            <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm py-2">
                <Container fluid className="px-3">
                    {/* First row - logo, desktop search, and user controls */}
                    <div className="d-flex w-100 align-items-center">
                            {/* Ensure Navbar.Brand's content is a single, direct child */}
                            <Navbar.Brand
                                className="fw-bold fs-4 text-primary me-3"
                                style={{ fontFamily: "'Pacifico', cursive", 
                                    minWidth: '100px', cursor: 'pointer', }}
                                    onClick={()=>router.push("/")}
                            >
                                {/* Wrap "Talodu" in a <span> or <div> to make it a single child */}
                                <span>{t.common.brand}</span>
                            </Navbar.Brand>
                        
                        {/* Desktop search form - hidden on mobile */}
                        <Form
                            onSubmit={handleSearch}
                            className="d-none d-lg-flex flex-grow-1 mx-3"
                        >
                            <FormControl
                                type="search"
                                placeholder={t.header.search_placeholder}
                                className="me-2"
                                aria-label="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ fontSize: '0.9rem' }}
                            />
                            <Button
                                variant="outline-primary"
                                type="submit"
                                className="py-1 px-3"
                            >
                                <FontAwesomeIcon icon={faSearch} size="sm" />
                            </Button>
                        </Form>

                        {/* Country and currentcy */}
                        <span>{selectedCountry}</span>

                        
                    {/* Language switcher */}
                    <div className="ms-3">
                    <select 
                        onChange={(e) => changeLanguage(e.target.value)}
                        value={params.lang as string}
                        className="form-select form-select-sm"
                    >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                    </select>
                    </div>

                        {/* User info and cart - always visible */}
                        <div className="d-flex  align-items-center ms-auto">
                            {user ? (
                                <div className="d-flex w-100 align-items-center position-relative me-2" ref={dropdownRef}>
                                    <div
                                        onClick={toggleDropdown}
                                        style={{ cursor: 'pointer' }}
                                        className="d-flex align-items-center"
                                    >
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="me-1"
                                            style={{ fontSize: '1rem' }}
                                        />
                                        <span className="ms-1" style={{ fontSize: '0.9rem' }}>
                                            {user.FirstName}
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className="ms-1"
                                            style={{ fontSize: '0.7rem' }}
                                        />
                                    </div>

                                    {/* Dropdown menu */}
                                    {showDropdown && (
                                        <div
                                            className="position-absolute bg-white rounded shadow mt-1 border"
                                            style={{
                                                top: '100%',
                                                right: 0,
                                                zIndex: 1000,
                                                minWidth: '160px'
                                            }}
                                        >
                                            <div
                                                className="dropdown-item py-2 px-3"
                                                onClick={() => {
                                                    router.push('/account/settings'); // <-- Use router.push
                                                    setShowDropdown(false);
                                                }}
                                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                <FontAwesomeIcon icon={faCog} className="me-2" />
                                                 {t.header.settings}
                                            </div>


                                              {hasAnyRole(["Admin","SuperAdmin"]) && (
                                                <div>
                                                <div className="dropdown-divider my-1"></div>
                                                <div
                                                className="dropdown-item py-2 px-3"
                                                onClick={() => {
                                                    router.push('/admin/global'); // <-- Use router.push
                                                    setShowDropdown(false);
                                                }}
                                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                <FontAwesomeIcon icon={faCog} className="me-2" />
                                                Global setting
                                            </div>
                                            </div>
                                              )}
                                              
                                            
                                            <div className="dropdown-divider my-1"></div>
                                            
                                            <div
                                                className="dropdown-item py-2 px-3"
                                                onClick={() => {
                                                    router.push('/shop/listshops'); // <-- Use router.push
                                                    setShowDropdown(false);
                                                }}
                                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                <FontAwesomeIcon icon={faCog} className="me-2" />
                                                List my shops
                                            </div>

                                            <div className="dropdown-divider my-1"></div>
                                            <div
                                                className="dropdown-item py-2 px-3"
                                                onClick={handleLogout}
                                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                                                Logout
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    variant="outline-danger"
                                    onClick={() => setShowAuthModal('login')}
                                    className="me-2 py-1 px-2"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    <FontAwesomeIcon icon={faUser} className="me-1" />
                                    <span className="me-2">{t.header.login}</span>
                                </Button>
                            )}

                            {/* Shopping cart */}
                            <div
                                className="position-relative"
                                onClick={() => router.push('/cart')} // <-- Use router.push
                                style={{ cursor: 'pointer' }}
                            >
                                <FontAwesomeIcon
                                    icon={faShoppingCart}
                                    style={{ fontSize: '1.1rem' }}
                                />
                                {cartItemCount > 0 && (
                                    <Badge
                                        pill
                                        bg="danger"
                                        className="position-absolute top-0 start-100 translate-middle"
                                        style={{ fontSize: '0.6rem' }}
                                    >
                                        {cartItemCount}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile search form - hidden on desktop */}
                    <div className="d-lg-none mt-2 w-100">
                        <Form
                            onSubmit={handleSearch}
                            className="d-flex w-100"
                        >
                            <FormControl
                                type="search"
                                placeholder={t.header.search_placeholder}
                                className="me-2"
                                aria-label="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ fontSize: '0.9rem' }}
                            />
                            <Button
                                variant="outline-primary"
                                type="submit"
                                className="py-1 px-3"
                            >
                                <FontAwesomeIcon icon={faSearch} size="sm" />
                            </Button>
                        </Form>
                    </div>
                </Container>
            </Navbar>

            {/* Modals are rendered here */}
            {showAuthModal === 'login' && (
                <Login
                    show={true}
                    onClose={() => setShowAuthModal(null)}
                    onSwitchToRegister={() => setShowAuthModal('register')}
                />
            )}

            {showAuthModal === 'register' && (
                <Register
                    show={true}
                    onClose={() => setShowAuthModal(null)}
                    onSwitchToLogin={() => setShowAuthModal('login')}
                />
            )}
        </>
    );
};

export default HeaderNext;