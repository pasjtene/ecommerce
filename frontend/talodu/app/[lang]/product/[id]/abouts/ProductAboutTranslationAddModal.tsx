'use client';
import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const ProductAboutTranslationAddModal = ({ 
    about, 
    languages, 
    onSave, 
    onCancel 
}: { 
    about: any,
    languages: string[],
    onSave: (translation: any) => void,
    onCancel: () => void 
}) => {
    const [language, setLanguage] = useState(languages[0]);
    const [aboutText, setAboutText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            product_about_id: about.id,
            language,
            about_text: aboutText
        });
    };

    return (
        <Modal show={true} onHide={onCancel}>
            <Modal.Header closeButton>
                <Modal.Title>Add Translation for the folowing text</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                         {about.about_text}
                        <Form.Label>Language</Form.Label>
                        <Form.Select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>
                                    {lang.toUpperCase()}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Translated Text</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Translation
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ProductAboutTranslationAddModal;