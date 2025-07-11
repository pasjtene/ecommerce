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
import Dropdown, {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from '../../../components/bootstrap/Dropdown';
import useDarkMode from '../../../hooks/useDarkMode';
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom';
import { updateUser, API_BASE_URL } from '../auth/api'
import { User, Role, Product } from '../auth/types'
import { toast } from 'react-toastify';



  interface ProductsResponse {
    products: Product[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  }


const ProductsList = () => {
    const { darkModeStatus } = useDarkMode();
    const navigate = useNavigate();
  

    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

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

  // Toggle product selection
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all/none
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.ID));
    }
  };

    const handleDeleteProducts = async (productIds: number[]) => {
      try {
        await axios.delete(API_BASE_URL+'/products/delete/batch', {
          data: { ids: productIds }
        });
        
        // Update local state
        setProducts(prev => prev.filter(p => !productIds.includes(p.ID)));
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
    const [products, setProducts] = useState<Product[]>([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1
      });
    
    const [error, setError] = useState<string | null>(null);
    const jwtToken = localStorage.getItem('j_auth_token'); // Assuming you store the token in localStorage


    const fetchUsers = async (page = 1, limit = 10, search = ''):Promise<void> => {
        try {
            // const response = await axios.get<ApiResponse>('/api/products',{
            const response = await axios.get<ProductsResponse>(API_BASE_URL+'/products',{
            
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
          console.log("The response producsts: ",response.data);
          setProducts(response.data.products);
          setPagination({
              page: response.data.page,
              limit: response.data.limit,
              totalItems: response.data.totalItems,
              totalPages: response.data.totalPages
            });
          
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

    const renderActionDropdown = (product: Product) => {
    return (
        <td>
        <Dropdown
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
                onClick={(e) => handleActionClick(e, () => handleViewDetailsLug(product))}
                >
                <Icon icon="Eye" className="me-2" />
                View Details
            </div>
            </DropdownItem>
            <DropdownItem>
                <Button
                icon="Pencil"
               // onClick={() => handleEditUser(product)}
                className="dropdown-item"
            >
                Edit
            </Button>
            </DropdownItem>
            <DropdownItem>
            <Button
                icon="Trash"
                onClick={() => handleDelete(product.ID)}
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
   const handleViewDetails = (product: Product) => {
    console.log("The product is",product);
    navigate(`../${demoPagesMenu.sales.subMenu.productID.path}/${product.ID}`, { state: { product } })
    
  };

  // Handle view details
  const handleViewDetailsLug = (product: Product) => {
    navigate(`../${demoPagesMenu.sales.subMenu.productID.path}/${product.Slug}`, { state: { product } })
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
                        onChange={()=>{}}
                        value=""
                        
                    />
                </SubHeaderLeft>
                <SubHeaderRight>
                    
                    <SubheaderSeparator />
                    <Button
                        icon='PersonAdd'
                        color='primary'
                        isLight
                        onClick={()=>{console.log("no")}}>
                        Add New Product
                    </Button>
                </SubHeaderRight>
            </SubHeader>
            <Page>
                <div className='row h-100'>
                    <div className='col-12'>
                        <Card stretch>

                        <div>
                          <h3>Products List</h3>  
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

     {/* Product list Table */}
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
                {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems - selectedProducts.length} products
              </span>
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                {renderPaginationButtons()}
              </ul>
            </nav>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      {selectedProducts.length > 0 && (
                        <button 
                          onClick={() => handleDeleteProducts(selectedProducts)}
                          className="btn btn-danger me-2"
                        >
                          Delete {selectedProducts.length} selected
                        </button>
                      )}
                    </div>
                    <div>
                      <span className="text-muted">
                        {selectedProducts.length} of {products.length} selected
                      </span>
                    </div>
                  </div>
     
                    <div className="table-responsive ms-4 me-4">
                    {products?.length > 0 ? (
                            <table className="table table-striped table-hover">
                                
                              <thead>
                                <tr>
                                <th>
                                  <input
                                    type="checkbox"
                                    checked={selectedProducts.length === products.length && products.length > 0}
                                    onChange={toggleSelectAll}
                                    className="form-check-input"
                                  />
                                </th>
                                  <th scope="col">ID</th>
                                  <th scope="col">Name</th>
                                  <th scope="col">Images</th>
                                  <th scope="col">Price</th>
                                  <th scope="col">Stock</th>
                                  <th scope="col">Description</th>
                                  <th scope="col">Shop</th>
                                  <th scope="col">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {products.map(p => (
                                  <tr key={p.ID} className={selectedProducts.includes(p.ID) ? 'table-active' : ''}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(p.ID)}
                                        onChange={() => toggleProductSelection(p.ID)}
                                        className="form-check-input"
                                      />
                                    </td>
                                    <td>{p.ID}</td>
                                    <td>
                                    
                                      <div 
                                        className="dropdown-item d-flex align-items-center"
                                        onClick={(e) => handleActionClick(e, () => handleViewDetailsLug(p))}
                                        >
                                        <Icon icon="Eye" className="me-2" />
                                        {p.name}
                                      </div>
                                    </td>
                                    <td>{p.images.length}</td>
                                    <td>{p.price}</td>
                                    <td>{p.stock}</td>
                                    <td>{p.description}</td>
                                    <td>
                                      {p.shop.name} - {p.shop.ID}
                                    </td>
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
                    <div className="d-flex justify-content-center mt-3">
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                          {renderPaginationButtons()}
                        </ul>
                      </nav>
                    
                    </div>
                    </Card>
                              </div>
                          </div>
                      </Page>
                      
                  </PageWrapper>
              );
          };

export default ProductsList;
                        