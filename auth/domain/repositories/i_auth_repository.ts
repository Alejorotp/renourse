import { AuthenticationUser, LoginAuthenticationUser, SignupAuthenticationUser } from '../models/authentication_user';

export interface IAuthRepository {
  login(user: LoginAuthenticationUser): Promise<AuthenticationUser>;
  signUp(user: SignupAuthenticationUser): Promise<boolean>;
  logOut(): Promise<boolean>;
  validate(email: string, validationCode: string): Promise<boolean>;
  refreshToken(): Promise<boolean>;
  forgotPassword(email: string): Promise<boolean>;
  resetPassword(email: string, newPassword: string, validationCode: string): Promise<boolean>;
  verifyToken(): Promise<boolean>;
}
