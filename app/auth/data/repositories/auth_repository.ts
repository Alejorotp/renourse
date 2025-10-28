import * as SecureStore from 'expo-secure-store';
import { AuthenticationUser, LoginAuthenticationUser, SignupAuthenticationUser } from '../../domain/models/authentication_user';
import { IAuthRepository } from '../../domain/repositories/i_auth_repository';
import { IAuthenticationSource } from '../datasources/i_authentication_source';

export class AuthRepository implements IAuthRepository {
  constructor(private authenticationSource: IAuthenticationSource) {}

  async login(user: LoginAuthenticationUser): Promise<AuthenticationUser> {
    const data = await this.authenticationSource.login(user);
    return data;
  }

  async signUp(user: SignupAuthenticationUser): Promise<boolean> {
    const data = await this.authenticationSource.signUp(user);
    return data;
  }

  async logOut(): Promise<boolean> {
    return this.authenticationSource.logOut();
  }

  validate(email: string, validationCode: string): Promise<boolean> {
    return this.authenticationSource.validate(email, validationCode);
  }

  refreshToken(): Promise<boolean> {
    return this.authenticationSource.refreshToken();
  }

  forgotPassword(email: string): Promise<boolean> {
    return this.authenticationSource.forgotPassword(email);
  }

  resetPassword(email: string, newPassword: string, validationCode: string): Promise<boolean> {
    return this.authenticationSource.resetPassword(email, newPassword, validationCode);
  }

  async verifyToken(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('token');
    if (!token) {
      return false;
    }
    return this.authenticationSource.verifyToken(token);
  }
}
