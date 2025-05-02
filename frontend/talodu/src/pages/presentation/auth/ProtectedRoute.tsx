import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: string[];
};

type Role = {
    id: number;
    name: string;
    description?: string;
}
type User = {
    id: number;
    username: string;
    email: string;
    roles: Role[];
}

const u: User = {
    id: 8,
    username: "Pasjtene",
    email: "pasjtene@yahoo.com",
    roles: [{
        id: 1,
        name: "admin",
        description: "an admin"
    }, {
        id: 2,
        name: "SuperAdmin",
        description: "a super admin"
    }]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { user, hasAnyRole } = useAuth();
    const location = useLocation();

    if(!user) {
        return <Navigate to="/login" state={{ from: location }} replace/>;
    } 

    /*
    const hasAnyRole = (roles: string[]): boolean => {
        if (!user) return false;
        return user.roles.some(r => roles.includes(r.name));
    }
    */

    if (allowedRoles && !hasAnyRole(allowedRoles)) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return <>{children}</>
}

export default ProtectedRoute;