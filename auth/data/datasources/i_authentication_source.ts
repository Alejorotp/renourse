import { AuthenticationUser, LoginAuthenticationUser, SignupAuthenticationUser } from '../../domain/models/authentication_user';

export interface IAuthenticationSource {
  login(user: LoginAuthenticationUser): Promise<AuthenticationUser>;
  signUp(user: SignupAuthenticationUser): Promise<boolean>;
  logOut(): Promise<boolean>;
  validate(email: string, validationCode: string): Promise<boolean>;
  refreshToken2(rToken: string): Promise<string | null>;
  refreshToken(): Promise<boolean>;
  forgotPassword(email: string): Promise<boolean>;
  resetPassword(email: string, newPassword: string, validationCode: string): Promise<boolean>;
  verifyToken(accessToken: string): Promise<boolean>;
}
