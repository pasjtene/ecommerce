// app/[lang]/shop/createshop/page.tsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContextNext';
import axios from 'axios';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faInfoCircle, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

const CreateShopPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [moto, setMoto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to create a shop');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";
      const response = await axios.post(`${API_BASE_URL}/shops`, {
        name,
        description,
        moto,
        owner_id: user.id
      }, {
        headers: {
          Authorization: localStorage.getItem('j_auth_token') || ''
        }
      });

      if (response.data) {
        router.push(`/shop/${response.data.id}/products`);
      }
    } catch (err: unknown) {
      console.error('Shop creation failed:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create shop');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

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
              <Alert variant="danger" className="mb-4">
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
                />
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
                />
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
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Shop'}
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