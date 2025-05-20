import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { useAuth } from './AuthContext';
import { useAuth, AuthProvider } from '../../presentation/auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingBasket, faSearch } from '@fortawesome/free-solid-svg-icons';
//import { Container, Navbar, Nav, Form, FormControl } from 'react-bootstrap';
//import Button from '../../../components/bootstrap/Button';
//import Nav from '../../../components/bootstrap/Nav';
import Alert from '../../../components/bootstrap/Alert';
//import Badge from '../../../components/bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';




import Icon from '../../../components/icon/Icon';

import Input from '../../../components/bootstrap/forms/Input';


import Label from '../../../components/bootstrap/forms/Label';

const ProductsListHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    // You'll need to manage cart state - this is just a placeholder
    const [cartItemCount, setCartItemCount] = useState(0);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLoginLogout = () => {
        if (user) {
            logout();
        } else {
            navigate('/auth-pages/login');
        }
    };

    // You'll need to implement actual cart count logic
    // This could come from context, redux, or API call

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
                 <div className='d-flex align-items-center'>
                                    <div className='row g-4'>
                                        <div className='col-md-auto'>
                                            <div>
                                                Hi  { user?.FirstName} {user?.LastName}
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Search bar in the middle */}
                    <Form 
                        onSubmit={handleSearch}
                        className="d-flex mx-auto" 
                        style={{ width: '50%' }}
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

                    {/* User and cart icons on the right */}
                    <Nav className="ms-auto d-flex align-items-center">
                        <Nav.Link 
                            onClick={handleLoginLogout}
                            className="d-flex align-items-center"
                        >
                            <FontAwesomeIcon icon={faUser} className="me-2" />
                            {user ? 'Logout' : 'Login'}
                        </Nav.Link>

                        <Nav.Link 
                            onClick={() => navigate('/cart')}
                            className="d-flex align-items-center position-relative"
                        >
                            <FontAwesomeIcon icon={faShoppingBasket} size="lg" />
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