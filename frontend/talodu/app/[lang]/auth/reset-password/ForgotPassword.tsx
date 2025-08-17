"use client"
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface ForgotPasswordProps {
  show: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface Dictionary {
  forgotPassword: {
    title: string;
    email_placeholder: string;
    submit_button: string;
    back_to_login: string;
    success_message: string;
    we_will_sent_link: string;
    check_spam_folder: string;
  };
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ show, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const params = useParams();
  const [transition, setTranslation] = useState<Dictionary | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

  
  
   
  const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email }, {
        params: { lang: params.lang },
        headers: {'Accept-Language': params.lang || 'en'}
      },);

      
    } catch (err) {
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  
}
  
  
  const handleSubmit2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         params: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
      }

      toast.success(transition?.forgotPassword.success_message || 'Password reset email sent. Please check your inbox.');
      setSuccess(true);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  // Load dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await import(`../../translations/${params.lang}.json`);
      setTranslation(dict.default);
    };
    loadDictionary();
  }, [params.lang]);

  if (!transition) {
    return null;
  }

  return (
    <div 
    //show={show} 
    //onHide={onClose} 
    //centered
    >
      <div style={{
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '10px',
        padding: '2rem',
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

        <h4 className="mb-4 text-center">{transition.forgotPassword.title || 'Forgot Password'} ?</h4>
        <div className="mb-4 text-center">{transition.forgotPassword.we_will_sent_link || 'We will sent a link for you to resset your email'}</div>
        <div className="mb-4 text-center">{transition.forgotPassword.check_spam_folder || 'Please check your spam folder if you don\'t see the email in your mailbox'}</div>
        
        {success ? (
          <div className="alert alert-success">
            {transition.forgotPassword.success_message || 'Password reset email sent. Please check your inbox.'}
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <Form.Control
                  type="email"
                  placeholder={transition.forgotPassword.email_placeholder || 'Enter your email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : transition.forgotPassword.submit_button || 'Reset Password'}
            </Button>

            <div className="text-center">
              <Button variant="link" onClick={onSwitchToLogin}>
                {transition.forgotPassword.back_to_login || 'Back to Login'}
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;