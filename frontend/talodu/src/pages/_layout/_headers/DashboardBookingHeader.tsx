import React from 'react';
import useDarkMode from '../../../hooks/useDarkMode';
//import { useAuth, AuthProvider } from '../../presentation/auth/AuthContextNext';

import ProductsListHeader from './ProductsListHeader2';

const DashboardBookingHeader = () => {
    const { darkModeStatus } = useDarkMode();
    //const { user, hasRole } = useAuth();

     
    return (
       
            <ProductsListHeader />
            
    );
};

export default DashboardBookingHeader;