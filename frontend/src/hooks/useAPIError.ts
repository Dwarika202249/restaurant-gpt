import { useCallback } from 'react';
import { AxiosError } from 'axios';

interface APIError {
  message: string;
  status?: number;
  data?: any;
}

/**
 * Custom hook for handling API errors
 * Provides consistent error messages and handling
 */
export const useAPIError = () => {
  const handleError = useCallback((error: unknown): APIError => {
    if (error instanceof AxiosError) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message
      };
    }

    return {
      message: 'An unexpected error occurred'
    };
  }, []);

  const getErrorMessage = useCallback((error: unknown): string => {
    const apiError = handleError(error);
    return apiError.message;
  }, [handleError]);

  return { handleError, getErrorMessage };
};
