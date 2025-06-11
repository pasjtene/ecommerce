"use client"
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface AppError {
  message: string;
  details?: string;
  code?: string;
}

interface ErrorModalProps {
  show: boolean;
  onClose: () => void;
  //errorMessage: string;
  //errorDetails?: string;
  error?: AppError;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ 
  show, 
  onClose, 
  //errorMessage,
  //errorDetails 
  error
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Operation Failed
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
       <div className="alert alert-danger">
          <strong>{error?.message || 'An unknown error occurred'}</strong>
          {error?.details && (
            <div className="mt-2 text-muted">
              <small>{error.details}</small>
              {error?.code && (
                <div className="mt-1">
                  <small>Contact an admin if you need help </small>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;