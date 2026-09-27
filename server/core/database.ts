import { db } from '../db.js';

/**
 * Core Database connection and repository access point.
 * Follows the repository pattern to keep domain services decoupled from persistence technology.
 */
export interface DatabaseContext {
  users: typeof db.users;
  profiles: typeof db.profiles;
  plans: typeof db.plans;
  planVersions: typeof db.planVersions;
  foodLogs: typeof db.foodLogs;
  foodItems: typeof db.foodItems;
  dailyProgress: typeof db.dailyProgress;
  proposedAdaptations: typeof db.proposedAdaptations;
  workflowRuns: typeof db.workflowRuns;
  notifications: typeof db.notifications;
}

export const database: DatabaseContext = {
  get users() { return db.users; },
  get profiles() { return db.profiles; },
  get plans() { return db.plans; },
  get planVersions() { return db.planVersions; },
  get foodLogs() { return db.foodLogs; },
  get foodItems() { return db.foodItems; },
  get dailyProgress() { return db.dailyProgress; },
  get proposedAdaptations() { return db.proposedAdaptations; },
  get workflowRuns() { return db.workflowRuns; },
  get notifications() { return db.notifications; }
};
