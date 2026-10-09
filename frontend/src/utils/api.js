import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
});

// Interceptor to inject active user/role context headers on every request
api.interceptors.request.use(
  (config) => {
    const role = localStorage.getItem('insta_role') || 'worker';
    const userId = localStorage.getItem('insta_user_id') || '';
    
    config.headers['x-role'] = role;
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setClientContext = (role, userId) => {
  localStorage.setItem('insta_role', role);
  if (userId) {
    localStorage.setItem('insta_user_id', userId);
  } else {
    localStorage.removeItem('insta_user_id');
  }
};

export default api;
