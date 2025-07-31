// app/[lang]/products/[id]/translations/ProductTranslationForm.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { Product } from '../../../types';
import { useParams } from 'next/navigation';

const ProductTranslationForm = ({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product: Product,
  onSave: (translation: any) => void, 
  onCancel: () => void 
}) => {
  const params = useParams();
  const [language, setLanguage] = useState(params.lang);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState<{
    name: string;
    description: string;
  } | null>(null);

  // Find existing translation when language changes
  useEffect(() => {
    if (product.translations) {
      const translation = product.translations.find(t => t.language === params.lang);
      if (translation) {
        setCurrentTranslation({
          name: translation.name,
          description: translation.description || ''
        });
        setName(translation.name);
        setDescription(translation.description || '');
      } else {
        setCurrentTranslation(null);
        setName('');
        setDescription('');
      }
    }
  }, [params.lang, product.translations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      product_id: product.ID,
      language,
      name,
      description
    });
  };

  // Get all translations including original
  const getAllTranslations = () => {
    const translations = [
      {
        language: 'Original',
        name: product.name,
        description: product.description
      },
      ...(product.translations || []).map(t => ({
        language: t.language.toUpperCase(),
        name: t.name,
        description: t.description || ''
      }))
    ];
    return translations;
  };

  return (
    <div className="card p-4">
      <Form onSubmit={handleSubmit}>
        <div>
          <h2 className="mb-4">
            {currentTranslation?.name || product.name}
            
          </h2>
        </div>
        
        <h3 className="mb-4">
          {currentTranslation ? 'Edit Translation' : 'Add Translation'}
        </h3>
        
        {/* Translations Table */}
        <div className="mb-4">
          <h5>Existing Translations</h5>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Language</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {getAllTranslations().map((translation, index) => (
                <tr key={index}>
                  <td>{translation.language}</td>
                  <td>{translation.name}</td>
                  <td className="text-truncate" style={{maxWidth: '200px'}}>
                    {translation.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        
        <Form.Group className="mb-3">
          <Form.Label>Language</Form.Label>
          <Form.Select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            required
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Translated Name</Form.Label>
          <Form.Control 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder={product.name}
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Translated Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder={product.description || ''}
          />
        </Form.Group>
        
        <div className="d-flex gap-2">
          <Button variant="primary" type="submit" className="mt-3">
            {currentTranslation ? 'Update Translation' : 'Save Translation'}
          </Button>
          <Button 
            variant="outline-secondary" 
            className="mt-3"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProductTranslationForm;