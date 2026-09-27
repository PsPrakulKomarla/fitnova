import { database } from '../../core/database.js';
import { NotFoundError } from '../../core/errors.js';
import { eventBus } from '../../core/events.js';
import { calculateTargets } from '../../calculator.js';
import { Plan, PlanVersion, UserProfile } from '../../../src/types/index.js';
import { UpdateGoalDto } from './goals.schemas.js';

export class GoalsService {
  constructor() {
    // React to profile updates asynchronously without tight coupling
    eventBus.on('USER_PROFILE_UPDATED', async (event) => {
      const { profile } = event.payload as { profile: UserProfile };
      await this.recalculateForProfile(profile);
    });
  }

  async getPlan(userId: string): Promise<Plan> {
    const plan = database.plans.get(userId);
    if (!plan) {
      throw new NotFoundError(`Plan for user ${userId} not found.`, 'PLAN_NOT_FOUND');
    }
    return plan;
  }

  async getVersions(userId: string): Promise<PlanVersion[]> {
    return database.planVersions.get(userId) || [];
  }

  async updateGoal(userId: string, dto: UpdateGoalDto): Promise<Plan> {
    const profile = database.profiles.get(userId);
    if (!profile) {
      throw new NotFoundError(`Profile for user ${userId} not found.`, 'PROFILE_NOT_FOUND');
    }

    profile.goal = dto.goal;
    database.profiles.set(userId, profile);

    return this.recalculateForProfile(profile, dto);
  }

  private async recalculateForProfile(profile: UserProfile, dto?: UpdateGoalDto): Promise<Plan> {
    const { bmr, tdee, targets } = calculateTargets(profile);

    if (dto?.customCalories) targets.calories = dto.customCalories;
    if (dto?.customProteinG) targets.proteinG = dto.customProteinG;

    let plan = database.plans.get(profile.id);
    if (plan) {
      plan.bmr = bmr;
      plan.tdee = tdee;
      plan.dailyTargets = targets;
    } else {
      plan = {
        id: `plan-${profile.id}`,
        userId: profile.id,
        version: 1,
        bmr,
        tdee,
        dailyTargets: targets,
        workoutSchedule: [
          { day: 'Monday', title: 'Upper Body Compound', focus: 'Chest & Back', durationMinutes: 60, completed: false },
          { day: 'Wednesday', title: 'Lower Body Compound', focus: 'Quads & Hamstrings', durationMinutes: 60, completed: false },
          { day: 'Friday', title: 'Full Body Density', focus: 'Delts, Arms, Core', durationMinutes: 60, completed: false }
        ],
        rationale: `Calibrated targets for ${profile.goal.replace('_', ' ')} based on Mifflin-St Jeor formula.`,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      database.plans.set(profile.id, plan);
    }

    eventBus.emit('PLAN_UPDATED', profile.id, { plan });
    return plan;
  }
}

export const goalsService = new GoalsService();
