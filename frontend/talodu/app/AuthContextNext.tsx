//app/AuthContextNext.tsx
"use client"
import React, {createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import axios from 'axios';
//import { useNavigate } from "react-router-dom";
import { useRouter } from "next/navigation";
//import { API_BASE_URL } from '../auth/api'
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
    //shopUser: ShopUser | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    loaddata: () => void;
    isShopOwner: (shop: Shop) => boolean;
    isShopEmployee: (shop: Shop) => boolean;
    onLogout?: () => void;
}

type AuthProviderProps = {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    //const [token, setToken] = useState<string | null>(localStorage.getItem('j_auth_token'));
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [mounted, setMounted] = useState(false); 
   // loaddata
    //const navigate = useNavigate();

    const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // This will only run in the browser
    const initializeAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('j_auth_token') : null;
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('j_user') : null;
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  if (!mounted) {
    return null; // Or a loading spinner
  }


    const logout = (): void => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('j_auth_token');
          localStorage.removeItem('j_user');
          localStorage.removeItem('j_refresh_token');

        }
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        //router.push('/'); //ask user to log in..
      };


    const loaddata = (): void => {
        console.log("Loading data in load data...")
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('j_auth_token');
            const storedUser = localStorage.getItem('j_user');
        
            if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            } 
        }      
    };

    const login = async (email: string, password: string): Promise<User> => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";
        console.log("The API base URL is: ",API_BASE_URL);
        try {
            //const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8888";
            const response = await axios.post<{
                access_token: string;
                refresh_token: string;
                user: User,
                token: string
            }>(API_BASE_URL+'/login',{ email, password }); 

            const { access_token, refresh_token, user } = response.data;
            
            if (typeof window !== 'undefined') {
            setToken(access_token);
            setUser(response.data.user);
            localStorage.setItem('j_auth_token', access_token);
            localStorage.setItem('j_refresh_token', refresh_token);
            localStorage.setItem('j_user', JSON.stringify(user));
            setLoading(false);
            axios.defaults.headers.common['Authorization'] = `${access_token}`;
            }

            return user;
        } catch (error) {
            console.log("Login failled", error);
            throw error;
          
        }
        
    };


    const refreshAccessToken = async () => {
        console.log("... in Refresh token.., ");
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8888";

            if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('j_refresh_token');
          if (!refreshToken) throw new Error('No refresh token');
          
          const response = await axios.post(API_BASE_URL+'/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = response.data;
          
          localStorage.setItem('j_auth_token', access_token);
          localStorage.setItem('j_refresh_token', refresh_token);
          axios.defaults.headers.common['Authorization'] = `${access_token}`;
    
    return access_token;
            }
  } catch (error) {
    logout();
    throw error;
  }
};

// Add axios response interceptor
axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      console.log("... in interceptor, ");
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log("Got 401 in interceptor, trying to refresh token");
        originalRequest._retry = true;
        try {
            const newAccessToken = await refreshAccessToken();
            //originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `${newAccessToken}`;
            return axios(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }
        
        return Promise.reject(error);
      }
    );
   

    const hasRole = (role: string): boolean => {
        if (!user) return false;
        return user.Roles?.some(r=>r.Name === role);
    }

    const hasAnyRole = (roles: string[]): boolean => {
        if (!user) return false;
        return user.Roles?.some(r => roles.includes(r.Name));
    }

  

    const isShopOwner = ( shop: Shop): boolean => {
        if (!user) return false;
        return user.ID == shop.owner.ID;
    }
    
    const isShopEmployee = (shop: Shop): boolean => {
        if (!user) return false;
        return shop?.Employees.some(employee => employee.id === user.id);
    }

    const value: AuthContextType = {
        user,
        //shopUser,
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
