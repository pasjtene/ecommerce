// presentation/auth/AuthContext.tsx

import React, { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import axios from 'axios';
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
    login: (email: string, password: string, url: string) => Promise<User>; // url is passed here
    logout: () => void;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    loaddata: () => void;
    isShopOwner: (shop: Shop) => boolean;
    isShopEmployee: (shop: Shop) => boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null); // Initialize as null
    const [loading, setLoading] = useState<boolean>(true);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            if (typeof window === 'undefined') { // Only run on client side
                setLoading(false);
                return;
            }

            const storedToken = localStorage.getItem('j_auth_token');
            const storedUserString = localStorage.getItem('j_user'); // Renamed to clearly indicate it's a string

            if (storedToken && storedUserString) { // Ensure both are non-null/non-undefined strings
                setToken(storedToken);
                try {
                    const parsedUser: User = JSON.parse(storedUserString); // Parse the string
                    setUser(parsedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                } catch (error) {
                    console.error("Failed to parse stored user or validate token, or data corrupted:", error);
                    // If parsing fails, it means the data is invalid. Clear it.
                    logout();
                }
            } else {
                // If no stored token or user data, ensure no auth header is set
                delete axios.defaults.headers.common['Authorization'];
            }
            setLoading(false);
            setIsInitialized(true);
        };

        if (!isInitialized) {
            initializeAuth();
        }
    }, [isInitialized]);

    // This useEffect ensures the axios default header is always in sync with the token state
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);


    const logout = useCallback((): void => { // Wrapped in useCallback
        if (typeof window === 'undefined') return; // Client-side only

        localStorage.removeItem('j_auth_token')
        localStorage.removeItem('j_user')
        localStorage.removeItem('j_refresh_token')
        setToken(null);
        setUser(null);
        // Navigation (e.g., router.push('/')) should happen in the component that calls logout.
    }, []); // No dependencies as it clears local storage and sets state to null


    const loaddata = useCallback((): void => {
        console.log("Loading data in load data...");
        if (typeof window === 'undefined') return;

        const storedToken = localStorage.getItem('j_auth_token');
        const storedUserString = localStorage.getItem('j_user');
        if (storedToken && storedUserString) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUserString));
            } catch (e) {
                console.error("Failed to parse user data from localStorage in loaddata", e);
                logout();
            }
        }
    }, [logout]); // Dependency on logout to ensure it's the latest version


    const login = useCallback(async (email: string, password: string, loginUrl: string): Promise<User> => { // Renamed url to loginUrl to avoid conflict
        try {
            const response = await axios.post<{
                access_token: string;
                refresh_token: string;
                user: User,
                token?: string // Make token optional if it's not always returned or is redundant
            }>(loginUrl+"/login", { email, password }); // Use loginUrl passed as argument

            const { access_token, refresh_token, user } = response.data;
            setToken(access_token);
            setUser(response.data.user);
            // Ensure localStorage operations are client-side only
            if (typeof window !== 'undefined') {
                localStorage.setItem('j_auth_token', access_token);
                localStorage.setItem('j_refresh_token', refresh_token);
                localStorage.setItem('j_user', JSON.stringify(user));
            }
            return user;
        } catch (error) {
            console.log("Login failed", error);
            throw error;
        }
    }, []); // No dependencies for login itself


    const refreshAccessToken = useCallback(async () => {
        console.log("... in Refresh token.., ");
        if (typeof window === 'undefined') {
            throw new Error('Refresh token can only be called on the client side.');
        }
        try {
            const refreshToken = localStorage.getItem('j_refresh_token');
            if (!refreshToken) {
                logout(); // Force logout if no refresh token
                throw new Error('No refresh token available. Logging out.');
            }

            // Use NEXT_PUBLIC_API_BASE_URL for client-side API calls
            const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
            if (!API_URL) {
                throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
            }

            const response = await axios.post(API_URL + '/refresh', { refresh_token: refreshToken });
            const { access_token, refresh_token } = response.data;

            if (typeof window !== 'undefined') {
                localStorage.setItem('j_auth_token', access_token);
                localStorage.setItem('j_refresh_token', refresh_token);
            }
            return access_token;
        } catch (error) {
            console.error("Error refreshing token:", error);
            logout();
            throw error;
        }
    }, [logout]); // Dependency on logout


    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const interceptor = axios.interceptors.response.use(
            response => response,
            async (error) => {
                const originalRequest = error.config;
                console.log("... in interceptor, ");

                if (error.response?.status === 401 && !originalRequest._retry) {
                    console.log("Got 401 in interceptor, trying to refresh token");
                    originalRequest._retry = true;
                    try {
                        const newAccessToken = await refreshAccessToken();
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    } catch (err) {
                        return Promise.reject(err);
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [refreshAccessToken]); // Dependency on refreshAccessToken


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