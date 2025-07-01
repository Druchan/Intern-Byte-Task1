import axios from 'axios';
import { User, LoginResponse, RegisterResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
  private token: string | null = null;

  constructor() {
    // Add request interceptor to include auth token
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.refreshToken();
            this.setToken(response.accessToken);
            localStorage.setItem('accessToken', response.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearToken();
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    }, {
      withCredentials: true
    });
    return response.data;
  }

  async register(email: string, password: string, name: string): Promise<RegisterResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password,
      name
    }, {
      withCredentials: true
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      withCredentials: true
    });
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      withCredentials: true
    });
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/user/profile`);
    return response.data.user;
  }

  getGoogleAuthUrl(): string {
    return `${API_BASE_URL}/auth/google`;
  }

  getGitHubAuthUrl(): string {
    return `${API_BASE_URL}/auth/github`;
  }
}

export const authService = new AuthService();