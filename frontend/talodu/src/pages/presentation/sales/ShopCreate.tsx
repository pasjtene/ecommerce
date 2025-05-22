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
import { useAuth } from '../../presentation/auth/AuthContext';


  interface LocationState {
    shop?: Shop;
  }

  interface ShopFormData {
    //id: number,
    name: string;
    description: string;
    moto: string;
    owner_id: string;
  }

const ShopCreate = () => {
    //const ProductEditComponent = ({ product, onSave, onCancel }: ProductEditProps) => {
    const { darkModeStatus } = useDarkMode();
    const { user, loaddata } = useAuth();
    const { state } = useLocation();


    const [shop, setShop] = useState<ShopFormData >({
        
        name: '',
        
        description: '',
        moto: '',
        owner_id:  state.user?.ID || user?.id,
        ////owner: {} as ShopUser,
        //Employees: [],
        //products: [],
        //City: ' '
      });

      const [shop1, setShop1] = useState<Shop>({
        ID: 0,
        name: '',
        Slug: '',
        description: '',
        moto: '',
        OwnerID:  state.user?.ID || user?.id,
        owner: {} as ShopUser,
        Employees: [],
        products: [],
        City: ' '
      });
    
    

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
               const stateShop = state?.user;
               console.log("Shop owner",state?.user.name)
              if (stateShop) {
              // if (stateProduct && stateProduct.Slug === slug) {
              console.log("The user in state is: ",stateShop)
                //setShop(stateShop);
                setLoading(false);
              } else {
                  //const productId = slug?.split('-').pop();
                  console.log("The user is: ",user)
                  setLoading(false);
                
              }
            }, []);

 
  // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShop(prev => ({
      ...prev,
      [name]: value
    }));

    console.log("The updated shop is: ", shop);
  };


    const { handleActionClick } = useDropdownActions();
    const [loading, setLoading] = useState<boolean>(true);
   
    
    const [error, setError] = useState<string | null>(null);
    const jwtToken = localStorage.getItem('j_auth_token'); // Assuming you store the token in localStorage
  
    const [isLoading, setIsLoading] = useState(false);

    const handleManageShop = () => {
       
        navigate(`../${demoPagesMenu.sales.subMenu.shopsList.path}`, { state:  { user } })
        
      }

      // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("The shop data", shop)
        
        try {
        const response = await axios.post(API_BASE_URL+`/shops`, shop);
        //console.log('Shop data to save:', response.data);
        alert('Votre boutique a été crée avec succes!');
        handleManageShop();
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
                    <Button color='info' isLink icon='ArrowBack' onClick={() => handleManageShop()}>
                        Lister mes boutiques
                    </Button>
                    <SubheaderSeparator />
                    
                </SubHeaderLeft>
                <SubHeaderRight>
                    <span className='text-muted fst-italic me-2'>Last update:</span>
                    <span className='fw-bold'>13 hours ago</span>
                </SubHeaderRight>
            </SubHeader>
            <Page>
                <div className='row h-100'>
                    <div className='col-12'>
                        <Card stretch>
                        <div>
                        <h5><span className='text-danger'> {user?.FirstName} </span> tu peux ajouter des employés e des produits dans ta boutique apres</h5>  
                        </div>
   
                    <div className="d-flex justify-content-between align-items-center mb-3">
                   
                  </div>
     
                  <div className="card">
                    <div className="card-header">
                        <h3>Créer ma boutique</h3>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Nom</label>
                            <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={shop?.name}
                            onChange={handleChange}
                            required
                            />
                        </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                <label className="form-label">Slogan</label>
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
                                <div className="col-md-6">
                                <label className="form-label">City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="FirstName"
                                    //value={shop?.City}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                className="form-control"
                                name="description"
                                value={shop?.description}
                                onChange={handleChange}
                                rows={3}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Shop Owner</label>
                                <div className="row">
                                {user?.FirstName} {user?.LastName}
                                </div>
                                
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                            
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Creer ma boutique'}
                                </button>
                            </div>
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

export default ShopCreate;