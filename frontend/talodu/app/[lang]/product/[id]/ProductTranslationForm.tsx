// products/[id]/ProductTranslationForm.tsx
'use client';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { ProductImage, Product } from '../../types';

const ProductTranslationForm = ({ product, onSave, onCancel }: { product: Product,
     onSave: (translation: any) => void, onCancel: (translation: any) => void }) => {
  const [language, setLanguage] = useState('en');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      product_id: product.ID,
      language,
      name,
      description
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Language</Form.Label>
        <Form.Select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </Form.Select>
      </Form.Group>
      
      <Form.Group>
        <Form.Label>Translated Name</Form.Label>
        <Form.Control 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder={product.name}
        />
      </Form.Group>
      
      <Form.Group>
        <Form.Label>Translated Description</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder={product.description}
        />
      </Form.Group>
      
      <Button type="submit" className="mt-3">Save Translation</Button>
    </Form>
  );
};

export default ProductTranslationForm;