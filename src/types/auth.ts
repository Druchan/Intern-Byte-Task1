export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'local' | 'google' | 'github';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface AuthError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}