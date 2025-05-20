import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../presentation/auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faShoppingCart,  // Changed from faShoppingBasket to faShoppingCart
  faSearch, 
  faCog, 
  faSignOutAlt,
  faChevronDown 
} from '@fortawesome/free-solid-svg-icons';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Dropdown from 'react-bootstrap/Dropdown';

const ProductsListHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm mb-4">
            <Container fluid>
                {/* Logo on the left */}
                <Navbar.Brand 
                    href="/" 
                    className="fw-bold fs-3 text-primary"
                    style={{ fontFamily: "'Pacifico', cursive" }}
                >
                    Talodu
                </Navbar.Brand>

                {/* Always visible user info and cart on mobile */}
                <div className="d-flex d-lg-none align-items-center ms-auto">
                    {user && (
                        <div className="d-flex align-items-center me-3">
                            <FontAwesomeIcon icon={faUser} className="me-2" />
                            <span>{user.FirstName}</span>
                        </div>
                    )}
                    <div 
                        className="position-relative me-2"
                        onClick={() => navigate('/cart')}
                        style={{ cursor: 'pointer' }}
                    >
                        <FontAwesomeIcon icon={faShoppingCart} size="lg" />
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

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Search bar in the middle */}
                    <Form 
                        onSubmit={handleSearch}
                        className="d-flex mx-auto my-2 my-lg-0" 
                        style={{ width: '100%', maxWidth: '500px' }}
                    >
                        <FormControl
                            type="search"
                            placeholder="Search products..."
                            className="me-2"
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button variant="outline-primary" type="submit">
                            <FontAwesomeIcon icon={faSearch} />
                        </Button>
                    </Form>

                    {/* User dropdown and cart (hidden on mobile) */}
                    <Nav className="ms-lg-auto d-none d-lg-flex align-items-center">
                        {user ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle 
                                    variant="light" 
                                    className="d-flex align-items-center"
                                    id="dropdown-user"
                                >
                                    <FontAwesomeIcon icon={faUser} className="me-2" />
                                    {user.FirstName}
                                    <FontAwesomeIcon icon={faChevronDown} className="ms-2" style={{ fontSize: '0.8rem' }} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => navigate('/account/settings')}>
                                        <FontAwesomeIcon icon={faCog} className="me-2" />
                                        Settings
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                                        Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Nav.Link 
                                onClick={() => navigate('/auth-pages/login')}
                                className="d-flex align-items-center"
                            >
                                <FontAwesomeIcon icon={faUser} className="me-2" />
                                Login
                            </Nav.Link>
                        )}

                        <Nav.Link 
                            onClick={() => navigate('/cart')}
                            className="d-flex align-items-center position-relative ms-3 d-none d-lg-flex"
                        >
                            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
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
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default ProductsListHeader;