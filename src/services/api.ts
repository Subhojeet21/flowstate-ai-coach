
import axios from 'axios';
import { User } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { userStreakService } from './supabaseService';

// Create an axios instance with a base URL
// In a real app, this would point to your actual backend
const api = axios.create({
  baseURL: 'https://api.flowstate-ai-coach.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('flowstate_token');
};

// Helper to set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('flowstate_token', token);
};

// Helper to remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('flowstate_token');
};

// Register a new user
export const register = async (email: string, password: string, name: string): Promise<User> => {
  try {
    // Register user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (authError) throw authError;
    
    if (!authData.user) throw new Error('User registration failed');
    
    // Initialize user streak
    if (authData.user.id) {
      await userStreakService.initializeStreak(authData.user.id);
    }
    
    // Return user data
    const user: User = {
      id: authData.user.id,
      email: authData.user.email || email,
      name: name,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      streak: {
        count: 0,
        lastActiveDate: new Date(),
      },
    };
    
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to register');
  }
};

// Login a user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    // Login with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) throw authError;
    
    if (!authData.user) throw new Error('Login failed');
    
    // Get user streak
    const streak = await userStreakService.getStreak(authData.user.id);
    
    // Return user data
    const user: User = {
      id: authData.user.id,
      email: authData.user.email || email,
      name: authData.user.user_metadata.name,
      createdAt: new Date(authData.user.created_at || Date.now()),
      lastLoginAt: new Date(),
      streak,
    };
    
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to login');
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!sessionData.session?.user) return null;
    
    const user = sessionData.session.user;
    
    // Get user streak
    const streak = await userStreakService.getStreak(user.id);
    
    // Return user data
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata.name,
      createdAt: new Date(user.created_at || Date.now()),
      lastLoginAt: new Date(),
      streak,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
  removeToken();
};

export default api;
