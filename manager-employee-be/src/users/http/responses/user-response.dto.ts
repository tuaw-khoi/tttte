export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

export class UserListResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export class LoginResponseDto {
  user: UserResponseDto;
  token: string;
}
