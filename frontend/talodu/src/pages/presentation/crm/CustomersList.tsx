import React, { useState, useEffect, useMemo} from 'react';
import { useFormik } from 'formik';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
	SubheaderSeparator,
} from '../../../layout/SubHeader/SubHeader';
import Page from '../../../layout/Page/Page';
import { demoPagesMenu } from '../../../menu';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import { getFirstLetter, priceFormat } from '../../../helpers/helpers';
import data from '../../../common/data/dummyCustomerData';
import PaginationButtons, {
	dataPagination,
	PER_COUNT,
} from '../../../components/PaginationButtons';
import Button from '../../../components/bootstrap/Button';
import Icon from '../../../components/icon/Icon';
import Input from '../../../components/bootstrap/forms/Input';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import PAYMENTS from '../../../common/data/enumPaymentMethod';
import useSortableData from '../../../hooks/useSortableData';
import InputGroup, { InputGroupText } from '../../../components/bootstrap/forms/InputGroup';
import Popovers from '../../../components/bootstrap/Popovers';
import CustomerEditModal from './CustomerEditModal';
import UserEditModal from './UserEditModal';
import { getColorNameWithIndex } from '../../../common/data/enumColors';
import useDarkMode from '../../../hooks/useDarkMode';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { User, Role } from '../auth/types'



  interface ApiResponse {
	users: User[];
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
  

const CustomersList = () => {
	const { darkModeStatus } = useDarkMode();

	const navigate = useNavigate();
	// Available roles from your API or state
	const [availableRoles, setAvailableRoles] = useState<Role[]>([
		{ ID: 1, Name: 'SuperAdmin', CreatedAt: "", UpdatedAt:"", DeletedAt:"" },
		{ ID: 2, Name: 'Admin', CreatedAt: "", UpdatedAt:"", DeletedAt:""  },
		{ ID: 3, Name: 'Sales' , CreatedAt: "", UpdatedAt:"", DeletedAt:"" },
		{ ID: 4, Name: 'Visitor' , CreatedAt: "", UpdatedAt:"", DeletedAt:"" },
		{ ID: 5, Name: 'User' , CreatedAt: "", UpdatedAt:"", DeletedAt:"" },
	  ]);
  
  // ... (keep your existing states)

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [isNewUser, setisNewUser] = useState(false);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    id: 0,
	username: '',
    email: '',
    first_name: '',
    last_name: '',
    roles: []
  });

  const [editFormData2, setEditFormData2] = useState<EditFormData2>({
    id: 0,
	username: '',
    email: '',
    first_name: '',
    last_name: '',
    roles: []
  });

const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState<Record<number, boolean>>({});
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

  const { handleActionClick } = useDropdownActions();

	const [currentPage, setCurrentPage] = useState<number>(1);
	const [perPage, setPerPage] = useState<number>(PER_COUNT['10']);
	const [token, setToken] = useState<string | null>(localStorage.getItem('j_auth_token'));
	const [refresh_token, setRefreshToken] = useState<string | null>(localStorage.getItem('j_refresh_token'));
	const [loading, setLoading] = useState<boolean>(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [users, setUsers] = useState<User[]>([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		totalItems: 0,
		totalPages: 1
	  });
	
	const [error, setError] = useState<string | null>(null);
	const jwtToken = localStorage.getItem('j_auth_token'); // Assuming you store the token in localStorage
	
	// Function to handle after user is updated
	const handleUserUpdated = (updatedUser: User) => {
		console.log('Updated user received:', updatedUser);
  		console.log('Current users before update:', users);
		setUsers(prevUsers => 
		  prevUsers.map(user => 
			user.id === updatedUser.id ? updatedUser : user
		  )
		);
		setEditingUser(null);
	  };


	const formik = useFormik({
		initialValues: {
			searchInput: '',
			payment: Object.keys(PAYMENTS).map((i) => PAYMENTS[i].name),
			minPrice: '',
			maxPrice: '',
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onSubmit: (values) => {
			// alert(JSON.stringify(values, null, 2));
		},
	});

	const filteredData = data.filter(
		(f) =>
			// Name
			f.name.toLowerCase().includes(formik.values.searchInput.toLowerCase()) &&
			// Price
			(formik.values.minPrice === '' || f.balance > Number(formik.values.minPrice)) &&
			(formik.values.maxPrice === '' || f.balance < Number(formik.values.maxPrice)) &&
			// Payment Type
			formik.values.payment.includes(f.payout),
	);


	const { items, requestSort, getClassNamesFor } = useSortableData(filteredData);
	//const { items, requestSort, getClassNamesFor } = useSortableData(users);

	//console.log("The items is: ",items);

	const [editModalStatus, setEditModalStatus] = useState<boolean>(false);
  
	const fetchUsers = async (page = 1, limit = 10, search = ''):Promise<void> => {
		try {
		  const response = await axios.get<ApiResponse>('http://127.0.0.1:8888/users',{
			params: { 
				page,
				limit,
				search: search.length > 0 ? search : undefined 
			},
			headers: {
			  //Authorization: `Bearer ${jwtToken}`, // Include the JWT token in the Authorization header
			  Authorization: `${jwtToken}`, // Include the JWT token in the Authorization header
			},
		  });
		  //const { users } = response.data;
		  setUsers(response.data.users);
		  setPagination({
			  page: response.data.page,
			  limit: response.data.limit,
			  totalItems: response.data.totalItems,
			  totalPages: response.data.totalPages
			});
		  console.log("The data...",response.data);
		  setLoading(false);
		} catch (e: any) {
		  setError(e.message);
		  setLoading(false);
		}finally {
			setLoading(false);
		  }
	  };

	useEffect(() => {
		if (jwtToken) {
			fetchUsers();
		} else {
			setError('Authentication token not found.');
			setLoading(false);
		}
	}, [jwtToken, loading]); // Re-run the effect if the JWT token changes
		
	
	
		  // Client-side filtering for immediate responsiveness
		const filteredUsers = useMemo(() => {
			if (!searchTerm) return users;
			
			const term = searchTerm.toLowerCase();
			return users.filter(user => 
			user.username.toLowerCase().includes(term) ||
			user.email.toLowerCase().includes(term) ||
			user.first_name?.toLowerCase().includes(term) ||
			user.last_name?.toLowerCase().includes(term) ||
			user.roles.some(role => role.Name.toLowerCase().includes(term))
			);
		}, [users, searchTerm]);


	// Debounced search - resets to page 1 when searching
	useEffect(() => {
		const timer = setTimeout(() => {
		if (searchTerm.length > 2 || searchTerm.length === 0) {
			fetchUsers(1, pagination.limit, searchTerm);
		}
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Handle page change - maintains search term
	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
		fetchUsers(newPage, pagination.limit, searchTerm);
		}
	};

	// Handle limit change - maintains search term
	const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newLimit = parseInt(e.target.value);
		fetchUsers(1, newLimit, searchTerm); // Reset to page 1 when changing limit
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
				<li key="prev" className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
				  <button 
					className="page-link" 
					onClick={() => handlePageChange(pagination.page - 1)}
					aria-label="Previous"
				  >
					 &laquo; Previous
				  </button>
				</li>
			  );

			   // First page button (if needed)
				if (startPage > 1) {
					buttons.push(
					<li key={1} className="page-item">
						<button className="page-link" onClick={() => handlePageChange(1)}>
						1
						</button>
					</li>
					);
					if (startPage > 2) {
					buttons.push(
						<li key="ellipsis-start" className="page-item disabled">
						<span className="page-link">...</span>
						</li>
					);
					}
				}

				// Page number buttons
				for (let i = startPage; i <= endPage; i++) {
					buttons.push(
					  <li key={i} className={`page-item ${pagination.page === i ? 'active' : ''}`}>
						<button className="page-link" onClick={() => handlePageChange(i)}>
						  {i}
						</button>
					  </li>
					);
				  }

				   // Last page button (if needed)
					if (endPage < pagination.totalPages) {
						if (endPage < pagination.totalPages - 1) {
						buttons.push(
							<li key="ellipsis-end" className="page-item disabled">
							<span className="page-link">...</span>
							</li>
						);
						}
						buttons.push(
							<li key={pagination.totalPages} className="page-item">
							  <button 
								className="page-link" 
								onClick={() => handlePageChange(pagination.totalPages)}
							  >
								{pagination.totalPages}
							  </button>
							</li>
						  );
						}
						// Next button
						buttons.push(
							<li key="next" className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
							<button 
								className="page-link" 
								onClick={() => handlePageChange(pagination.page + 1)}
								aria-label="Next"
							>
								Next &raquo;
							</button>
							</li>
						);
					
						return buttons;
						};

  const renderActionDropdown = (user: User) => {
	const handleDivClick = (e: React.MouseEvent<HTMLDivElement>, handler: () => void) => {
		e.stopPropagation();
		handler();
	  };

	return (
	<td>
      <Dropdown
       // isOpen={openDropdownId === user.id}
       // setIsOpen={() => toggleDropdown(user.id)}
        direction="down"
		
      >
        <DropdownToggle>
          <Button
            color="primary"
            icon="ThreeDotsVertical"
            aria-label="Actions"
            className="btn-sm"
          >...</Button>
        </DropdownToggle>
		<DropdownMenu className="dropdown-menu-end" style={{ right: 'auto', left: 0, marginLeft: '-100px' }}>
          <DropdownItem>
		  <div 
              className="dropdown-item d-flex align-items-center"
			  onClick={(e) => handleActionClick(e, () => handleViewDetails(user.id))}
             // onClick={(e: React.MouseEvent<HTMLDivElement>) => handleDivClick(e, () => handleViewDetails(user.id))}
            >
              <Icon icon="Eye" className="me-2" />
              View Details
            </div>
          </DropdownItem>
          <DropdownItem>
            <Button
			 icon="Pencil"
			 onClick={() => handleEditUser(user)}
			 className="dropdown-item"
		   >
			 Edit
		   </Button>
		 </DropdownItem>
		 <DropdownItem>
		   <Button
			 icon="Trash"
			 onClick={() => handleDelete(user.id)}
			 className="dropdown-item text-danger"
		   >
			Delete
            </Button>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </td>
  );
}

   // Handle view details
   const handleViewDetails = (userId: number) => {
	console.log("The user is",userId);
    navigate(`/users/${userId}`);
  };

  // Handle delete user
  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
		 // Refresh user list after deletion
		 fetchUsers(pagination.page, pagination.limit, searchTerm);
		} catch (err) {
		  console.error('Error deleting user:', err);
		  alert('Failed to delete user');
		}
	  }
	};


	  // When editing a user
const handleEditUser = (user: User) => {
	setEditingUser(user);
    setEditFormData({
		id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: [...user.roles],
    });
	setEditFormData2({
		id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: [...user.roles.map(r=>r.ID)],
    });
	console.log("User set to", user)
	console.log("edited User set to", editFormData2)
    setEditingUserId(user.id.toString());
    setIsEditModalOpen(true);
	setEditModalStatus(true);
	setisNewUser(false);
};

   // Handle save edited user
   const handleSaveEdit = async () => {
	console.log("saving users..")
  };

	// When saving changes
	const handleSaveUser = (updatedData: EditFormData) => {
		if (editingUserId) {

			handleSaveEdit();
			//updateUser(17, editFormData)
		} else {
			handleSaveEdit();
		}
	};

    
					
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
		<PageWrapper title={demoPagesMenu.crm.subMenu.customersList.text}>
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
						onChange={formik.handleChange}
						value={formik.values.searchInput}
						
					/>
				</SubHeaderLeft>
				<SubHeaderRight>
					<Dropdown>
						<DropdownToggle hasIcon={false}>
							<Button
								icon='FilterAlt'
								color='dark'
								isLight
								className='btn-only-icon position-relative'
								aria-label='Filter'>
								{data.length !== filteredData.length && (
									<Popovers desc='Filtering applied' trigger='hover'>
										<span className='position-absolute top-0 start-100 translate-middle badge border border-light rounded-circle bg-danger p-2'>
											<span className='visually-hidden'>
												there is filtering
											</span>
										</span>
									</Popovers>
								)}
							</Button>
						</DropdownToggle>
						<DropdownMenu isAlignmentEnd size='lg'>
							<div className='container py-2'>
								<div className='row g-3'>
									<FormGroup label='Balance' className='col-12'>
										<InputGroup>
											<Input
												id='minPrice'
												ariaLabel='Minimum price'
												placeholder='Min.'
												onChange={formik.handleChange}
												value={formik.values.minPrice}
											/>
											<InputGroupText>to</InputGroupText>
											<Input
												id='maxPrice'
												ariaLabel='Maximum price'
												placeholder='Max.'
												onChange={formik.handleChange}
												value={formik.values.maxPrice}
											/>
										</InputGroup>
									</FormGroup>
									<FormGroup label='Payments' className='col-12'>
										<ChecksGroup>
											{Object.keys(PAYMENTS).map((payment) => (
												<Checks
													key={PAYMENTS[payment].name}
													id={PAYMENTS[payment].name}
													label={PAYMENTS[payment].name}
													name='payment'
													value={PAYMENTS[payment].name}
													onChange={formik.handleChange}
													checked={formik.values.payment.includes(
														PAYMENTS[payment].name,
													)}
												/>
											))}
										</ChecksGroup>
									</FormGroup>
								</div>
							</div>
						</DropdownMenu>
					</Dropdown>
					<SubheaderSeparator />
					<Button
						icon='PersonAdd'
						color='primary'
						isLight
						onClick={() => {setEditModalStatus(true); setisNewUser(true)}}>
						Add New user
					</Button>
				</SubHeaderRight>
			</SubHeader>
			<Page>
				<div className='row h-100'>
					<div className='col-12'>
						<Card stretch>

	<div>
      <h1>User List</h1>  
    </div>
	<div className="col-md-4">
<div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="btn btn-outline-light" 
                type="button"
                onClick={() => fetchUsers(1, pagination.limit, searchTerm)}
              >
                <i className="bi bi-search">S</i>
              </button>
            </div>
			</div>

	 {/* User Table */}
	 <div className="d-flex pe-4 ps-4
	 justify-content-between align-items-center mb-4 ms-2 me-8">
	 	<div className="d-flex align-items-center gap-2">
	 		<select 
                className="form-select form-select-sm"
                style={{ width: '120px' }}
                value={pagination.limit} 
                onChange={handleLimitChange}
              >
                <option value="2">2 per page</option>
				<option value="3">3 per page</option>
				<option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
              
              <span className="text-muted">
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} users
              </span>
			</div>


			<nav>
              <ul className="pagination pagination-sm mb-0">
                {renderPaginationButtons()}
              </ul>
            </nav>
			</div>
	 
	 <div className="table-responsive ms-4 me-4">
	 {users?.length > 0 ? (
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Username</th>
                  <th scope="col">Email</th>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Roles</th>
				  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.first_name}</td>
                    <td>{u.last_name}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {u.roles && u.roles.map(role => (
                          <span key={role.ID} className="badge bg-secondary">
                            {role.Name}
                          </span>
                        ))}
                      </div>
                    </td>
					{renderActionDropdown(u)}
                  </tr>
                ))}
              </tbody>
            </table>
		) : (
        <div>No users found in list.</div>
      	)}
          </div>

		  <UserEditModal 
			setIsOpen={setEditModalStatus}
			isOpen={editModalStatus}
			//id='0'
			id={editingUserId || 'new-user'}
			//id={editingUserId || isNewUser==true}
			
			formData={editFormData}
			formData2={editFormData2}

			availableRoles={availableRoles}
			onFormChange={setEditFormData}
			onFormChange2={setEditFormData2}
			onSave={handleSaveUser}

			isNewUser={isNewUser}
			onUserUpdated={handleUserUpdated}
			/>

		   {/* Pagination Footer */}
		   <div className="d-flex justify-content-center mt-3">
		   <nav>
              <ul className="pagination pagination-sm mb-0">
                {renderPaginationButtons()}
              </ul>
            </nav>
           
          </div>



							<CardBody isScrollable className='table-responsive'>
								<table className='table table-modern table-hover'>
									<thead>
										<tr>
											<th
												onClick={() => requestSort('name')}
												className='cursor-pointer text-decoration-underline'>
												Customer{' '}
												<Icon
													size='lg'
													className={getClassNamesFor('name')}
													icon='FilterList'
												/>
											</th>
											<th>Email</th>
											<th>Membership Date</th>
											<th
												onClick={() => requestSort('balance')}
												className='cursor-pointer text-decoration-underline'>
												Balance
												<Icon
													size='lg'
													className={getClassNamesFor('balance')}
													icon='FilterList'
												/>
											</th>
											<th
												onClick={() => requestSort('payout')}
												className='cursor-pointer text-decoration-underline'>
												Payout{' '}
												<Icon
													size='lg'
													className={getClassNamesFor('payout')}
													icon='FilterList'
												/>
											</th>
											<td aria-labelledby='Actions' />
										</tr>
									</thead>
									<tbody>
										
										{dataPagination(items, currentPage, perPage).map((i) => (
											<tr key={i.id}>
												<td>
													<div className='d-flex align-items-center'>
														<div className='flex-shrink-0'>
															<div
																className='ratio ratio-1x1 me-3'
																style={{ width: 48 }}>
																<div
																	className={`bg-l${
																		darkModeStatus
																			? 'o25'
																			: '25'
																	}-${getColorNameWithIndex(
																		i.id,
																	)} text-${getColorNameWithIndex(
																		i.id,
																	)} rounded-2 d-flex align-items-center justify-content-center`}>
																	<span className='fw-bold'>
																		{getFirstLetter(i.name)}
																	</span>
																</div>
															</div>
														</div>
														<div className='flex-grow-1'>
															<div className='fs-6 fw-bold'>
																{i.name}
															</div>
															<div className='text-muted'>
																<Icon icon='Label' />{' '}
																<small>{i.type}</small>
															</div>
														</div>
													</div>
												</td>
												<td>
													<Button
														isLink
														color='light'
														icon='Email'
														className='text-lowercase'
														tag='a'
														href={`mailto:${i.email}`}>
														{i.email}
													</Button>
												</td>
												<td>
													<div>{i.membershipDate.format('ll')}</div>
													<div>
														<small className='text-muted'>
															{i.membershipDate.fromNow()}
														</small>
													</div>
												</td>
												<td>{priceFormat(i.balance)}</td>
												<td>
													<Icon
														size='lg'
														icon={`custom ${i.payout.toLowerCase()}`}
													/>{' '}
													{i.payout}
												</td>
												<td>
													<Dropdown>
														<DropdownToggle hasIcon={false}>
															<Button
																icon='MoreHoriz'
																color='dark'
																isLight
																shadow='sm'
																aria-label='More actions'
															/>
														</DropdownToggle>
														<DropdownMenu isAlignmentEnd>
															<DropdownItem>
																<Button
																	icon='Visibility'
																	tag='a'
																	to={`../${demoPagesMenu.crm.subMenu.customerID.path}/${i.id}`}>
																	View
																</Button>
															</DropdownItem>
														</DropdownMenu>
													</Dropdown>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</CardBody>
							<PaginationButtons
								data={filteredData}
								label='customers'
								setCurrentPage={setCurrentPage}
								currentPage={currentPage}
								perPage={perPage}
								setPerPage={setPerPage}
							/>
						</Card>
					</div>
				</div>
			</Page>
			
		</PageWrapper>
	);
};

export default CustomersList;
