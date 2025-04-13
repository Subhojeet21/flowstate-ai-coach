import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

import { Task, Session, UserState, Intervention, PriorityLevel, User } from '@/types';
import { interventions } from '@/data/interventions';
import { toast } from "sonner";
import * as api from '@/services/api';

interface FlowStateContextType {
  currentUser: User | null;
  tasks: Task[];
  currentTask: Task | null;
  completedTasks: Task[];
  activeSession: Session | null;
  interventions: Intervention[];
  userState: UserState | null;
  isInSession: boolean;
  isLoading: boolean;
  createTask: (title: string, description?: string, priority?: PriorityLevel, dueDate?: Date) => void;
  startSession: (state: UserState) => void;
  endSession: (feedback: Session['feedback']) => void;
  setUserState: (state: UserState) => void;
  resetAll: () => void;
  getSuggestedInterventions: () => Intervention[];
  completeCurrentTask: () => void;
  deleteCurrentTask: () => void;
  setCurrentTask: (taskId: string) => void;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string, name: string) => Promise<void>;
  logoutUser: () => void;
  getTodaysTasks: () => Task[];
}

const defaultUserState: UserState = {
  energy: 'medium',
  emotion: 'neutral',
};


type FlowStateAction =
  | { type: 'CREATE_TASK'; payload: { title: string; description?: string; priority: PriorityLevel; dueDate?: Date } }
  | { type: 'START_SESSION'; payload: UserState }
  | { type: 'END_SESSION'; payload: Session['feedback'] }
  | { type: 'SET_USER_STATE'; payload: UserState }
  | { type: 'COMPLETE_CURRENT_TASK' }
  | { type: 'DELETE_CURRENT_TASK' }
  | { type: 'SET_CURRENT_TASK'; payload: string }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'RESET_ALL' };

interface FlowStateState {
  currentUser: User | null;
  tasks: Task[];
  currentTask: Task | null;
  completedTasks: Task[];
  sessions: Session[];
  activeSession: Session | null;
  userState: UserState;
  interventions: Intervention[];
}

const initialState: FlowStateState = {
  currentUser: null,
  tasks: [],
  currentTask: null,
  completedTasks: [],
  sessions: [],
  activeSession: null,
  userState: defaultUserState,
  interventions: interventions,
};

const FlowStateContext = createContext<FlowStateContextType | undefined>(undefined);

const flowStateReducer = (state: FlowStateState, action: FlowStateAction): FlowStateState => {
  switch (action.type) {
    case 'CREATE_TASK':
      const newTask: Task = {
        id: Date.now().toString(),
        title: action.payload.title,
        description: action.payload.description,
        priority: action.payload.priority,
        dueDate: action.payload.dueDate,
        createdAt: new Date(),
        sessions: [],
        completed: false,
      };
      
      return {
        ...state,
        tasks: [...state.tasks, newTask],
        currentTask: state.currentTask === null ? newTask : state.currentTask,
      };

    case 'START_SESSION':
      if (!state.currentTask) return state;
      
      const newSession: Session = {
        id: Date.now().toString(),
        taskId: state.currentTask.id,
        startTime: new Date(),
        state: action.payload,
        completed: false,
      };
      
      return {
        ...state,
        activeSession: newSession,
        userState: action.payload,
      };

    case 'END_SESSION':
      if (!state.activeSession || !state.currentTask) return state;
      
      const endedSession: Session = {
        ...state.activeSession,
        endTime: new Date(),
        duration: Math.floor(
          (new Date().getTime() - state.activeSession.startTime.getTime()) / 60000
        ),
        completed: true,
        feedback: action.payload,
      };
      
      const updatedSessions = [...state.sessions, endedSession];
      
      const updatedTasks = state.tasks.map(task => 
        task.id === state.currentTask?.id 
          ? { ...task, sessions: [...task.sessions, endedSession] } 
          : task
      );
      
      const updatedCurrentTask = state.currentTask 
        ? { ...state.currentTask, sessions: [...state.currentTask.sessions, endedSession] }
        : null;

      let updatedUser = state.currentUser;
      if (updatedUser) {
        const today = new Date().toDateString();
        const lastActiveDate = new Date(updatedUser.streak.lastActiveDate).toDateString();
        
        if (today !== lastActiveDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isConsecutiveDay = lastActiveDate === yesterday.toDateString();
          
          updatedUser = {
            ...updatedUser,
            streak: {
              count: isConsecutiveDay ? updatedUser.streak.count + 1 : 1,
              lastActiveDate: new Date(),
            }
          };
        }
      }

      return {
        ...state,
        sessions: updatedSessions,
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
        activeSession: null,
        currentUser: updatedUser,
      };

    case 'SET_USER_STATE':
      return {
        ...state,
        userState: action.payload,
      };

    case 'COMPLETE_CURRENT_TASK':
      if (!state.currentTask) return state;
      
      const completedTask = { ...state.currentTask, completed: true };
      const tasksAfterCompletion = state.tasks.filter(task => task.id !== state.currentTask?.id);
      
      return {
        ...state,
        tasks: tasksAfterCompletion,
        completedTasks: [...state.completedTasks, completedTask],
        currentTask: tasksAfterCompletion.length > 0 ? tasksAfterCompletion[0] : null,
      };

    case 'DELETE_CURRENT_TASK':
      if (!state.currentTask) return state;
      
      const tasksAfterDeletion = state.tasks.filter(task => task.id !== state.currentTask?.id);
      
      return {
        ...state,
        tasks: tasksAfterDeletion,
        currentTask: tasksAfterDeletion.length > 0 ? tasksAfterDeletion[0] : null,
      };

    case 'SET_CURRENT_TASK':
      const taskToSet = state.tasks.find(task => task.id === action.payload);
      if (!taskToSet) return state;
      
      return {
        ...state,
        currentTask: taskToSet,
      };

    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
      };

    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
};

export const FlowStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(flowStateReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const user = await api.getCurrentUser();
        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const createTask = (title: string, description?: string, priority: PriorityLevel = 'medium', dueDate?: Date) => {
    dispatch({ type: 'CREATE_TASK', payload: { title, description, priority, dueDate } });
    toast.success("Task created successfully");
  };

  const startSession = (userState: UserState) => {
    dispatch({ type: 'START_SESSION', payload: userState });
  };

  const endSession = (feedback: Session['feedback']) => {
    dispatch({ type: 'END_SESSION', payload: feedback });
  };

  const setUserState = (userState: UserState) => {
    dispatch({ type: 'SET_USER_STATE', payload: userState });
  };

  const completeCurrentTask = () => {
    dispatch({ type: 'COMPLETE_CURRENT_TASK' });
    toast.success("Task marked as completed");
  };

  const deleteCurrentTask = () => {
    dispatch({ type: 'DELETE_CURRENT_TASK' });
    toast.success("Task deleted successfully");
  };

  const setCurrentTask = (taskId: string) => {
    dispatch({ type: 'SET_CURRENT_TASK', payload: taskId });
  };

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await api.login(email, password);
      dispatch({ type: 'SET_USER', payload: user });
      toast.success("Logged in successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login failed");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const user = await api.register(email, password, name);
      dispatch({ type: 'SET_USER', payload: user });
      toast.success("Account created successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    api.logout();
    dispatch({ type: 'SET_USER', payload: null });
    toast.success("Logged out successfully");
  };

  const resetAll = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  const getSuggestedInterventions = (): Intervention[] => {
    if (!state.userState) return [];

    return state.interventions.filter(intervention => {
      return (
        intervention.forEnergy.includes(state.userState.energy) &&
        intervention.forEmotions.includes(state.userState.emotion)
      );
    });
  };

  const getTodaysTasks = (): Task[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return state.tasks
      .filter(task => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate <= today && !task.completed;
        }
        return !task.completed;
      })
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  };

  return (
    <FlowStateContext.Provider
      value={{
        currentUser: state.currentUser,
        tasks: state.tasks,
        currentTask: state.currentTask,
        completedTasks: state.completedTasks,
        activeSession: state.activeSession,
        interventions: state.interventions,
        userState: state.userState,
        isInSession: !!state.activeSession,
        isLoading,
        createTask,
        startSession,
        endSession,
        setUserState,
        completeCurrentTask,
        deleteCurrentTask,
        resetAll,
        getSuggestedInterventions,
        setCurrentTask,
        loginUser,
        registerUser,
        logoutUser,
        getTodaysTasks,
      }}
    >
      {children}
    </FlowStateContext.Provider>
  );
};

export const useFlowState = (): FlowStateContextType => {
  const context = useContext(FlowStateContext);
  if (context === undefined) {
    throw new Error('useFlowState must be used within a FlowStateProvider');
  }
  return context;
};
