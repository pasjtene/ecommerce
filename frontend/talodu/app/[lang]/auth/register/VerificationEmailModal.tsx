// app/[lang]/auth/register/VerificationEmailModal.tsx
'use client'
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface VerificationEmailModalProps {
  show: boolean;
  onClose: () => void;
  email: string;
  onResend: () => void;
}

const VerificationEmailModal: React.FC<VerificationEmailModalProps> = ({ 
  show, 
  onClose, 
  email,
  onResend 
}) => {
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

        <div className="text-center">
          <Button 
            variant="link" 
            className="text-primary"
            onClick={onResend}
          >
            Resend Verification Email
          </Button>
        </div>

        <Button 
          variant="primary" 
          className="w-100 mt-3"
          onClick={onClose}
        >
          Got It
        </Button>
      </div>
    </Modal>
  );
};

export default VerificationEmailModal;