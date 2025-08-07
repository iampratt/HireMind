import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, geminiApiKey: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          geminiApiKey: userData.geminiApiKey
        };
        
        setUser(user);
        localStorage.setItem('hiremind-user', JSON.stringify(user));
        localStorage.setItem('hiremind-token', token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error so the component can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, geminiApiKey: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.signup({ email, password, name, geminiApiKey });
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          geminiApiKey: userData.geminiApiKey
        };
        
        setUser(user);
        localStorage.setItem('hiremind-user', JSON.stringify(user));
        localStorage.setItem('hiremind-token', token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      // Re-throw the error so the component can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hiremind-user');
    localStorage.removeItem('hiremind-token');
  };

  // Check for existing user on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('hiremind-user');
    const token = localStorage.getItem('hiremind-token');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        
        // Verify token is still valid by fetching profile
        apiService.getProfile().catch(() => {
          // Token is invalid, clear everything
          logout();
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};