import { AuthenticationUser } from '../../domain/models/authentication_user';
import { IAuthRepository } from '../../domain/repositories/i_auth_repository';
import { IAuthenticationSource } from '../datasources/i_authentication_source';

export class AuthRepository implements IAuthRepository {
  constructor(private authenticationSource: IAuthenticationSource) {}

  async login(email: string, password: string): Promise<AuthenticationUser> {
    const data = await this.authenticationSource.login(email, password);
    // Assuming the API returns a user object with id, email, and token
    return {
      id: data.id,
      email: data.email,
      token: data.token,
    };
  }

  async signUp(email: string, password: string, userName: string): Promise<AuthenticationUser> {
    const data = await this.authenticationSource.signUp(email, password, userName);
    return {
      id: data.id,
      email: data.email,
      token: data.token,
    };
  }

  async logout(): Promise<void> {
    return this.authenticationSource.logout();
  }
}
