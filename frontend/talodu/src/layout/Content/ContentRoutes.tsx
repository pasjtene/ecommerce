import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import contents from '../../routes/contentRoutes';
import { AuthProvider } from '../../pages/presentation/auth/AuthContext';

const PAGE_404 = lazy(() => import('../../pages/presentation/auth/Page404'));
const ContentRoutes = () => {
	return (
		<AuthProvider>
			<Routes>
			{contents.map((page) => (
				<Route key={page.path} {...page} />
			))}
			<Route path='*' element={<PAGE_404 />} />
		</Routes>
		</AuthProvider>
		
	);
};

export default ContentRoutes;
