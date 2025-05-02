import React from 'react';
import { Route, Routes } from 'react-router-dom';
import headers from '../../routes/headerRoutes';
import { AuthProvider } from '../../pages/presentation/auth/AuthContext';

const HeaderRoutes = () => {
	return (
		<AuthProvider>
			<Routes>
			{headers.map((page) => (
				<Route key={page.path} {...page} />
			))}
		</Routes>
		</AuthProvider>
		
	);
};

export default HeaderRoutes;
