import axios from 'axios';
import { User } from '@/types';

// Create an axios instance with a base URL
// In a real app, this would point to your actual backend
const api = axios.create({
  baseURL: 'https://api.flowstate-ai-coach.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// For demo purposes, we'll simulate API calls with localStorage
const STORAGE_KEY = 'flowstate_users';

// Helper to initialize localStorage if needed
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Helper to get users from localStorage
const getUsers = (): User[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

// Helper to save users to localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

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
    // In a real app, this would be an API call
    // For demo, we'll simulate it with localStorage
    
    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      streak: {
        count: 0,
        lastActiveDate: new Date(),
      },
    };
    
    // Save user
    users.push(newUser);
    saveUsers(users);
    
    // Generate a fake token
    const token = `token_${newUser.id}`;
    setToken(token);
    
    return newUser;
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
    // In a real app, this would be an API call
    // For demo, we'll simulate it with localStorage
    
    // Find user
    const users = getUsers();
    const user = users.find(user => user.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In a real app, we would check the password here
    // For demo, we'll accept any password
    
    // Update last login
    user.lastLoginAt = new Date();
    saveUsers(users);
    
    // Generate a fake token
    const token = `token_${user.id}`;
    setToken(token);
    
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
    // In a real app, this would be an API call using the token
    // For demo, we'll simulate it with localStorage
    
    const token = getToken();
    
    if (!token) {
      return null;
    }
    
    // Extract user ID from token
    const userId = token.split('_')[1];
    
    // Find user
    const users = getUsers();
    const user = users.find(user => user.id === userId);
    
    return user || null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

// Logout
export const logout = (): void => {
  removeToken();
};

export default api;
