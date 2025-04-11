
export type EmotionalState = 'eager' | 'neutral' | 'anxious' | 'overwhelmed';
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface UserState {
  energy: EnergyLevel;
  emotion: EmotionalState;
  blockingThoughts?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  sessions: Session[];
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
