import { AuthenticationUser, SignupAuthenticationUser } from '../models/authentication_user';
import { IAuthRepository } from '../repositories/i_auth_repository';

export class AuthenticationUseCase {
  constructor(private authRepository: IAuthRepository) {}

  login(user: { email: string, password: string }): Promise<AuthenticationUser> {
    return this.authRepository.login(user);
  }

  signUp(user: SignupAuthenticationUser): Promise<boolean> {
    return this.authRepository.signUp(user);
  }

  logOut(): Promise<boolean> {
    return this.authRepository.logOut();
  }

  validate(email: string, validationCode: string): Promise<boolean> {
    return this.authRepository.validate(email, validationCode);
  }

  refreshToken(): Promise<boolean> {
    return this.authRepository.refreshToken();
  }

  forgotPassword(email: string): Promise<boolean> {
    return this.authRepository.forgotPassword(email);
  }

  resetPassword(email: string, newPassword: string, validationCode: string): Promise<boolean> {
    return this.authRepository.resetPassword(email, newPassword, validationCode);
  }

  verifyToken(): Promise<boolean> {
    return this.authRepository.verifyToken();
  }
}
