import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
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
      switch (data.user.role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'morgueAttendant':
          navigate('/dashboard/morgue');
          break;
        default:
          navigate('/dashboard/client');
      }
      
      toast.success('Login successful!');
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logoutUser = () => {
    authService.logout();
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const data = await authService.updateProfile(userData);
      dispatch(loginSuccess({ user: data, token: localStorage.getItem('token') }));
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
    updateProfile,
  };
};