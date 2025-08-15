// app/[lang]/auth/register/VerificationEmailComponent.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';

interface VerificationEmailModalProps {
  email: string;
  onResend: () => void;
}

const VerificationEmailComponent: React.FC<VerificationEmailModalProps> = ({ 
  email,
  onResend 
}) => {
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [hasResent, setHasResent] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [countdown]);

  const handleResend = () => {
    if (isResendDisabled || hasResent) return;
    
    onResend();
    setHasResent(true);
    setIsResendDisabled(true);
    setCountdown(120); // Reset countdown
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
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
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: '#333'
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </Button>

      <div className="text-center mb-4">
        <FontAwesomeIcon 
          icon={faEnvelope} 
          size="3x" 
          className="text-primary mb-3"
        />
        <h4>Verify Your Email</h4>
      </div>

      <div className="text-center mb-4">
        <p>We've sent a verification email to:</p>
        <p className="fw-bold">{email}</p>
        <p>Please check your inbox and click the link to verify your account.</p>
      </div>

      <div className="text-center mb-4">
        {countdown > 0 ? (
          <p>You can click to resend the email in {formatTime(countdown)}</p>
        ) : (
          <p>Didn't receive the email?</p>
        )}
      </div>

      <div className="text-center">
        <Button 
          variant="link" 
          className="text-primary"
          onClick={handleResend}
          disabled={isResendDisabled || hasResent}
        >
          {hasResent ? 'Email Resent' : 'Resend Verification Email'}
        </Button>
      </div>

      <Button 
        variant="primary" 
        className="w-100 mt-3"
      >
        Got It
      </Button>
    </div>
  );
};

export default VerificationEmailComponent;