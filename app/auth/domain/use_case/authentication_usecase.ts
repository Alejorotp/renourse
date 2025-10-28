import { AuthenticationUser } from '../models/authentication_user';
import { IAuthRepository } from '../repositories/i_auth_repository';

export class AuthenticationUseCase {
  constructor(private authRepository: IAuthRepository) {}

  login(email: string, password: string): Promise<AuthenticationUser> {
    return this.authRepository.login(email, password);
  }

  signUp(email: string, password: string, userName: string): Promise<AuthenticationUser> {
    return this.authRepository.signUp(email, password, userName);
  }

  logout(): Promise<void> {
    return this.authRepository.logout();
  }
}
