import React, { useState, useReducer, useEffect, useMemo} from 'react';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import Page from '../../../layout/Page/Page';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import useDarkMode from '../../../hooks/useDarkMode';
import axios from 'axios'
import { useNavigate, Link, useLocation, useParams } from 'react-router-dom';
import { updateUser, API_BASE_URL } from '../auth/api'
import { Shop, ShopUser, Product, User } from '../auth/types'
import { toast } from 'react-toastify';
import ImageDisplayComponent from './ImageDisplayComponent'
import ProductAddComponent from './ProductAddComponent'
import { useAuth } from '../../presentation/auth/AuthContext';
import { demoPagesMenu } from '../../../menu';


  interface LocationState {
    shop?: Shop;
  }


const ShopProductList = () => {
    const { darkModeStatus } = useDarkMode();
    const { id } = useParams<{ id: string }>();
    const [isAddingProduct, setisAddingProduct] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user, loaddata, isShopOwner, isShopEmployee} = useAuth();
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const navigate = useNavigate();


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

    const useDropdownActions = () => {
    const handleActionClick = (e: React.MouseEvent<HTMLDivElement>, action: () => void) => {
      e.stopPropagation();
      action();

    };
  
    return { handleActionClick };
  };

  useEffect(() => {
    const handleStorageChange = () => {
        console.log("Storage updated");
      forceUpdate();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCreateShop = () => {
   
    navigate(`../${demoPagesMenu.sales.subMenu.shopCreate.path}`, { state:  { user } })
    
  }

  const handleManageShop = () => {
   
    navigate(`../${demoPagesMenu.sales.subMenu.shopsList.path}`, { state:  { user } })
    
  }

    useEffect(() => {
        // This empty effect with user dependency will force re-render
        console.log("The user: ",user);
    }, [user]);


    useEffect(() => {
        const stateShop = state?.shop;
        console.log("Shop owner",state?.shop.owner)
        console.log("The user in shop products list is: ",user)
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
                    
                    setShop(response.data.shop);
                    console.log("The current shop is: ", shop);
                    console.log("The fetch shop data is: ", response.data);
                    setError(null);
                } catch (err) {
                    setError('Failed to load product details');
                    console.error('Error fetching product:', err);
                } finally {
                    setLoading(false);
                }
                };

 
    const [loading, setLoading] = useState<boolean>(true);
   
    
    const [error, setError] = useState<string | null>(null);
    const jwtToken = localStorage.getItem('j_auth_token'); // Assuming you store the token in localStorage
  
    const [isLoading, setIsLoading] = useState(false);
    

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

     // Handle view details
            const handleViewDetailsLug = (product: Product) => {
              navigate(`../${demoPagesMenu.sales.subMenu.productID.path}/${product.Slug}`, { state: { product } })
            };

    const handleSave = async (updatedProduct: Product) => {
        console.log("The prduct to update: ", updatedProduct)
        try {
          const response = await axios.post(API_BASE_URL+`/products`, updatedProduct);
          //setCurrentProduct(response.data);
          setisAddingProduct(false);
          // Show success toast
             
              console.log("The updated product: ",response.data);
              handleViewDetailsLug(response.data);
              toast.success(`Product crée avec succes`);

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
               
            <Page>
            <div className='row'>
            {isShopOwner(shop) &&(
                <div>
                    <span>Vous etes propriétaire de cette boutique</span>
                <div className='col-md-4 col-6 mt-4'>
                <Button
                        color='primary'
                        isLight
                        onClick={() => {setisAddingProduct(true);}}>
                        Ajouter un Product 
                    </Button>
                </div>
                </div>
            )}

            {user && (
                <div className='col-md-4 col-6 mt-4'>
                <Button
                        
                        color='primary'
                        isLight
                        onClick={() => {handleManageShop();}}>
                        Gerer ma boutique
                    </Button>
                </div>

            )}

        {user && (
            <div className='col-md-4 col-6 mt-4'>
                    <Button
                        
                        color='primary'
                        isLight
                        onClick={() => {handleCreateShop();}}>
                        Créer ma boutique
                    </Button>
            </div>
            )}
            
            
            </div>
              

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