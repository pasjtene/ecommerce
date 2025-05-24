import React, {createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../auth/api'
import { Shop } from './types'


type Role = {
    ID: number;
    Name: string;
    Description?: string;
}

type User = {
    id: number;
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
    login: (email: string, password: string) => Promise<User>;
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
    const [token, setToken] = useState<string | null>(localStorage.getItem('j_auth_token'));
    const [loading, setLoading] = useState<boolean>(true);
   // loaddata
    const navigate = useNavigate();

    const handleOnAuth = useCallback(() => navigate('/'), [navigate]);
    const u: User = {
        id: 8,
        username: "Pasjtene",
        FirstName: "Pascal123",
        LastName: "Tene",
        Email: "pasjtene@yahoo.com",
        Roles: [{
            ID: 1,
            Name: "Admin",
            Description: "an admin"
        }, {
            ID: 2,
            Name: "SuperAdmin",
            Description: "a super admin"
        }]
    }

   // setUser(u);
    //setToken("myToken");
    useEffect(()=>{
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('j_auth_token');
            const storedUser = localStorage.getItem('j_user');
            //setUser(u);
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
                try {
                   // const response = await axios.get<User>('http://127.0.0.1:8888/login');
                }catch(error) {
                   
                }
            }
            setLoading(false);
        };
        
     initializeAuth();
    },[token]);

    const logout = (): void => {
        localStorage.removeItem('j_auth_token')
        localStorage.removeItem('j_user')
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        window.location.reload();
    };

    const loaddata = (): void => {
        console.log("Loading data in load data...")
            const storedToken = localStorage.getItem('j_auth_token');
            const storedUser = localStorage.getItem('j_user');
            if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            }
        
    };

    const login = async (email: string, password: string): Promise<User> => {
        console.log("The API base URL is: ",API_BASE_URL);
        try {
            const response = await axios.post<{
                access_token: string;
                refresh_token: string;
                user: User,
                token: string
            }>(API_BASE_URL+'/login',{ email, password }); 

            const { access_token, refresh_token, user } = response.data;
            setToken(access_token);
            setUser(response.data.user);
            localStorage.setItem('j_auth_token', access_token);
            localStorage.setItem('j_refresh_token', refresh_token);
            localStorage.setItem('j_user', JSON.stringify(user));
            setLoading(false);
            axios.defaults.headers.common['Authorization'] = `${access_token}`;
            

            return user;
        } catch (error) {
            console.log("Login failled", error);
            throw error;
          
        }
        
    };


    const refreshAccessToken = async () => {
        console.log("... in Refresh token.., ");
        try {
          const refreshToken = localStorage.getItem('j_refresh_token');
          if (!refreshToken) throw new Error('No refresh token');
          
          const response = await axios.post(API_BASE_URL+'/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = response.data;
          
          localStorage.setItem('j_auth_token', access_token);
          localStorage.setItem('j_refresh_token', refresh_token);
          axios.defaults.headers.common['Authorization'] = `${access_token}`;
    
    return access_token;
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

    const isShopOwner = (shop: Shop): boolean => {
        if (!user) return false;
        return shop.OwnerID == user.id;
    }

    const isShopEmployee = (shop: Shop): boolean => {
        const employeeIDs: number[] = shop.Employees.map(e => e.id);
        if (!user) return false;
        return employeeIDs?.some(e=>employeeIDs.includes(user.id))
    }

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
            {!loading && children }
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

