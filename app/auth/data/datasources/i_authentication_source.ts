export interface IAuthenticationSource {
  login(email: string, password: string): Promise<any>;
  signUp(email: string, password: string, userName: string): Promise<any>;
  logout(): Promise<void>;
  // Add other methods if needed
}
