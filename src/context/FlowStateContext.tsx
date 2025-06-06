import React, { createContext, useReducer, useEffect, useState } from 'react';
import { toast } from "sonner";
import * as api from '@/services/api';
import { tasksService, sessionsService } from '@/services/supabaseService';
import { supabase } from "@/integrations/supabase/client";
import { Task, Session, UserState, Intervention, PriorityLevel } from '@/types';
import { FlowStateContextType, FlowStateState } from './types';
import { flowStateReducer, initialState } from './flowStateReducer';

export const FlowStateContext = createContext<FlowStateContextType | undefined>(undefined);

export const FlowStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(flowStateReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authSubscription, setAuthSubscription] = useState<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    console.log('Setting up auth state change listener');
    
    if (authSubscription) {
      authSubscription.unsubscribe();
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setTimeout(() => loadUserData(), 0);
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SET_USER', payload: null });
          dispatch({ type: 'RESET_ALL' });
        }
      }
    );
    
    setAuthSubscription(subscription);
    
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        console.log('Checking initial auth state');
        const user = await api.getCurrentUser();
        if (user) {
          console.log('User is authenticated:', user.id);
          dispatch({ type: 'SET_USER', payload: user });
          await loadUserTasks(user.id);
        } else {
          console.log('No authenticated user found');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };

    checkAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading user data');
      const user = await api.getCurrentUser();
      if (user) {
        console.log('User data loaded:', user.id);
        dispatch({ type: 'SET_USER', payload: user });
        await loadUserTasks(user.id);
      } else {
        console.log('No user data found');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserTasks = async (userId: string) => {
    try {
      console.log('Loading tasks for user:', userId);
      const tasks = await tasksService.getAll(userId);
      dispatch({ type: 'SET_TASKS', payload: tasks });
      
      const completedTasks = await tasksService.getCompleted(userId);
      dispatch({ type: 'SET_COMPLETED_TASKS', payload: completedTasks });
      console.log('Tasks loaded successfully');
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
      console.log('Attempting login for email:', email);
      const user = await api.login(email, password);
      console.log('Login successful:', user.id);
      
      toast.success("Logged in successfully");
      return user;
    } catch (error) {
      console.error('Login failed:', error);
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
      console.log('Attempting registration for email:', email);
      const user = await api.register(email, password, name);
      console.log('Registration successful:', user.id);
      
      toast.success("Account created successfully");
      return user;
    } catch (error) {
      console.error('Registration failed:', error);
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
      console.log('Logging out user');
      await api.logout();
      
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

export * from './useFlowState';
