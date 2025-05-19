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
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { updateUser, API_BASE_URL } from '../auth/api'
import { User, Role, Shop, ShopUser, Product } from '../auth/types'
import { toast } from 'react-toastify';
import ImageDisplayComponent from './ImageDisplayComponent'
import ProductAddComponent from './ProductAddComponent'


  interface LocationState {
    shop?: Shop;
  }


const ShopProductList = () => {
    const { darkModeStatus } = useDarkMode();
    const { id } = useParams<{ id: string }>();
    const [isAddingProduct, setisAddingProduct] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');


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
                  const shopid = id?.split('-').pop();
                  if (!shopid) {
                  setError('Invalid product URL');
                  return;
                  }
                  fetchShop(shopid);
              }
            }, []);

            const fetchShop = async (id: string) => {
                        try {
                          setLoading(true);
                          const response = await axios.get<{shop:Shop}>(
                            API_BASE_URL+`/shops/${id}`
                          );
                          console.log("The shop data fetched response is: ",response.data)
                          console.log("The shop fetched response is: ",response.data.shop)
                         // setShop(response.data.shop);
                         setShop(response.data.shop);
                          setError(null);
                        } catch (err) {
                          setError('Failed to load product details');
                          console.error('Error fetching product:', err);
                        } finally {
                          setLoading(false);
                        }
                      };

 
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
        //setIsLoading(true);
        //console.log("The shop data", shop)
        alert('Tel: 696 65 66 50 - Situé a denver, apres la fondation Francis Nganou');
        
        try {

        } catch (error) {
        console.error('Error updating shop:', error);
        alert('Failed to update shop');
        } finally {
        setIsLoading(false);
        }
    };

    const handleSave = async (updatedProduct: Product) => {
        console.log("The prduct to update: ", updatedProduct)
        try {
          const response = await axios.post(API_BASE_URL+`/products`, updatedProduct);
          //setCurrentProduct(response.data);
          setisAddingProduct(false);
          // Show success toast
              toast.success(`Product created savedsuccessfully`);
            } catch (error) {
          if (axios.isAxiosError(error)) {
            // The error has a response from the server
            if (error.response) {
                toast.error(`Failed to create product: ${error.response.data.error || error.message}`);
            } 
        }

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
        <PageWrapper title={shop.name}>
                <SubHeader>
                    <SubHeaderLeft>
                        <label
                            className='border-0 bg-transparent cursor-pointer me-0'
                            htmlFor='searchInput'>
                            <Icon icon='Search' size='2x' color='primary' />
                        </label>
                        <Input
                            id='searchInput'
                            //type='search'
                            type='text'
                            className='border-0 shadow-none bg-transparent'
                            placeholder='Search products..'
                            value={searchTerm}
                            onChange={(e:React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            
                        />
                    </SubHeaderLeft>
                <SubHeaderRight>
                   
                    <SubheaderSeparator />
                    <Button
                        icon='PersonAdd'
                        color='primary'
                        isLight
                        onClick={() => {setisAddingProduct(true);}}>
                        Ajouter un produit
                    </Button>
                </SubHeaderRight>
            </SubHeader>
            <Page>

            <div className="container mt-4">
        {isAddingProduct ? (
          <ProductAddComponent 
            shop={shop}
            onSave={handleSave}
            onCancel={() => setisAddingProduct(false)}
          />
        ) : (<></>)
        }
    </div>
          
          
          

                <div className='row h-100'>
                    <div className='col-12'>
                        <Card stretch>
                        <div className="card-body">
                        <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                           
                        </div>

                            <div className="mb-3">
                                <label className="form-label text-decoration-none display-6 py-3 text-danger">{shop.name} </label>
                                
                                <div className="row text-decoration-none display-3 py-3 text-primary">
                                {shop.moto} 
                                </div>
                                
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                            
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Nous contacter'}
                                </button>
                            </div>
                            </form>
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