import { toast } from 'react-toastify';

export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  const errorMessage = error?.response?.data?.message || error?.message || defaultMessage;
  
  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }
  
  // Show error toast
  toast.error(errorMessage);
  
  // Return the error message in case the caller wants to use it
  return errorMessage;
};

export const handleSuccess = (message = 'Operation successful') => {
  toast.success(message);
};
