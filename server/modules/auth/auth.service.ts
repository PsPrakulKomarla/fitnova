import { database } from '../../core/database.js';
import { AuthenticationError, ValidationError } from '../../core/errors.js';
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from './auth.schemas.js';

export class AuthService {
  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    if (!dto.email || !dto.email.includes('@')) {
      throw new ValidationError('A valid email address is required.');
    }

    // Lookup user in database
    let foundUser: { id: string; email: string; name: string } | undefined;
    for (const user of database.users.values()) {
      if (user.email.toLowerCase() === dto.email.toLowerCase()) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      // Auto-provision demo account for frictionless experience
      const newId = `user-${Date.now()}`;
      foundUser = {
        id: newId,
        email: dto.email,
        name: dto.email.split('@')[0]
      };
      database.users.set(newId, foundUser);
    }

    return {
      user: foundUser,
      token: `bearer_${foundUser.id}_session`
    };
  }

  async getCurrentUser(userId: string) {
    const user = database.users.get(userId);
    if (!user) {
      throw new AuthenticationError('User session expired or not found.');
    }
    return user;
  }
}

export const authService = new AuthService();
