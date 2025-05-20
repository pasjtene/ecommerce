import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../presentation/auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

const ProductsListHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowDropdown(false);
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
                        {/* Logo on the left */}
                        <Navbar.Brand 
                            href="/" 
                            className="fw-bold fs-4 text-primary me-3"
                            style={{ fontFamily: "'Pacifico', cursive", minWidth: '100px' }}
                        >
                            Talodu
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
                                        <span className="ms-1  d-sm-inline w-100" style={{ fontSize: '0.9rem' }}>
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
                                                    navigate('/account/settings');
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
                                    variant="outline-secondary"
                                    onClick={() => navigate('/auth-pages/login')}
                                    className="me-2 py-1 px-2"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    <FontAwesomeIcon icon={faUser} className="me-1" />
                                    <span className="d-none d-sm-inline">Login</span>
                                </Button>
                            )}

                            {/* Shopping cart */}
                            <div 
                                className="position-relative"
                                onClick={() => navigate('/cart')}
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
        </>
    );
};

export default ProductsListHeader;