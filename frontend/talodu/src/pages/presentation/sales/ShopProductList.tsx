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
import ImageDisplayComponent from './ImageDisplayComponent'


  interface LocationState {
    shop?: Shop;
  }


const ShopProductList = () => {
    //const ProductEditComponent = ({ product, onSave, onCancel }: ProductEditProps) => {
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
        products: []
      });
    
    const { state } = useLocation();

    const navigate = useNavigate();
 
    const [isNewUser, setisNewUser] = useState(false);

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
               console.log("Shop owner",state?.shop.owner)
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
    const [createModalStatus, setCreateModalStatus] = useState<boolean>(false);

      // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log("The shop data", shop)
        
        try {
        // Add your API call here to save the shop
        // await updateShop(shop);
        const response = await axios.put(API_BASE_URL+`/shops/${shop.ID}`, shop);
        console.log('Shop data to save:', response.data);
        alert('Shop updated successfully!');
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
                    <label
                        className='border-0 bg-transparent cursor-pointer me-0'
                        htmlFor='searchInput'>
                        <Icon icon='Search' size='2x' color='primary' />
                    </label>
                    <Input
                        id='searchInput'
                        type='search'
                        className='border-0 shadow-none bg-transparent'
                        placeholder='Search customer...2..'
                        onChange={handleChange}
                        value={shop.name}
                        
                    />
                </SubHeaderLeft>
                <SubHeaderRight>
                   
                    <SubheaderSeparator />
                    <Button
                        icon='PersonAdd'
                        color='primary'
                        isLight
                        onClick={() => {setCreateModalStatus(true); setisNewUser(true);}}>
                        Add New Shop
                    </Button>
                </SubHeaderRight>
            </SubHeader>
            <Page>
                <div className='row h-100'>
                    <div className='col-12'>
                        <Card stretch>
                        <div>
                        <h3>Shop Edit</h3>  
                        </div>
   
                    <div className="d-flex justify-content-between align-items-center mb-3">
                   
                  </div>
     
                  <div className="card">
                    <div className="card-header">
                        <h3>Shop products</h3>
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
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

                            <div className="row mb-3">
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
                                <div className="col-md-6">
                                <label className="form-label">City</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="FirstName"
                                    value={shop?.moto}
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
                                {shop.owner.FirstName} {shop.owner.LastName}
                                </div>
                                <div className="row">
                                Slug: {shop.Slug}
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                            
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            </form>
                        </div>
                        </div>

                        </Card>
                    </div>
                </div>



                    <div>
                    
                    <ImageDisplayComponent shop={shop} />
                    </div>




            </Page>
            
        </PageWrapper>
    );
};

export default ShopProductList;