import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    toast.error('You do not have permission to access this page');
    // Determine the correct dashboard path based on user role
    let redirectPath;
    switch (user?.role) {
      case 'admin':
        redirectPath = '/dashboard/admin';
        break;
      case 'morgueAttendant':
        redirectPath = '/dashboard/morgue';
        break;
      case 'client':
        redirectPath = '/dashboard/client';
        break;
      default:
        redirectPath = '/';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;