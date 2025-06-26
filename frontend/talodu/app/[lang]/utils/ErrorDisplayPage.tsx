// components/ErrorDisplay.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  title = 'Something went wrong', 
  className = '' 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`error-display text-center p-4 ${className}`} 
         style={{
           maxWidth: '600px',
           margin: '2rem auto',
           borderRadius: '8px',
           backgroundColor: '#fff8f8',
           borderLeft: '4px solid #ff6b6b'
         }}>
      <div className="error-icon mb-3">
        <FontAwesomeIcon 
          icon={faExclamationTriangle} 
          size="3x" 
          color="#ff6b6b" 
        />
      </div>
      
      <h3 className="text-danger mb-3">{title}</h3>
      
      <div className="error-message mb-4" style={{ color: '#495057' }}>
        {errorMessage}
      </div>
      
      {onRetry && (
        <Button 
          variant="outline-danger" 
          onClick={onRetry}
          className="px-4"
        >
          <FontAwesomeIcon icon={faRedo} className="me-2" />
          Try Again
        </Button>
      )}
      
      <style>{`
  .error-display {
    animation: fadeIn 0.3s ease-in;
  }
`}</style>
    </div>
  );
};

export default ErrorDisplay;