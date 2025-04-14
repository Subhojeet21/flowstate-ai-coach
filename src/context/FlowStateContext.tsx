import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

import { Task, Session, UserState, Intervention, PriorityLevel, User } from '@/types';
import { interventions } from '@/data/interventions';
import { toast } from "sonner";
import * as api from '@/services/api';
import { tasksService, sessionsService } from '@/services/supabaseService';
import { supabase } from "@/integrations/supabase/client";

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

const defaultUserState: UserState = {
  energy: 'medium',
  emotion: 'neutral',
};

type FlowStateAction =
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
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        currentTask: state.currentTask || (action.payload.length > 0 ? action.payload[0] : null),
      };
      
    case 'SET_COMPLETED_TASKS':
      return {
        ...state,
        completedTasks: action.payload,
      };
    
    case 'CREATE_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        currentTask: state.currentTask === null ? action.payload : state.currentTask,
      };

    case 'START_SESSION':
      return {
        ...state,
        activeSession: action.payload,
        userState: action.payload.state,
      };

    case 'END_SESSION':
      const endedSession = action.payload;
      
      // Update the task with the new session
      const updatedTasks = state.tasks.map(task => 
        task.id === endedSession.taskId 
          ? { ...task, sessions: [...task.sessions, endedSession] } 
          : task
      );
      
      const updatedCurrentTask = state.currentTask && state.currentTask.id === endedSession.taskId
        ? { ...state.currentTask, sessions: [...state.currentTask.sessions, endedSession] }
        : state.currentTask;

      return {
        ...state,
        sessions: [...state.sessions, endedSession],
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
        activeSession: null,
      };

    case 'SET_USER_STATE':
      return {
        ...state,
        userState: action.payload,
      };

    case 'COMPLETE_CURRENT_TASK':
      if (!state.currentTask) return state;
      
      const completedTask = action.payload;
      const tasksAfterCompletion = state.tasks.filter(task => task.id !== completedTask.id);
      
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
      return {
        ...initialState,
        currentUser: state.currentUser,
      };

    default:
      return state;
  }
};

export const FlowStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(flowStateReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  // Load user data on auth state change
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadUserData();
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'RESET_ALL' });
        }
      }
    );

    // Initial session check
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const user = await api.getCurrentUser();
        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
          await loadUserTasks(user.id);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user data after authentication
  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const user = await api.getCurrentUser();
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
        await loadUserTasks(user.id);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user tasks
  const loadUserTasks = async (userId: string) => {
    try {
      // Load active tasks
      const tasks = await tasksService.getAll(userId);
      dispatch({ type: 'SET_TASKS', payload: tasks });
      
      // Load completed tasks
      const completedTasks = await tasksService.getCompleted(userId);
      dispatch({ type: 'SET_COMPLETED_TASKS', payload: completedTasks });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error("Failed to load tasks");
    }
  };

  const createTask = async (title: string, description?: string, priority: PriorityLevel = 'medium', dueDate?: Date) => {
    if (!state.currentUser) {
      toast.error("You must be logged in to create tasks");
      return;
    }
    
    setIsLoading(true);
    try {
      const newTask = await tasksService.create(
        { title, description, priority, dueDate, createdAt: new Date(), completed: false }, 
        state.currentUser.id
      );
      
      dispatch({ type: 'CREATE_TASK', payload: newTask });
      toast.success("Task created successfully");
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error("Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (userState: UserState, selectedIntervention?: Intervention) => {
    if (!state.currentUser || !state.currentTask) {
      toast.error("You must be logged in and have a task selected");
      return;
    }
    
    setIsLoading(true);
    try {
      const newSession = await sessionsService.startSession(
        state.currentTask.id,
        state.currentUser.id,
        userState,
        selectedIntervention
      );
      
      dispatch({ 
        type: 'START_SESSION', 
        payload: newSession
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error("Failed to start session");
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async (feedback: Session['feedback']) => {
    if (!state.activeSession) {
      toast.error("No active session to end");
      return;
    }
    
    setIsLoading(true);
    try {
      const endedSession = await sessionsService.endSession(
        state.activeSession.id,
        feedback
      );
      
      dispatch({ type: 'END_SESSION', payload: endedSession });
    } catch (error) {
      console.error('Failed to end session:', error);
      toast.error("Failed to end session");
    } finally {
      setIsLoading(false);
    }
  };

  const setUserState = (userState: UserState) => {
    dispatch({ type: 'SET_USER_STATE', payload: userState });
  };

  const completeCurrentTask = async () => {
    if (!state.currentTask) {
      toast.error("No task selected");
      return;
    }
    
    setIsLoading(true);
    try {
      const completedTask = await tasksService.update({
        ...state.currentTask,
        completed: true
      });
      
      dispatch({ type: 'COMPLETE_CURRENT_TASK', payload: completedTask });
      toast.success("Task marked as completed");
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error("Failed to complete task");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCurrentTask = async () => {
    if (!state.currentTask) {
      toast.error("No task selected");
      return;
    }
    
    setIsLoading(true);
    try {
      await tasksService.delete(state.currentTask.id);
      
      dispatch({ type: 'DELETE_CURRENT_TASK' });
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error("Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentTask = (taskId: string) => {
    dispatch({ type: 'SET_CURRENT_TASK', payload: taskId });
  };

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await api.login(email, password);
      dispatch({ type: 'SET_USER', payload: user });
      await loadUserTasks(user.id);
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

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'RESET_ALL' });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
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
