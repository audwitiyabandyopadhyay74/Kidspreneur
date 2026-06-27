import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall, successMessage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (successMessage) {
        toast.success(successMessage);
      }
      return { data: response, error: null };
    } catch (err) {
      const errorMessage = err.message || 'Something went wrong';
      toast.error(errorMessage);
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
};
