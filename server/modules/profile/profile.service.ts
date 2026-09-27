import { database } from '../../core/database.js';
import { NotFoundError, ValidationError } from '../../core/errors.js';
import { eventBus } from '../../core/events.js';
import { UserProfile } from '../../../src/types/index.js';
import { UpdateProfileDto } from './profile.schemas.js';

export class ProfileService {
  async getProfile(userId: string): Promise<UserProfile> {
    const profile = database.profiles.get(userId);
    if (!profile) {
      throw new NotFoundError(`Profile for user ${userId} not found.`, 'PROFILE_NOT_FOUND');
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const existing = database.profiles.get(userId);
    if (!existing) {
      throw new NotFoundError(`Profile for user ${userId} not found.`, 'PROFILE_NOT_FOUND');
    }

    if (dto.age !== undefined && (dto.age < 13 || dto.age > 120)) {
      throw new ValidationError('Age must be between 13 and 120 years.');
    }
    if (dto.weightKg !== undefined && (dto.weightKg < 30 || dto.weightKg > 350)) {
      throw new ValidationError('Weight must be within reasonable physiological range (30-350 kg).');
    }
    if (dto.heightCm !== undefined && (dto.heightCm < 100 || dto.heightCm > 260)) {
      throw new ValidationError('Height must be within reasonable physiological range (100-260 cm).');
    }

    const updated: UserProfile = {
      ...existing,
      ...dto,
      id: userId
    };

    database.profiles.set(userId, updated);

    // Emit decoupled domain event
    eventBus.emit('USER_PROFILE_UPDATED', userId, {
      profile: updated,
      previousGoal: existing.goal,
      newGoal: updated.goal
    });

    return updated;
  }
}

export const profileService = new ProfileService();
