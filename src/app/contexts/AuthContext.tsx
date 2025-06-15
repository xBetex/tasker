'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  getCurrentUserInfo: () => { id: string; username: string; role: 'admin' | 'user' } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// User database with persistence
const USER_STORAGE_KEY = 'taskdashboard_users';

// Default users
const DEFAULT_USERS = [
  {
    id: '1',
    username: 'Caio',
    password: 'Caio123!',
    email: 'caiohenriquebertges@gmail.com',
    role: 'admin' as const,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    email: 'user@taskdashboard.com',
    role: 'user' as const,
    createdAt: new Date('2024-01-01')
  }
];

// Get users from localStorage or use defaults
const getUserDatabase = () => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt)
      }));
    }
  } catch (error) {
    console.error('Error loading user database:', error);
  }
  return DEFAULT_USERS;
};

// Save users to localStorage
const saveUserDatabase = (users: typeof DEFAULT_USERS) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving user database:', error);
  }
};

// Mock API functions - in real app, these would be actual API calls
const authAPI = {
  async login(username: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate credentials
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Find user in database
    const users = getUserDatabase();
    const mockUser = users.find((u: any) => u.username === username && u.password === password);
    
    if (!mockUser) {
      throw new Error('Invalid username or password');
    }
    
    // Create user object
    const user: User = {
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role,
      createdAt: mockUser.createdAt
    };
    
    // Store in localStorage (in real app, use secure tokens)
    localStorage.setItem('taskdashboard_user', JSON.stringify(user));
    localStorage.setItem('taskdashboard_token', `mock-jwt-token-${user.id}`);
    
    return user;
  },

  async register(username: string, email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (!username || !email || !password) {
      throw new Error('All fields are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Mock user creation
    const user: User = {
      id: Date.now().toString(),
      username,
      email,
      role: 'user',
      createdAt: new Date()
    };
    
    // Store in localStorage
    localStorage.setItem('taskdashboard_user', JSON.stringify(user));
    localStorage.setItem('taskdashboard_token', 'mock-jwt-token');
    
    return user;
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('taskdashboard_user');
    const token = localStorage.getItem('taskdashboard_token');
    
    if (!userStr || !token) {
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      return {
        ...user,
        createdAt: new Date(user.createdAt)
      };
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('taskdashboard_user');
    localStorage.removeItem('taskdashboard_token');
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    authAPI.getCurrentUser().then(currentUser => {
      setUser(currentUser);
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authAPI.login(username, password);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authAPI.register(username, email, password);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const getCurrentUserInfo = () => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      role: user.role
    };
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    getCurrentUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 