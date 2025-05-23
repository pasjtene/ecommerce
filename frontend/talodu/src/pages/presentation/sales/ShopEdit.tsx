import React, { useState, useEffect, useMemo} from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
    SubHeaderLeft,
    SubHeaderRight,
    SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Page from '../../../layout/Page/Page';
import { demoPagesMenu } from '../../../menu';
import Card, { CardBody } from '../../../components/bootstrap/Card';

import Button from '../../../components/bootstrap/Button';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';

import useDarkMode from '../../../hooks/useDarkMode';
import axios from 'axios'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { updateUser, API_BASE_URL } from '../auth/api'
import { User, Role, Shop, ShopUser } from '../auth/types'
import { toast } from 'react-toastify';


  interface LocationState {
    shop?: Shop;
  }

const ShopEdit = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { darkModeStatus } = useDarkMode();

    const [shop, setShop] = useState<Shop>({
        ID: 0,
        name: '',
        Slug: '',
        description: '',
        moto: '',
        OwnerID: 0,
        owner: {} as ShopUser,
        Employees: [],
        products: [],
        City: ''
      });
    
    const { state } = useLocation();

    const navigate = useNavigate();

    //const [dropdownOpen, setDropdownOpen] = useState<Record<number, boolean>>({});
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    const toggleDropdown = (userId: number) => {
        setOpenDropdownId(prevId => prevId === userId ? null : userId);
    };

    const useDropdownActions = () => {
    const handleActionClick = (e: React.MouseEvent<HTMLDivElement>, action: () => void) => {
      e.stopPropagation();
      action();
      setOpenDropdownId(null); // Close dropdown after action
    };
  
    return { handleActionClick };
  };


   useEffect(() => {
               const stateShop = state?.shop;
               //console.log("Shop owner",state?.shop.owner)
              if (stateShop) {
              // if (stateProduct && stateProduct.Slug === slug) {
              console.log("The shop in state is: ",stateShop)
                setShop(stateShop);
                setLoading(false);
              } else {
                  //const productId = slug?.split('-').pop();
                  const prodid = stateShop.id?.split('-').pop();
                  if (!prodid) {
                  setError('Invalid product URL');
                  return;
                  }
                
              }
            }, []);

 
  // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShop(prev => ({
      ...prev,
      [name]: value
    }));
  };


    const { handleActionClick } = useDropdownActions();
    const [loading, setLoading] = useState<boolean>(true);
   
    
    const [error, setError] = useState<string | null>(null);
    const jwtToken = localStorage.getItem('j_auth_token'); // Assuming you store the token in localStorage
  
    const [isLoading, setIsLoading] = useState(false);

      // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("The shop data", shop)
        
        try {
        const response = await axios.put(API_BASE_URL+`/shops/${shop.ID}`, shop);
        console.log('Shop data to save:', response.data);
        alert('Shop updated successfully!');
        setIsEditing(false);
        } catch (error) {
        console.error('Error updating shop:', error);
        alert('Failed to update shop');
        } finally {
        setIsLoading(false);
        }
    };

    //Display loading spinner while loading data from API                
    if (loading) return (
        <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        </div>
    );

    if (error) {
    return <div>Error loading users: {error}</div>;
    }

    return (
        <PageWrapper title={demoPagesMenu.crm.subMenu.usersList.text}>
             <SubHeader>
                          <SubHeaderLeft>

                          {isEditing ? (
                          
                              <Button color='info' isLink onClick={() => setIsEditing(false)}>
                              Annuler
                              </Button>):(
                                <Button color='info' isLink onClick={() => setIsEditing(true)}>
                                Modifier ma boutique
                                </Button>
                              )}

                              <SubheaderSeparator />
                              
                          </SubHeaderLeft>

                         </SubHeader>
            <Page>
                <div className='row h-100'>
                    <div className='col-12'>
                        <Card stretch>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                   
                  </div>
     
                  <div className="card">
                  {isEditing ? (
                    <div className="card-header">
                        <h3>Modiffication de {shop?.name}</h3>
                    </div>):(
                        <div className="card-header">
                        <h3>Détailles de {shop?.name}</h3>
                    </div>
                    )}

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {isEditing ? (
                                 <div className="mb-3">
                                 <label className="form-label">Name</label>
                                 <input
                                 type="text"
                                 className="form-control"
                                 name="name"
                                 value={shop?.name}
                                 onChange={handleChange}
                                 required
                                 />
                             </div>
                            ):(<div className='text text-4 text-danger'>Nom: {shop?.name}</div>)}
                       
                       
                            <div className="row mb-3">
                            {isEditing ? (
                                <div className="col-md-6">
                                <label className="form-label">Moto</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="moto"
                                    value={shop?.moto}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                </div>
                                ):(<div>Slogan: {shop?.moto}</div>)}

                        {isEditing ? (
                                <div className="col-md-6">
                                <label className="form-label">City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="city"
                                    value={shop?.City}
                                    onChange={handleChange}
                                    
                                    
                                />
                                </div>):(<div>Ville: {shop?.City}</div>)}

                            </div>

                            {isEditing ? (

                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                className="form-control"
                                name="description"
                                value={shop?.description}
                                onChange={handleChange}
                                rows={3}
                                />
                            </div>):(<div className='text text-4 text-primary'>Description: {shop?.description}</div>)}

                            <div className="mb-3">
                                <label className="form-label">Proprietaire: </label>
                                <div className="row">
                                {shop.owner.FirstName} {shop.owner.LastName}
                                </div>
                                
                            </div>

                            {isEditing && (
                            <div className="d-flex justify-content-end gap-2">
                            
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                 Enregistrer
                                </button>
                            </div>)}

                            </form>
                        </div>
                        </div>

                        </Card>
                    </div>
                </div>
            </Page>
            
        </PageWrapper>
    );
};

export default ShopEdit;