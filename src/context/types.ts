
import { Task, Session, UserState, Intervention, PriorityLevel, User } from '@/types';

export interface FlowStateContextType {
  currentUser: User | null;
  tasks: Task[];
  currentTask: Task | null;
  completedTasks: Task[];
  activeSession: Session | null;
  interventions: Intervention[];
  userState: UserState | null;
  isInSession: boolean;
  isLoading: boolean;
  createTask: (title: string, description?: string, priority?: PriorityLevel, dueDate?: Date) => Promise<void>;
  startSession: (state: UserState, selectedIntervention?: Intervention) => Promise<void>;
  endSession: (feedback: Session['feedback']) => Promise<void>;
  setUserState: (state: UserState) => void;
  resetAll: () => void;
  getSuggestedInterventions: () => Intervention[];
  completeCurrentTask: () => Promise<void>;
  deleteCurrentTask: () => Promise<void>;
  setCurrentTask: (taskId: string) => void;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string, name: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  getTodaysTasks: () => Task[];
}

export interface FlowStateState {
  currentUser: User | null;
  tasks: Task[];
  currentTask: Task | null;
  completedTasks: Task[];
  sessions: Session[];
  activeSession: Session | null;
  userState: UserState;
  interventions: Intervention[];
}

export type FlowStateAction =
  | { type: 'CREATE_TASK'; payload: Task }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_COMPLETED_TASKS'; payload: Task[] }
  | { type: 'START_SESSION'; payload: Session }
  | { type: 'END_SESSION'; payload: Session }
  | { type: 'SET_USER_STATE'; payload: UserState }
  | { type: 'COMPLETE_CURRENT_TASK'; payload: Task }
  | { type: 'DELETE_CURRENT_TASK' }
  | { type: 'SET_CURRENT_TASK'; payload: string }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'RESET_ALL' };
