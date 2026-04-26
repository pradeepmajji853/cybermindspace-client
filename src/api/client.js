import axios from 'axios';
import { auth } from '../config/firebase';

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach Firebase ID token to every request
client.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Failed to get auth token:', err);
  }
  return config;
});

// Handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — sign out
      auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
