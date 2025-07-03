export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse{
  token_data: {
    expires_in: number;
    token: string;
  };
  user: Object;
}
