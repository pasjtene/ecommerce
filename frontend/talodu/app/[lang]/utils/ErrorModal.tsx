"use client"
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface AppError {
  message: string;
  details?: string;
  code?: string;
  response?: string;
  error?: string;
}

interface ErrorModalProps {
  show: boolean;
  onClose: () => void;
  error?: AppError;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ 
  show, 
  onClose,
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
          <strong>{error?.message}</strong>
          
           
            {!error?.message && (
            <div className="mt-2 text-muted">
              <strong>{error?.error} <div>Contact an admin if you need help</div></strong>
              {error?.code && (
                <div className="mt-1">
                  <small>Contact an admin if you need help </small>
                </div>
              )}
            </div>
          )}
          {(!error?.message && !error?.error) && (
            <div className="mt-2 text-muted">
              <strong>{error?.error}</strong>
              {error?.code && (
                <div className="mt-1">
                  <small>An unknown error occurred </small>
                </div>
              )}
            </div>
          )}
           
           
         
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