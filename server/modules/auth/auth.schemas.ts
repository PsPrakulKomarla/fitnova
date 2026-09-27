export interface LoginRequestDto {
  email: string;
}

export interface RegisterRequestDto {
  email: string;
  name: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}
