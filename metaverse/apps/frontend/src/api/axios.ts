import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

export const instance = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});