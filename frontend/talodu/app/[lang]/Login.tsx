"use client"
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faLock, faUserPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { useAuth} from './AuthContextNext';
import { useParams } from 'next/navigation';

interface LoginProps {
  show: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

interface Dictionary {
  login: {
    title: string;
    email_placeholder: string;
    password_placeholder: string;
    submit_button: string;
    forgot_password: string;
    no_account: string;
    create_account: string;
    success_message: string;
    show_password: string;
  };
}

const Login: React.FC<LoginProps> = ({ show, onClose, onSwitchToRegister}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const params = useParams();
  const [t, setTranslation] = useState<Dictionary | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (typeof window !== 'undefined') {
            await login(email, password);
        }
      onClose();
      toast.success('Succes vous etes connecté');
      window.location.reload();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

   // Load dictionary
  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await import(`./translations/${params.lang}.json`);
      setTranslation(dict.default);
    };
    loadDictionary();
  }, [params.lang]);


  if (!t) {
    return null; // or loading spinner
  }

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

        <h4 className="mb-4 text-center">{t.login.title}</h4>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <Form.Control
                type="email"
                placeholder={t.login.email_placeholder}
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
                placeholder={t.login.password_placeholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 mb-3"
          >
            {t.login.submit_button}
          </Button>

          <div className="text-center mb-3">
            <Button variant="link" size="sm">
              {t.login.forgot_password}
            </Button>
          </div>

          <div className="text-center">
            <p className="mb-1">{t.login.no_account}</p>
            <Button 
              variant="outline-primary" 
              onClick={onSwitchToRegister}
              className="w-100"
            >
              <FontAwesomeIcon icon={faUserPlus} className="me-2" />
              {t.login.create_account}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default Login;