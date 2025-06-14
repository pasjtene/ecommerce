// utils/errorHandler.ts
import axios from 'axios';

interface AppError {
  message: string;
  details?: string;
  code?: string;
}

export function handleApiError(error: unknown): AppError {
  // Default error response
  const defaultError: AppError = {
    message: 'An unexpected error occurred',
    details: 'Please try again later'
  };

  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.error || 
              error.response?.data?.message || 
              error.message || 
              'API request failed',
      details: error.response?.data?.details || 
              error.response?.statusText || 
              `Status code: ${error.response?.status}` || '',
      code: error.code
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: 'Client-side error occurred'
    };
  }

  return defaultError;
}