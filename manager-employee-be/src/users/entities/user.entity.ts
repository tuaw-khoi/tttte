export class UserEntity {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  role: string;
  createdAt: Date;
}
