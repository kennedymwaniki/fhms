import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, logout, updateProfile as updateProfileAction } from '../store/slices/authSlice';
import authService from '../api/services/auth.service';
import { toast } from 'sonner';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const data = await authService.login(credentials);
      dispatch(loginSuccess(data));
      
      // Redirect based on user role
      if (data.user) {
        switch (data.user.role) {
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'morgue_attendant':
          case 'morgueAttendant':
            navigate('/dashboard/morgue');
            break;
          default:
            navigate('/dashboard/client');
        }
        
        toast.success('Login successful!');
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      throw error; // Re-throw for component-level handling
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors?.[0]?.msg) || 
                          'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logoutUser = () => {
    authService.logout();
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
  };

  const updateProfileData = async (userData) => {
    try {
      const data = await authService.updateProfile(userData);
      dispatch(updateProfileAction(data.user));
      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
    updateProfile: updateProfileData,
  };
};