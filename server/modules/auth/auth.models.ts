export interface UserEntity {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}
