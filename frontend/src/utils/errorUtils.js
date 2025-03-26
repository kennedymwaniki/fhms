import { toast } from 'sonner';

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || 'An error occurred';

    switch (status) {
      case 400:
        toast.error('Invalid request: ' + message);
        break;
      case 401:
        toast.error('Authentication required. Please login.');
        // Optionally trigger logout or redirect to login
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 409:
        toast.error('Conflict: ' + message);
        break;
      case 422:
        // Validation errors
        if (error.response.data.errors) {
          Object.values(error.response.data.errors).forEach((err) => {
            toast.error(err);
          });
        } else {
          toast.error(message);
        }
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error('An unexpected error occurred');
    }

    return {
      status,
      message,
      errors: error.response.data?.errors || {},
    };
  } else if (error.request) {
    // Request was made but no response received
    toast.error('Network error. Please check your connection.');
    return {
      status: 0,
      message: 'Network error',
      errors: {},
    };
  } else {
    // Something else happened while setting up the request
    toast.error('An unexpected error occurred');
    return {
      status: -1,
      message: error.message,
      errors: {},
    };
  }
};

export const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  
  Object.entries(errors).forEach(([field, messages]) => {
    formattedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
  });
  
  return formattedErrors;
};

export const handleFormErrors = (errors) => {
  if (typeof errors === 'string') {
    toast.error(errors);
    return;
  }

  if (Array.isArray(errors)) {
    errors.forEach(error => toast.error(error));
    return;
  }

  Object.values(errors).forEach(error => {
    if (Array.isArray(error)) {
      error.forEach(e => toast.error(e));
    } else if (typeof error === 'string') {
      toast.error(error);
    }
  });
};