//app/[lang]/auth/reset-password/page.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import { useParams } from 'next/navigation';
import Alert from 'react-bootstrap/Alert';


interface Dictionary {
  resetPassword: {
    title: string;
    new_password: string;
    confirm_password: string;
    submit_button: string;
    success_message: string;
    passwords_mismatch: string;
  };
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const [t, setTranslation] = useState<any>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError(t?.resetPassword.invalid_link || 'Invalid reset link');
      toast.error(t?.resetPassword.invalid_link || 'Invalid reset link');
      //router.push('/');
    }
  }, [token, email, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   setError(null); // Clear previous errors
    
    if (password !== confirmPassword) {
      setError(t?.resetPassword.passwords_mismatch || 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          email, 
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t?.resetPassword.reset_error || 'Failed to reset password');
      }

      toast.success(t?.resetPassword.success_message || 'Password reset successfully!');
      setSuccess(true);
      setTimeout(() => {
        router.push('/'); //should go to login page
      }, 20000);
    } catch (error) {
      console.error('Error:', error);
      setError(
    error instanceof Error 
      ? error.message 
      : t?.resetPassword.reset_error || 'Failed to reset password'
  );
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

  if (!t) {
    return null;
  }

  if (success) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <FontAwesomeIcon icon={faCheck} size="4x" className="text-success mb-4" />
          <h3>{t.resetPassword.success_message || 'Password reset successfully!'}</h3>
          <p>You will be redirected to login page shortly...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mx-auto" style={{ maxWidth: '500px', marginTop: '5rem' }}>
        <h2 className="mb-4 text-center">{t.resetPassword.title || 'Reset Password'}</h2>
        
        {/* Error display at the top */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <Form.Control
                type="password"
                placeholder={t.resetPassword.new_password || 'New Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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
                placeholder={t.resetPassword.confirm_password || 'Confirm Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 mb-3"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : t.resetPassword.submit_button || 'Reset Password'}
          </Button>
        </Form>
      </div>
    </Container>
  );
}