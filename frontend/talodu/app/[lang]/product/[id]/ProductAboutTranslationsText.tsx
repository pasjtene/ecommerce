import React, { useState } from 'react';
import { Button, Card, ListGroup } from 'react-bootstrap';
import ProductAboutTranslationAddModal from './ProductAboutTranslationAddModal';
import axios from 'axios';

const ProductAboutTranslationsText = ({ abouts, productId, languages }: { 
    abouts: any[], 
    productId: number,
    languages: string[] 
}) => {
    const [showTranslationForm, setShowTranslationForm] = useState(false);
    const [selectedAbout, setSelectedAbout] = useState<any>(null);
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    const token = localStorage.getItem('j_auth_token');

    const handleAddTranslation = (about: any) => {
        setSelectedAbout(about);
        setShowTranslationForm(true);
    };

    const handleSaveTranslation = async (translation: any) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/products/${productId}/abouts/${translation.product_about_id}/translations`,
                translation,
                {
                //method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}` 
                },
            }
                //body: JSON.stringify(translation),
            );
            
            const r = response.data;
            console.log("The translations response: ", r)
            
            // Refresh the abouts data or update local state
            setShowTranslationForm(false);
        } catch (error) {
            console.error('Error saving translation:', error);
        }
    };

    return (
        <Card className="mb-4">
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h5>About This Product</h5>
                    <div>
                        <select 
                            className="form-select me-2" 
                            style={{ width: 'auto' }}
                            value={currentLanguage}
                            onChange={(e) => setCurrentLanguage(e.target.value)}
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    {abouts.map(about => {
                        const translation = about.translations?.find((t: any) => t.language === currentLanguage);
                        return (
                            <ListGroup.Item key={about.id}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6>#{about.item_order}:{about.about_text}</h6>
                                        <p>{translation?.about_text || 'No translation available'}</p>
                                        
                                    </div>
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm"
                                        onClick={() => handleAddTranslation(about)}
                                    >
                                        Add Translation
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </Card.Body>

            {showTranslationForm && selectedAbout && (
                <ProductAboutTranslationAddModal
                    about={selectedAbout}
                    languages={languages.filter(lang => 
                        !selectedAbout.translations?.some((t: any) => t.language === lang)
                    )}
                    onSave={handleSaveTranslation}
                    onCancel={() => setShowTranslationForm(false)}
                />
            )}
        </Card>
    );
};

export default ProductAboutTranslationsText;