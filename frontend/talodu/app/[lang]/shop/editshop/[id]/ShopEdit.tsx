'use client';
import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../../../../../src/layout/PageWrapper/PageWrapper';
import Page from '../../../../../src/layout/Page/Page';
import Card, { CardBody } from '../../../../../src/components/bootstrap/Card';

import Button from '../../../../../src/components/bootstrap/Button';
//import useDarkMode from '../../../hooks/useDarkMode';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { User, Role, Shop, ShopUser, Product } from '../../../types';
import { toast } from 'react-toastify';
import ProductAddComponent  from './ProductAddComponent'
import { useAuth, AuthProvider } from '../../../contexts/AuthContextNext';
import ConfirmDelete from '../../../utils/ConfirmDelete';
import ErrorModal from '../../../utils/ErrorModal';

import ShopProductListNext from '../../../shop/products/[id]/ShopProductListNext';

interface LocationState {
	shop?: Shop;
}

interface AppError {
  message: string;
  details?: string;
  code?: string;
}

interface ShopeditProps {
	shop: Shop; // Pass the fetched product from the Server Component
}

const ShopEdit = ({ shop }: ShopeditProps) => {
	const [isEditing, setIsEditing] = useState(false);
	//const { darkModeStatus } = useDarkMode();
	const [isAddingProduct, setisAddingProduct] = useState(false);
	//const { handleActionClick } = useDropdownActions();
	const [loading, setLoading] = useState<boolean>(true);
	const { user, isShopOwner } = useAuth();
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [editedShop, setEditedShop] = useState<Shop>(shop);

	const router = useRouter();

	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

	const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  //const [errorMessage, setErrorMessage] = useState('');
  //const [errorDetails, setErrorDetails ] = useState('');
  const [apiError, setApiError] = useState<AppError>();
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleDeleteError = (error: AppError) => {
	
	setApiError(error);
    setShowErrorModal(true);
  };

	const toggleDropdown = (userId: number) => {
		setOpenDropdownId((prevId) => (prevId === userId ? null : userId));
	};

	const handleConfirmDelete = () => {

	}

	const useDropdownActions = () => {
		const handleActionClick = (e: React.MouseEvent<HTMLDivElement>, action: () => void) => {
			e.stopPropagation();
			action();
			setOpenDropdownId(null); // Close dropdown after action
		};

		return { handleActionClick };
	};

	//{
		
             useEffect(() => {
               const stateShop = shop;
              if (stateShop) {
              console.log("The shop in state is: ",stateShop)
                setLoading(false);
              } else {
                  setError('Invalid shop data');
                  return;
              }
            }, []);
               
	//}

	// Handle input changes
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;

		setEditedShop((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleViewShopProducts = (shop: Shop) => {
		console.log('The shop is: ', shop);
		if (shop.Slug) {
			//navigate(`../${demoPagesMenu.sales.subMenu.shopProducts.path}/${shop.Slug}`, { state: { shop } })
		} else {
			//navigate(`../${demoPagesMenu.sales.subMenu.shopProducts.path}/${shop.ID}`, { state: { shop } })
		}
	};

	const handleManageShop = () => {
		// navigate(`../${demoPagesMenu.sales.subMenu.shopsList.path}`, { state:  { user } })
	};

	// Handle view details
	const handleViewDetailsLug = (product: Product) => {
		// navigate(`../${demoPagesMenu.sales.subMenu.productID.path}/${product.Slug}`, { state: { product } })
	};

	const handleSave = async (newProduct: Product) => {
		try {
            if (typeof window !== 'undefined') {
                const access_token = localStorage.getItem('j_auth_token');
                
                localStorage.setItem('j_user', JSON.stringify(user));
                axios.defaults.headers.common['Authorization'] = `${access_token}`;
                }
			const response = await axios.post(API_BASE_URL + `/products`, newProduct);
			//setCurrentProduct(response.data);
			setisAddingProduct(false);
			toast.success(`Product created savedsuccessfully`);
			handleViewDetailsLug(response.data);
			// Show success toast
		} catch (error) {
			if (axios.isAxiosError(error)) {
				// The error has a response from the server
				if (error.response) {
					toast.error(`Failed to create product: ${error.response.data.error || error.message}`);
				}
			}
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		console.log('The edited shop data', editedShop);

		try {
			const response = await axios.put(API_BASE_URL + `/shops/${shop.ID}`, editedShop);
			console.log('Shop data to save:', response.data);
			//alert('Votre boutique a été mise a jour!');
            toast.success(`Votre boutique a été mise a jour!`);
			setIsEditing(false);
			setisAddingProduct(false);
		} catch (error) {
			console.error('Error updating shop:', error);
			alert('Failed to update shop');
		} finally {
			setIsLoading(false);
		}
	};

	//Display loading spinner while loading data from API
	if (loading)
		return (
			<div className='d-flex justify-content-center my-5'>
				<div className='spinner-border text-primary' role='status'>
					<span className='visually-hidden'>Loading...</span>
				</div>
			</div>
		);

	if (error) {
		return <div>Error loading users: {error}</div>;
	}

	if (!user) {
		return <div>Vous devez etre connecté pour voir cette page</div>;
	}

	return (
		<PageWrapper>
			<div>
				<div>
					{isEditing ? (
						<Button color='info' isLink onClick={() => setIsEditing(false)}>
							Annuler
						</Button>
					) : (
						<Button
							color='info'
							isLink
							onClick={() => {
								setIsEditing(true);
								setisAddingProduct(false);
							}}>
							Modifier ma boutique
						</Button>
					)}

					<Button
						color='info'
						isLink
						onClick={() => {
							setisAddingProduct(true);
							setIsEditing(false);
						}}>
						Ajouter un produit
					</Button>
				</div>
			</div>

			<div>
			  {isShopOwner(shop) && (
                <div className='col-md-4 col-6 mt-4'>
                <button

                    className="bg-transparent border-0 p-0 text-danger"
                    style={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                    e.currentTarget.style.color = '#bd2130'; // darker red
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                        e.currentTarget.style.color = '#dc3545'; // original red
                      }}
                        
                        onClick={() => {setShowConfirmModal(true);}}>
                        Delete my shop
                    </button>
                </div>

            )}
			</div>
			
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
							<div className='d-flex justify-content-between align-items-center mb-3'></div>

							<div className='card'>
								{isEditing ? (
									<div className='card-header'>
										<h3>Modiffication of {editedShop?.name}</h3>
									</div>
								) : (
									<div className='card-header'>
										<h3>Details of {editedShop?.name}</h3>
										<Button
											color='info'
											isLink
											onClick={() => {
												handleViewShopProducts(shop);
											}}>
											See online
										</Button>
									</div>
								)}

								<div className='card-body'>
									<form onSubmit={handleSubmit}>
										{isEditing ? (
											<div className='mb-3'>
												<label className='form-label'>Name</label>
												<input
													type='text'
													className='form-control'
													name='name'
													value={editedShop?.name}
													onChange={handleChange}
													required
												/>
											</div>
										) : (
											<div className='text text-4 text-danger'>Nom: {editedShop?.name}</div>
										)}

										<div className='row mb-3'>
											{isEditing ? (
												<div className='col-md-6'>
													<label className='form-label'>Moto</label>
													<input
														type='text'
														className='form-control'
														name='moto'
														value={editedShop?.moto}
														onChange={handleChange}
														min='0'
														step='0.01'
														required
													/>
												</div>
											) : (
												<div>Slogan: {editedShop?.moto}</div>
											)}

											{isEditing ? (
												<div className='col-md-6'>
													<label className='form-label'>City</label>
													<input
														type='text'
														className='form-control'
														name='city'
														value={editedShop?.City}
														onChange={handleChange}
													/>
												</div>
											) : (
												<div>Ville: {editedShop?.City}</div>
											)}
										</div>

										{isEditing ? (
											<div className='mb-3'>
												<label className='form-label'>Description</label>
												<textarea
													className='form-control'
													name='description'
													value={editedShop?.description}
													onChange={handleChange}
													rows={3}
												/>
											</div>
										) : (
											<div className='text text-4 text-primary'>
												Description: {editedShop?.description}
											</div>
										)}

										<div className='mb-3'>
											<label className='form-label'>Owner: </label>
											<div className='row'>
												{editedShop.owner.FirstName} {editedShop.owner.LastName}
											</div>
										</div>
										<Button
											color='info'
											isLink
											onClick={() => {
												setisAddingProduct(true);
												setIsEditing(false);
											}}>
											Add a product
										</Button>

										{isEditing && (
											<div className='d-flex justify-content-end gap-2'>
												<button type='submit' className='btn btn-primary' disabled={isLoading}>
													Save
												</button>
											</div>
										)}
									</form>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</Page>

			<div>
				<div>
				<ShopProductListNext shop={shop} />
				</div>

				 <ConfirmDelete 
					shop={shop}
					show={showConfirmModal}
					onClose={() => setShowConfirmModal(false)}
					onError={handleDeleteError}
				/>

				<ErrorModal 
					show={showErrorModal}
					onClose={() => setShowErrorModal(false)}
					error={apiError}
				/>

				
			</div>

		</PageWrapper>
	);
};

export default ShopEdit;
