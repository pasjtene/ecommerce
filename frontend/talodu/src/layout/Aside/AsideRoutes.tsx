import React from 'react';
import { Route, Routes } from 'react-router-dom';
import asides from '../../routes/asideRoutes';
import ProtectedRoute from '../../pages/presentation/auth/ProtectedRoute';
import AdminPanel from '../../pages/protected/AdminPannel';
import { AuthProvider } from '../../pages/presentation/auth/AuthContext';

const AsideRoutes = () => {
	return (
		
		<Routes>
			 <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Sdmin', 'SuperAdmin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />;
		  <Route path="/admin2" element={
           
              <AdminPanel />
            
          } />


			{asides.map((page) => (
				
					<Route key={page.path} {...page} />
				
				
			))}
		</Routes>
		
	);
};

export default AsideRoutes;
