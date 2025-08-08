// app/[lang]/shop/createshop/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContextNext';
import axios from 'axios';
import { Form, Button, Container, Alert, Card, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faInfoCircle, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

const CreateShopPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [moto, setMoto] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to create a shop');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";
       const payload = {
        name,
        description,
        moto,
        owner_id: user.ID // Make sure this is included
      };

      const response = await axios.post(`${API_BASE_URL}/shops`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('j_auth_token') || ''}`
        }
      });

      if (response.data) {
        router.push(`/${params.lang}/shop/listshops`);
      }
    } catch (err: unknown) {
      console.error('Shop creation failed:', err);
      if (axios.isAxiosError(err)) {
        // Improved error message extraction
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.message || 
                            'Failed to create shop';
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center">
        <Card className="p-4" style={{ maxWidth: '600px', width: '100%' }}>
          <Card.Body>
            <h2 className="text-center mb-4">
              <FontAwesomeIcon icon={faStore} className="me-2" />
              Create Your Shop
            </h2>

            {error && (
              <Alert variant="danger" className="mb-4" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Shop Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter shop name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                />
                <Form.Text className="text-muted">
                  This will be your public shop name
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Tell customers about your shop"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  Maximum 500 characters
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>
                  <FontAwesomeIcon icon={faQuoteLeft} className="me-2" />
                  Moto/Tagline
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="A short tagline for your shop"
                  value={moto}
                  onChange={(e) => setMoto(e.target.value)}
                  maxLength={100}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting || !name}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Creating...
                    </>
                  ) : (
                    'Create Shop'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default CreateShopPage;