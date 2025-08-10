// app/[lang]/Register.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faUser, 
  faLock, 
  faEnvelope, 
  faSignInAlt,
  faCheck,
  faTimes as faXmark
} from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useAuth } from './contexts/AuthContextNext';
import axios from 'axios';

import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface RegisterProps {
  show: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0;
  const requirements = {
    length: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  if (password.length >= 8) {
    strength += 1;
    requirements.length = true;
  }
  if (/[A-Z]/.test(password)) {
    strength += 1;
    requirements.hasUpperCase = true;
  }
  if (/[a-z]/.test(password)) {
    strength += 1;
    requirements.hasLowerCase = true;
  }
  if (/[0-9]/.test(password)) {
    strength += 1;
    requirements.hasNumber = true;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 1;
    requirements.hasSpecialChar = true;
  }

  return {
    strength: Math.min(strength, 5), // Max strength of 5
    requirements
  };
};

const Register: React.FC<RegisterProps> = ({ show, onClose, onSwitchToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, hideLogin } = useAuth();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    requirements: {
      length: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false
    }
  });

  // Update password strength on change
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

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
    
    // Check password strength before submitting
    if (passwordStrength.strength < 3) {
      setError('Please choose a stronger password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        roles: ['Visitor']
      });

      if (response.data.user) {
        await login(email, password);
        hideLogin();
        onClose();
      }
    } catch (err) {
      console.error('Registration failed:', err);
      if (axios.isAxiosError(err)) {
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

  // Password strength name
  const getStrengthName = (strength: number): string => {
  switch (strength) {
    case 0: return 'Very Weak';
    case 1: return 'Weak';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Strong';
    case 5: return 'Very Strong';
    default: return 'Weak';
  }
};

  // Password strength colors
  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 0: return 'danger';
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'info';
      case 4: return 'success';
      case 5: return 'success';
      default: return 'danger';
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <span className="input-group-text text-success"
                onMouseLeave={() => setShowPassword(false)} // In case cursor leaves while holding
                onTouchStart={() => setShowPassword(true)}
                onTouchEnd={() => setShowPassword(false)}
                onMouseUp={()=>{setShowPassword(false)}}
                onMouseDown={()=>{setShowPassword(true)}}>
                  <FontAwesomeIcon icon={faEye} />
                </span>
            </div>
            
            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2">
                <ProgressBar 
                  now={passwordStrength.strength * 20} 
                  variant={getStrengthColor()}
                  className="mb-2"
                />
                <div className="password-requirements">
                  <small>Password Requirements:</small>
                  <small>
                    <span className={`fw-bold text-${getStrengthColor()}`}>
                      {getStrengthName(passwordStrength.strength)}
                    </span> 
                  </small>
                  <ul className="list-unstyled">
                    <li>
                      <FontAwesomeIcon 
                        icon={passwordStrength.requirements.length ? faCheck : faXmark} 
                        className={passwordStrength.requirements.length ? "text-success" : "text-danger"} 
                      /> At least 8 characters
                    </li>
                    <li>
                      <FontAwesomeIcon 
                        icon={passwordStrength.requirements.hasUpperCase ? faCheck : faXmark} 
                        className={passwordStrength.requirements.hasUpperCase ? "text-success" : "text-danger"} 
                      /> Uppercase letter
                    </li>
                    <li>
                      <FontAwesomeIcon 
                        icon={passwordStrength.requirements.hasLowerCase ? faCheck : faXmark} 
                        className={passwordStrength.requirements.hasLowerCase ? "text-success" : "text-danger"} 
                      /> Lowercase letter
                    </li>
                    <li>
                      <FontAwesomeIcon 
                        icon={passwordStrength.requirements.hasNumber ? faCheck : faXmark} 
                        className={passwordStrength.requirements.hasNumber ? "text-success" : "text-danger"} 
                      /> Number
                    </li>
                    <li>
                      <FontAwesomeIcon 
                        icon={passwordStrength.requirements.hasSpecialChar ? faCheck : faXmark} 
                        className={passwordStrength.requirements.hasSpecialChar ? "text-success" : "text-danger"} 
                      /> Special character
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 mb-3"
            disabled={loading || passwordStrength.strength < 3}
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