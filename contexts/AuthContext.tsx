
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: 'founder' | 'funder') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem('starta_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (role: 'founder' | 'funder') => {
    setIsLoading(true);
    const mockUser: User = {
      id: role === 'founder' ? 'founder_99' : 'funder_88',
      name: role === 'founder' ? 'Sarah Founder' : 'James Capital',
      email: role === 'founder' ? 'sarah@startup.io' : 'james@vc.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role === 'founder' ? 'Sarah' : 'James'}`,
      role: role
    };

    // Save to Supabase
    await db.saveUser(mockUser);
    
    setUser(mockUser);
    localStorage.setItem('starta_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('starta_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
