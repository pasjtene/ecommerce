// app/[lang]/Register.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faLock, faEnvelope, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { useAuth } from './contexts/AuthContextNext';
import axios from 'axios';

interface RegisterProps {
  show: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ show, onClose, onSwitchToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, hideLogin } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";

  // Pre-check if email is registered
useEffect(() => {
  const delayDebounceFn = setTimeout(async () => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const isAvailable = await checkEmailAvailability(email);
      if (!isAvailable) {
        setError('Email already registered');
      } else if (error === 'Email already registered') {
        setError('');
      }
    }
  }, 500);

  return () => clearTimeout(delayDebounceFn);
}, [email]);

const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";
    const response = await axios.get(`${API_BASE_URL}/auth/check-email`, {
      params: { email }
    });
    return !response.data.exists;
  } catch (err) {
    console.error('Error checking email:', err);
    return true; // Assume available if check fails
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      
      const response = await axios.post(`${API_BASE_URL}/register`, {
        first_name: firstName,
        last_name: lastName,
        Email: email,
        Password: password,
        Roles: ['Visitor'] // Default role for new registrations
      });

      // Automatically log in the user after successful registration
      if (response.data.user) {
        await login(email, password);
        hideLogin();
        onClose();
      }
    } catch (err) {
       console.error('Registration failed:', err);
    if (axios.isAxiosError(err)) {
      // Handle specific error cases
      if (err.response?.data?.code === 'EMAIL_EXISTS') {
        setError('This email is already registered. Please use a different email or login.');
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdropClassName="auth-backdrop"
      contentClassName="auth-content"
      dialogClassName="auth-dialog"
    >
      <div style={{
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '10px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: 'none'
      }}>
        <Button 
          variant="link" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            color: '#333'
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>

        <h4 className="mb-4 text-center">Create Your Account</h4>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Form.Text className="text-muted">
              Password must be at least 6 characters long
            </Form.Text>
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>

          <div className="text-center">
            <p className="mb-1">Already have an account?</p>
            <Button 
              variant="outline-secondary" 
              onClick={onSwitchToLogin}
              className="w-100"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Login
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default Register;