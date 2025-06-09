// presentation/auth/AuthContext.tsx

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import axios from 'axios';
// import { useNavigate } from "react-router-dom"; // <-- REMOVE THIS IMPORT
//import { API_BASE_URL } from '../auth/api' // Make sure API_BASE_URL is properly defined (using process.env.API_BASE_URL)
import { Shop } from './types'


type Role = {
    ID: number;
    Name: string;
    Description?: string;
}

type User = {
    id: number;
    ID: number;
    username: string;
    FirstName?: string;
    LastName?: string;
    Email: string;
    Roles: Role[];
}

type ShopUser = {
    ID: number;
    username: string;
    FirstName?: string;
    LastName?: string;
    Email: string;
    Roles: Role[];
}

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string, url:string) => Promise<User>;
    logout: () => void;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    loaddata: () => void; // Consider if this is still needed or if initial loading is enough
    isShopOwner: (shop: Shop) => boolean;
    isShopEmployee: (shop: Shop) => boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    // On client side, initialize token from localStorage. On server, it will be null.
    const [token, setToken] = useState<string | null>(
        typeof window !== 'undefined' ? localStorage.getItem('j_auth_token') : null
    );
    const [loading, setLoading] = useState<boolean>(true);

    // REMOVE THIS LINE: const navigate = useNavigate();
    // REMOVE THIS LINE: const handleOnAuth = useCallback(() => navigate('/'), [navigate]);

    // Use a flag to ensure initial load only happens once, especially on client
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            if (typeof window === 'undefined') { // Only run on client side
                setLoading(false); // If no window, we're on the server, no auth data to load here.
                return;
            }

            const storedToken = localStorage.getItem('j_auth_token');
            const storedUser = localStorage.getItem('j_user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    // Set default header immediately when token is found
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    // Optional: Validate token with backend if you want to ensure it's still valid on load
                    // await axios.get(`${API_BASE_URL}/validate-token`); 
                } catch (error) {
                    console.error("Failed to parse stored user or validate token:", error);
                    // Clear invalid stored data
                    logout();
                }
            } else {
                // If no stored token/user, clear any axios auth header
                delete axios.defaults.headers.common['Authorization'];
            }
            setLoading(false);
            setIsInitialized(true); // Mark as initialized
        };

        if (!isInitialized) { // Only run initialization once
            initializeAuth();
        }
    }, [isInitialized]); // Dependency on isInitialized

    // Ensure axios default header is set if token state changes (e.g., after login)
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);


    const logout = (): void => {
        localStorage.removeItem('j_auth_token')
        localStorage.removeItem('j_user')
        localStorage.removeItem('j_refresh_token') // Also remove refresh token
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        // Do NOT use window.location.reload() here in context.
        // Let the component that calls logout handle the redirect or reload via useRouter.
        // For example, in ProductsListHeader, after calling logout, you'd call router.push('/').
    };

    const loaddata = useCallback((): void => { // Make it useCallback if you pass it down
        console.log("Loading data in load data...");
        if (typeof window === 'undefined') return; // Ensure client-side only

        const storedToken = localStorage.getItem('j_auth_token');
        const storedUser = localStorage.getItem('j_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data from localStorage", e);
                logout(); // Clear potentially corrupted data
            }
        }
    }, []); // No dependencies for now, but consider what might trigger this.


    const login = async (email: string, password: string, url:string): Promise<User> => {
        //const url = process.env.API_BASE_URL + '/login'; // Access environment variable
        console.log("The API base URL is: ", url);
        try {
            const response = await axios.post<{
                access_token: string;
                refresh_token: string;
                user: User,
                token: string // Assuming 'token' field is also returned, though access_token is typically what's used
            }>(url, { email, password });

            const { access_token, refresh_token, user } = response.data;
            setToken(access_token);
            setUser(response.data.user);
            localStorage.setItem('j_auth_token', access_token);
            localStorage.setItem('j_refresh_token', refresh_token);
            localStorage.setItem('j_user', JSON.stringify(user));
            // setLoading(false); // No need to set loading here, it's for initial app load
            // axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`; // Handled by separate useEffect

            return user;
        } catch (error) {
            console.log("Login failed", error);
            // Consider more specific error handling/throwing for UI feedback
            throw error;
        }
    };


    const refreshAccessToken = async () => {
        console.log("... in Refresh token.., ");
        if (typeof window === 'undefined') { // Should only run on client
            throw new Error('Refresh token can only be called on the client side.');
        }
        try {
            const refreshToken = localStorage.getItem('j_refresh_token');
            if (!refreshToken) {
                // If refresh token is missing, consider it a logout scenario
                logout();
                throw new Error('No refresh token available. Logging out.');
            }

            const response = await axios.post(process.env.API_BASE_URL + '/refresh', { refresh_token: refreshToken }); // Use env var
            const { access_token, refresh_token } = response.data;

            localStorage.setItem('j_auth_token', access_token);
            localStorage.setItem('j_refresh_token', refresh_token);
            // axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`; // Handled by separate useEffect

            return access_token;
        } catch (error) {
            console.error("Error refreshing token:", error);
            logout(); // Force logout on refresh failure
            throw error;
        }
    };

    // Add axios response interceptor
    // This needs to be carefully placed to avoid issues with SSR.
    // Ensure it's not trying to modify globals on the server.
    useEffect(() => {
        // Only set up interceptor on client side
        if (typeof window === 'undefined') {
            return;
        }

        const interceptor = axios.interceptors.response.use(
            response => response,
            async (error) => {
                const originalRequest = error.config;
                console.log("... in interceptor, ");

                // Check for 401 and ensure it's not a retry to prevent infinite loops
                if (error.response?.status === 401 && !originalRequest._retry) {
                    console.log("Got 401 in interceptor, trying to refresh token");
                    originalRequest._retry = true;
                    try {
                        const newAccessToken = await refreshAccessToken();
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`; // Use Bearer prefix here
                        return axios(originalRequest);
                    } catch (err) {
                        return Promise.reject(err); // Propagate logout error
                    }
                }

                return Promise.reject(error);
            }
        );

        // Clean up the interceptor when component unmounts
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []); // Run once on client mount


    const hasRole = useCallback((role: string): boolean => {
        if (!user) return false;
        return user.Roles?.some(r => r.Name === role);
    }, [user]);

    const hasAnyRole = useCallback((roles: string[]): boolean => {
        if (!user) return false;
        return user.Roles?.some(r => roles.includes(r.Name));
    }, [user]);

    const isShopOwner = useCallback((shop: Shop): boolean => {
        if (!user) return false;
        return user.ID == shop.owner.ID;
    }, [user]);

    const isShopEmployee = useCallback((shop: Shop): boolean => {
        if (!user) return false;
        return shop?.Employees.some(employee => employee.id === user.id);
    }, [user]);

    const value: AuthContextType = {
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        loaddata,
        isShopOwner,
        isShopEmployee
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Render children only when auth initialization is complete */}
            {!loading ? children : <div>Authenticating...</div>}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};