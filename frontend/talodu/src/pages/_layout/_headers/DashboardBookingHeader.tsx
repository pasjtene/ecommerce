import React from 'react';
import classNames from 'classnames';
import Header, { HeaderLeft, HeaderRight } from '../../../layout/Header/Header';
import CommonHeaderChat from './CommonHeaderChat';
import useDarkMode from '../../../hooks/useDarkMode';
import { useAuth, AuthProvider } from '../../presentation/auth/AuthContext';

import ProductsListHeader from './ProductsListHeader2';

const DashboardBookingHeader = () => {
    const { darkModeStatus } = useDarkMode();
    const { user, hasRole } = useAuth();

     
    return (
       
            <ProductsListHeader />
            
    );
};

export default DashboardBookingHeader;