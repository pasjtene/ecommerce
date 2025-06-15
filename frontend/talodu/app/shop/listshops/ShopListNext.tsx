'use client';
import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../../../src/layout/PageWrapper/PageWrapper';
import Page from '../../../src/layout/Page/Page';
import Card, { CardBody } from '../../../src/components/bootstrap/Card';
import Icon from '../../../src/components/icon/Icon';
import Button from '../../../src/components/bootstrap/Button';

import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../src/components/bootstrap/Dropdown';
import axios from 'axios';
import { User, Role, Product, Shop } from '../../types';
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify';
import { useAuth, AuthProvider } from '../../AuthContextNext';
//import {  API_BASE_URL } from '../../api/api'

interface ShopsResponse {
	shops: Shop[];
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
}

interface EditFormData {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	roles: Role[]; // Array of role IDs
}

interface EditFormData2 {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	roles: number[]; // Array of role IDs
}

const ShopsList = () => {
	//const { darkModeStatus } = useDarkMode();

	//const navigate = useNavigate();
	// Available roles from your API or state
	const { user,isShopOwner, hasRole, hasAnyRole } = useAuth();
    const router = useRouter();
	const [editFormData, setEditFormData] = useState<EditFormData>({
		id: 0,
		username: '',
		email: '',
		first_name: '',
		last_name: '',
		roles: [],
	});

	const [editFormData2, setEditFormData2] = useState<EditFormData2>({
		id: 0,
		username: '',
		email: '',
		first_name: '',
		last_name: '',
		roles: [],
	});

	const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

	const toggleDropdown = (userId: number) => {
		setOpenDropdownId((prevId) => (prevId === userId ? null : userId));
	};

	const useDropdownActions = () => {
		const handleActionClick = (e: React.MouseEvent<HTMLDivElement>, action: () => void) => {
			e.stopPropagation();
			action();
			setOpenDropdownId(null); // Close dropdown after action
		};

		return { handleActionClick };
	};

	const handleCreateShop = () => {
		//navigate(`../${demoPagesMenu.sales.subMenu.shopCreate.path}`, { state:  { user } })
	};

	// Toggle product selection
	const toggleProductSelection = (productId: number) => {
		setSelectedProducts((prev) =>
			prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
		);
	};

	// Select all/none
	const toggleSelectAll = () => {
		if (selectedProducts.length === products.length) {
			setSelectedProducts([]);
		} else {
			setSelectedProducts(products.map((p) => p.ID));
		}
	};

	// Handle bulk delete
	
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8888';

	const handleDeleteProducts = async (productIds: number[]) => {
		try {
			await axios.delete(API_BASE_URL + '/products/delete/batch', {
				data: { ids: productIds },
			});

			// Update local state
			setProducts((prev) => prev.filter((p) => !productIds.includes(p.ID)));
			setSelectedProducts([]);

			// Show success message
			toast.success(`${productIds.length} products deleted successfully`);
		} catch (error) {
			toast.error('Failed to delete products');
			//setProducts(prev => prev.filter(p => !productIds.includes(p.ID)));
		}
	};

	const { handleActionClick } = useDropdownActions();
	const [loading, setLoading] = useState<boolean>(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [users, setUsers] = useState<User[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [shops, setShops] = useState<Shop[]>([]);

	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		totalItems: 0,
		totalPages: 1,
	});

	const [error, setError] = useState<string | null>(null);
	const jwtToken = localStorage.getItem('j_auth_token'); // Assuming you store the token in localStorage

	// Function to handle after user is updated

	const insertUser = (newUser: User, index: number) => {
		setUsers((prev) => [...prev.slice(0, index), newUser, ...prev.slice(index)]);
	};

	//const [createModalStatus, setCreateModalStatus] = useState<boolean>(false);
	const handleListAllShops = () => {
		fetchShops(pagination.page, pagination.limit, searchTerm,0);
	}

	const fetchShops = async (page = 1, limit = 10, search = '',owner_id=0): Promise<void> => {
		
		try {
			// const response = await axios.get<ApiResponse>('/api/products',{
			const response = await axios.get<ShopsResponse>(API_BASE_URL + '/shops', {
				params: {
					page,
					limit,
					search: search.length > 0 ? search : undefined,
					owner_id:owner_id==0?undefined: user?.ID, // if there is no owner_id, all shops are displayed for Admin or SuperAdmin
				},
				headers: {
					//Authorization: `Bearer ${jwtToken}`, // Include the JWT  header
					Authorization: `${jwtToken}`, // Include the JWT token in the Authorization header
				},
			});
			
			setShops(response.data.shops);
			setPagination({
				page: response.data.page,
				limit: response.data.limit,
				totalItems: response.data.totalItems,
				totalPages: response.data.totalPages,
			});
			// console.log("The shops data...",response.data);
			setLoading(false);
		} catch (e: any) {
			setError(e.message);
			setLoading(false);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (jwtToken) {
			fetchShops();
		} else {
			setError('Authentication token not found.');
			setLoading(false);
		}
	}, [jwtToken, loading]); // Re-run the effect if the JWT token changes

	// Debounced search - resets to page 1 when searching
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm.length > 2 || searchTerm.length === 0) {
				fetchShops(1, pagination.limit, searchTerm);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Handle page change - maintains search term
	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			fetchShops(newPage, pagination.limit, searchTerm);
		}
	};

	

	// Handle limit change - maintains search term
	const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newLimit = parseInt(e.target.value);
		fetchShops(1, newLimit, searchTerm); // Reset to page 1 when changing limit
	};

	// Update pagination buttons to include search term
	const renderPaginationButtons = () => {
		const buttons = [];
		const maxVisibleButtons = 5;
		let startPage = 1;
		let endPage = pagination.totalPages;

		if (pagination.totalPages > maxVisibleButtons) {
			const half = Math.floor(maxVisibleButtons / 2);
			startPage = Math.max(1, pagination.page - half);
			endPage = Math.min(pagination.totalPages, startPage + maxVisibleButtons - 1);

			if (endPage - startPage + 1 < maxVisibleButtons) {
				startPage = Math.max(1, endPage - maxVisibleButtons + 1);
			}
		}

		// Previous button
		buttons.push(
			<li key='prev' className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
				<button
					className='page-link'
					onClick={() => handlePageChange(pagination.page - 1)}
					aria-label='Previous'>
					&laquo; Previous
				</button>
			</li>,
		);

		// First page button (if needed)
		if (startPage > 1) {
			buttons.push(
				<li key={1} className='page-item'>
					<button className='page-link' onClick={() => handlePageChange(1)}>
						1
					</button>
				</li>,
			);
			if (startPage > 2) {
				buttons.push(
					<li key='ellipsis-start' className='page-item disabled'>
						<span className='page-link'>...</span>
					</li>,
				);
			}
		}

		// Page number buttons
		for (let i = startPage; i <= endPage; i++) {
			buttons.push(
				<li key={i} className={`page-item ${pagination.page === i ? 'active' : ''}`}>
					<button className='page-link' onClick={() => handlePageChange(i)}>
						{i}
					</button>
				</li>,
			);
		}

		// Last page button (if needed)
		if (endPage < pagination.totalPages) {
			if (endPage < pagination.totalPages - 1) {
				buttons.push(
					<li key='ellipsis-end' className='page-item disabled'>
						<span className='page-link'>...</span>
					</li>,
				);
			}
			buttons.push(
				<li key={pagination.totalPages} className='page-item'>
					<button className='page-link' onClick={() => handlePageChange(pagination.totalPages)}>
						{pagination.totalPages}
					</button>
				</li>,
			);
		}
		// Next button
		buttons.push(
			<li
				key='next'
				className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
				<button
					className='page-link'
					onClick={() => handlePageChange(pagination.page + 1)}
					aria-label='Next'>
					Next &raquo;
				</button>
			</li>,
		);

		return buttons;
	};

	const renderActionDropdown = (shop: Shop) => {
		return (
			<td>
				<Dropdown direction='down'>
					<DropdownToggle>
						<Button
							color='primary'
							icon='ThreeDotsVertical'
							aria-label='Actions'
							className='btn-sm'>
							...
						</Button>
					</DropdownToggle>
					<DropdownMenu
						className='dropdown-menu-end'
						style={{ right: 'auto', left: 0, marginLeft: '-100px' }}>
						<DropdownItem>
							<div
								className='dropdown-item d-flex align-items-center'
								onClick={(e) => handleActionClick(e, () => handleViewDetailsLug(shop))}>
								<Icon icon='Eye' className='me-2' />
								View Details
							</div>
						</DropdownItem>
						<DropdownItem>
							<div
								className='dropdown-item d-flex align-items-center'
								onClick={(e) => handleActionClick(e, () => handleViewShopProducts(shop))}>
								<Icon icon='Eye' className='me-2' />
								View Products
							</div>
						</DropdownItem>
						<DropdownItem>
							<Button
								icon='Pencil'
								// onClick={() => handleEditUser(product)}
								className='dropdown-item'>
								Edit
							</Button>
						</DropdownItem>
						<DropdownItem>
							<Button
								icon='Trash'
								onClick={() => handleDelete(shop.ID)}
								className='dropdown-item text-danger'>
								Delete
							</Button>
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</td>
		);
	};

	// Handle view details
	const handleViewDetailsLug = (shop: Shop) => {
		console.log('The shop is: ', shop);
        //const url =   `/shop/editshop/${shop.ID}`;
		if (shop.Slug) {
            const url =   `/shop/editshop/${shop.Slug}`;
            router.push(url)	
		} else {
			const url =   `/shop/editshop/${shop.ID}`;
            router.push(url)
		}
	};

	const handleViewShopProducts = (shop: Shop) => {
		console.log('The shop is: ', shop);
		if (shop.Slug) {
			//navigate(`../${demoPagesMenu.sales.subMenu.shopProducts.path}/${shop.Slug}`, { state: { shop } })
		} else {
			//navigate(`../${demoPagesMenu.sales.subMenu.shopProducts.path}/${shop.ID}`, { state: { shop } })
		}
	};

	// Handle delete user
	const handleDelete = async (userId: number) => {
		if (window.confirm('Are you sure you want to delete this user?')) {
			try {
				const token = localStorage.getItem('authToken');
				await axios.delete(`/api/users/${userId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				// Refresh user list after deletion
				fetchShops(pagination.page, pagination.limit, searchTerm);
				
			} catch (err) {
				console.error('Error deleting user:', err);
				alert('Failed to delete user');
			}
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
		return <div>Error loading shops: {error}</div>;
	}

	return (
		<PageWrapper>
			
			<Button color='info' isLink onClick={() => handleCreateShop()}>
				Créer une boutique
			</Button>

			<div>
				<h3> Liste des boutiques</h3>
				{( hasAnyRole(['SuperAdmin', 'Admin'])) && (
							<div className='col-md-6 col-12 col-sm-12 col-lg-6 col-xs-12 ms-2 mt-2 mb-2'>
								
								{hasAnyRole(['Admin']) && <span className='text-muted fst-italic me-2'>Admin</span>}
								{hasAnyRole(['SuperAdmin']) && (
									<span className='text-muted fst-italic me-2'>Super Admin</span>
								)}

								<div
								className='text-muted fst-italic me-2 link-button'
								onClick={handleListAllShops}
								>List all shops</div>

							</div>
						)}
			</div>



			{shops?.length > 5 ? (
				<div className='row'>
					<div className='col-sm-4 col-md-4 col-lg-4 mt-4 ms-sm-0 ms-md-4'>
						<select
							className='form-select form-select-sm'
							style={{ width: '120px' }}
							value={pagination.limit}
							onChange={handleLimitChange}>
							<option value='2'>2 per page</option>
							<option value='3'>3 per page</option>
							<option value='5'>5 per page</option>
							<option value='10'>10 per page</option>
							<option value='20'>20 per page</option>
							<option value='50'>50 per page</option>
						</select>
					</div>
					<div className='col-sm-4 col-md-4 col-lg-4 mt-4'>
						<nav>
							<ul className='pagination pagination-sm mb-0'>{renderPaginationButtons()}</ul>
						</nav>
					</div>

					<div className='col-sm-4 col-md-4 col-lg-4 mt-4'>
						<span className='text-muted'>
							Showing {(pagination.page - 1) * pagination.limit + 1}-
							{Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{' '}
							{pagination.totalItems - selectedProducts.length} products
						</span>
					</div>
				</div>
			) : (
				<div></div>
			)}

			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>
							<div className='col-md-4'>
								<div className='input-group'>
									<input
										type='text'
										className='form-control'
										placeholder='Search shops...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
									<button
										className='btn btn-outline-light'
										type='button'
										onClick={() => fetchShops(1, pagination.limit, searchTerm)}>
										<i className='bi bi-search'>S</i>
									</button>
								</div>
							</div>

							{/* Product list Table */}

							<div className='d-flex justify-content-between align-items-center mb-3'>
								<div>
									{selectedProducts.length > 0 && (
										<button
											onClick={() => handleDeleteProducts(selectedProducts)}
											className='btn btn-danger me-2'>
											Delete {selectedProducts.length} selected
										</button>
									)}
								</div>
								<div>
									<span className='text-muted'>
										{selectedProducts.length} of {products.length} selected
									</span>
								</div>
							</div>

							<div className='table-responsive ms-4 me-4'>
								{shops?.length > 0 ? (
									<table className='table table-striped table-hover'>
										<thead>
											<tr>
												<th>
													<input
														type='checkbox'
														checked={selectedProducts.length === shops.length && shops.length > 0}
														onChange={toggleSelectAll}
														className='form-check-input'
													/>
												</th>

												<th scope='col'>Nom</th>
												<th scope='col' className='d-none d-sm-table-cell'>
													Slogan
												</th>
												<th scope='col' className='d-none d-sm-table-cell'>
													Description
												</th>

												<th scope='col'>Products</th>
												<th scope='col'>Action</th>
											</tr>
										</thead>
										<tbody>
											{shops.map((p) => (
												<tr
													key={p.ID}
													className={selectedProducts.includes(p.ID) ? 'table-active' : ''}>
													<td>
														<input
															type='checkbox'
															checked={selectedProducts.includes(p.ID)}
															onChange={() => toggleProductSelection(p.ID)}
															className='form-check-input'
														/>
													</td>

													<td>
														<div
															className='dropdown-item d-flex align-items-center'
															onClick={(e) => handleActionClick(e, () => handleViewDetailsLug(p))}>
															<Icon icon='Eye' className='me-2' />
															{p.name}
														</div>
													</td>
													<td className='d-none d-sm-table-cell'>{p.moto}</td>

													<td className='d-none d-sm-table-cell'>{p.description}</td>
													<td>{p.products?.length}</td>
													{renderActionDropdown(p)}
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<div>No users found in list.</div>
								)}
							</div>

							{/* Pagination Footer */}
							<div className='d-flex justify-content-center mt-3'>
								<nav>
									<ul className='pagination pagination-sm mb-0'>{renderPaginationButtons()}</ul>
								</nav>
							</div>

							{/* Pagination Footer 

                        */}
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};

export default ShopsList;
