//ConfirmDelete.tsx
"use client"
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faEnvelope, faLock, faUserPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { Shop } from '../../types';
import axios from 'axios';
import { useRouter } from 'next/navigation'
import { handleApiError } from '../../utils/errorHandler';


interface AppError {
  message: string;
  details?: string;
  code?: string;
}

interface ConfirmDeleteProps {
  shop?: Shop;
  show: boolean;
  onClose: () => void;
  onError: (error: AppError) => void;
  imageIds: string[];
  onImagesDeleted: (ids: string[]) => void
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ shop, show, onClose, onError,imageIds,onImagesDeleted}) => {
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
                if (typeof window !== 'undefined') {
                const token = localStorage.getItem('j_auth_token');
                console.log("The shop is: ",shop);

				await axios.delete(API_BASE_URL+'/products/images/delete/batch', {
                    data: { ids: imageIds, shop: shop },
					headers: {
						//Authorization: `Bearer ${token}`,
                        Authorization: `${token}`,
					},
				});
                onImagesDeleted(imageIds);
                onClose();
                
                //toast.success('Succes vous etes connecté');
                if(shop) {
                   // router.push('/shop/listshops');
                }
                
            }
      
    } catch (error:unknown) {
        console.log("The error: ",error);
        const formattedError = handleApiError(error);
        onError(formattedError);
      onClose();
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

        <h4 className="mb-4 text-center">Delete {imageIds?.length} images ?</h4>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <span className="input-group-text">
               Shop Owner: {shop?.owner.FirstName} {shop?.owner.LastName}
              </span>

            </div>
          </Form.Group>

           <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <span className="input-group-text">
               Shop name: {shop?.name}
              </span>

            </div>
          </Form.Group>


          <Form.Group className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <span className="input-group-text">
                owner email: {shop?.owner.Email}
                
              </span>

            </div>
          </Form.Group>


          <Button 
            variant="danger" 
            type="submit" 
            className="w-100 mb-3"
          >
            Yes Delete shop
          </Button>

          <div className="text-center">
            <p className="mb-1">Not ready to delete?</p>
            <Button 
              variant="outline-primary" 
              onClick={onClose}
              className="w-100"
            >
              
              Cancel 
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ConfirmDelete;