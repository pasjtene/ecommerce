//HeaderNext.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth} from './AuthContextNext';
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
import { toast } from 'react-toastify';

// --- Use dynamic import for modals that might have client-side dependencies ---
// This is crucial if Login/Register components have direct browser API access
import dynamic from 'next/dynamic';

const Login = dynamic(() => import('./Login'), { ssr: false });
const Register = dynamic(() => import('./Register'), { ssr: false });
// --- END dynamic import ---


const HeaderNext = () => {
    //const url1 = process.env.API_BASE_URL | 'undefined';
    const { user, logout } = useAuth();
    const router = useRouter(); // <-- Replaced useNavigate with useRouter
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItemCount, setCartItemCount] = useState(7); // This should ideally come from global state/context
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
    //const [apiBaseURL, setApiBaseUrl] = useState<process.env.API_BASE_URL >(null);

    // Close dropdown when clicking outside - This needs to be in useEffect
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
            //router.push(`/search?q=${encodeURIComponent(searchQuery)}`); // <-- Use router.push
            router.push(`/?q=${encodeURIComponent(searchQuery)}`); // <-- Use router.push
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Succes vous etes déconnecté');
        setShowDropdown(false);
        router.push('/');
    };

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

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
                                <span>Talodu</span>
                            </Navbar.Brand>
                        
                        

                        {/* Desktop search form - hidden on mobile */}
                        <Form
                            onSubmit={handleSearch}
                            className="d-none d-lg-flex flex-grow-1 mx-3"
                        >
                            <FormControl
                                type="search"
                                placeholder="Search products..."
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
                                                Settings
                                            </div>
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
                                    <span className="me-2">Connexion</span>
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
                                placeholder="Search products..."
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
                   // url={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888'}
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