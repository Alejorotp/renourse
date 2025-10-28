import { AuthenticationUser } from '../models/authentication_user';

export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthenticationUser>;
  signUp(email: string, password: string, userName: string): Promise<AuthenticationUser>;
  logout(): Promise<void>;
  // Add other methods like signUp, etc. if needed
}
