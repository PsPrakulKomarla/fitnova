import { EventEmitter } from 'events';

export type DomainEventType =
  | 'USER_PROFILE_UPDATED'
  | 'GOAL_CHANGED'
  | 'FOOD_SCANNED'
  | 'MEAL_LOGGED'
  | 'WORKOUT_COMPLETED'
  | 'WEIGHT_UPDATED'
  | 'PLAN_UPDATED'
  | 'PLAN_ADAPTATION_PROPOSED'
  | 'PLAN_ADAPTATION_APPROVED'
  | 'RECOMMENDATION_ACCEPTED';

export interface DomainEvent<T = unknown> {
  id: string;
  type: DomainEventType;
  userId: string;
  timestamp: string;
  payload: T;
}

class DomainEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit<T>(type: DomainEventType, userId: string, payload: T): DomainEvent<T> {
    const event: DomainEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      userId,
      timestamp: new Date().toISOString(),
      payload
    };

    // Emit event asynchronously on next tick so domain operation finishes first
    process.nextTick(() => {
      this.emitter.emit(type, event);
      this.emitter.emit('*', event);
    });

    return event;
  }

  on<T = unknown>(type: DomainEventType | '*', handler: (event: DomainEvent<T>) => void | Promise<void>) {
    this.emitter.on(type, handler);
  }

  off(type: DomainEventType | '*', handler: (...args: any[]) => void) {
    this.emitter.off(type, handler);
  }
}

export const eventBus = new DomainEventBus();
