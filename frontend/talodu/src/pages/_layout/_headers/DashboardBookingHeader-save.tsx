import React from 'react';
import classNames from 'classnames';
import Header, { HeaderLeft, HeaderRight } from '../../../layout/Header/Header';
import CommonHeaderChat from './CommonHeaderChat';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth, AuthProvider } from '../../presentation/auth/AuthContext';

import ProductsListHeader from './ProductsListHeader';

const DashboardBookingHeader = () => {
	const { darkModeStatus } = useDarkMode();
	const { user, hasRole } = useAuth();

	 
	return (
		<AuthProvider>
			<Header>
			
			<div className='row g-4'>
			<div className='col-lg-4'>
			<HeaderLeft>
				<div className='d-flex align-items-center'>
					<div className='row g-4'>
						<div className='col-md-auto'>
							<div
								className={classNames('fs-3', 'fw-bold', {
									'text-dark': !darkModeStatus,
								})}>
								Hi  { user?.FirstName} {user?.LastName}
								
							</div>
						</div>
					</div>
				</div>
				
			</HeaderLeft>
			</div>
			<div className='col-lg-4'>
			<div>LogIn</div>
			</div>

			<div className='col-lg-4'>
			<HeaderRight>
				<CommonHeaderChat />
			</HeaderRight>
			</div>
			
			
			</div>
			
			
			</Header>
			</AuthProvider>
		
	);
};

export default DashboardBookingHeader;
