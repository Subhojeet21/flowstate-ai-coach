
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
    
    // Store session token in localStorage for persistence
    if (authData.session) {
      setToken(authData.session.access_token);
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
    console.error('Registration error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to register');
  }
};

// Login a user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Login attempt for:', email);
    
    // Login with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error('Auth error during login:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('No user returned from sign in');
      throw new Error('Login failed');
    }
    
    // Store session token in localStorage for persistence
    if (authData.session) {
      console.log('Setting token for session');
      setToken(authData.session.access_token);
    } else {
      console.error('No session returned from sign in');
    }
    
    // Get user streak or initialize if it doesn't exist
    let streak;
    try {
      streak = await userStreakService.getStreak(authData.user.id);
    } catch (error) {
      console.log('Error getting streak, initializing:', error);
      // If getting streak fails, initialize it
      try {
        streak = await userStreakService.initializeStreak(authData.user.id);
      } catch (streakError) {
        console.error('Failed to initialize streak:', streakError);
        // Provide a default streak to prevent further errors
        streak = {
          count: 0,
          lastActiveDate: new Date()
        };
      }
    }
    
    // Return user data
    const user: User = {
      id: authData.user.id,
      email: authData.user.email || email,
      name: authData.user.user_metadata.name,
      createdAt: new Date(authData.user.created_at || Date.now()),
      lastLoginAt: new Date(),
      streak,
    };
    
    console.log('Login successful, returning user:', user.id);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
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
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }
    
    if (!sessionData.session?.user) {
      console.log('No active session found');
      return null;
    }
    
    const user = sessionData.session.user;
    
    // Store the token again to ensure it's available
    if (sessionData.session.access_token) {
      setToken(sessionData.session.access_token);
    }
    
    // Get user streak or initialize if it doesn't exist
    let streak;
    try {
      streak = await userStreakService.getStreak(user.id);
    } catch (error) {
      console.log('Error getting streak, initializing:', error);
      // If getting streak fails, initialize it
      try {
        streak = await userStreakService.initializeStreak(user.id);
      } catch (streakError) {
        console.error('Failed to initialize streak:', streakError);
        // Provide a default streak to prevent further errors
        streak = {
          count: 0,
          lastActiveDate: new Date()
        };
      }
    }
    
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
  try {
    console.log('Logging out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    removeToken();
    console.log('Logout successful, token removed');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export default api;
