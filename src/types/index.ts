
export type EmotionalState = 'eager' | 'neutral' | 'anxious' | 'overwhelmed';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface UserState {
  energy: EnergyLevel;
  emotion: EmotionalState;
  blockingThoughts?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  lastLoginAt: Date;
  streak: {
    count: number;
    lastActiveDate: Date;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  dueDate?: Date;
  createdAt: Date;
  sessions: Session[];
  completed: boolean;
}

export interface Session {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  state: UserState;
  completed: boolean;
  feedback?: {
    difficulty: 'easy' | 'okay' | 'hard';
    progressMade: boolean;
    notes?: string;
  };
}

export interface Intervention {
  id: string;
  title: string;
  description: string;
  type: 'emotion' | 'cognition' | 'motivation' | 'behavior' | 'environment';
  forEnergy: EnergyLevel[];
  forEmotions: EmotionalState[];
  duration: number; // in minutes
}
