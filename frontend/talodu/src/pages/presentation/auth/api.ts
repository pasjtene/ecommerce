import axios from 'axios';
import { User } from './types'

export type Role = {
  id: number;
  name: string;
  description?: string;
};



export type UpdateUserData = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: number[]; // Array of role IDs
}

interface EditFormData  {
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	roles: number[]; // Array of role IDs
  }

  interface UserResponse  {
    message: string;
    user: User; // Array of role IDs
    }

 
// Configure axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const API_BASE_URL = 'http://162.19.227.240:8888';
//const API_BASE_URL = 'http://127.0.0.1:8888';


export const updateUser = async (userId: number, userData: EditFormData): Promise<UserResponse> => {
  try {
    const token = localStorage.getItem('j_auth_token');
    const response = await axios.put<UserResponse>(
      `${API_BASE_URL}/users/${userId}`,
      userData,
      {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Add request interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  // Typed API methods
export const authAPI = {
    login: (email: string, password: string) => 
      api.post<{ access: string; refresh: string; user: User }>('/token/', { email, password }),
    getUser: () => api.get<User>('/users/me/'),
  };
  
 

  
  export default api;