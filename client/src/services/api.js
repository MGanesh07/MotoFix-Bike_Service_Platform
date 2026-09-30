import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Dev backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('motofix_user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
