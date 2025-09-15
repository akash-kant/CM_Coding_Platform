import api from '@/api/axios'; // Use the '@' alias for a clean path

const API_URL = '/auth/'; // The path is now relative to the baseURL

const register = (userData) => {
  return api.post(API_URL + 'register', userData);
};

const login = (userData) => {
  return api.post(API_URL + 'login', userData);
};

const authService = {
  register,
  login,
};

export default authService;