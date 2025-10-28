export interface AuthenticationUser {
  id: number;
  email: string;
  name: string;
  // Keep token here for session management
  accessToken: string;
  refreshToken: string;
}

export interface LoginAuthenticationUser {
  email: string;
  password: string;
}

export interface SignupAuthenticationUser {
  email: string;
  password: string;
  name: string;
}