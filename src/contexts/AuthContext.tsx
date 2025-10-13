import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: Omit<User, 'id' | 'createdAt' | 'isActive'>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      initializeDefaultUsers();
    }
  }, []);

  const initializeDefaultUsers = () => {
    const users = localStorage.getItem('users');
    if (!users) {
      const defaultUsers: User[] = [
        {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          phone: '9999999999',
          email: 'admin@restaurant.com',
          username: 'admin',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          firstName: 'John',
          lastName: 'Waiter',
          phone: '9999999998',
          email: 'waiter@restaurant.com',
          username: 'waiter',
          role: 'waiter',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          firstName: 'Chef',
          lastName: 'Master',
          phone: '9999999997',
          email: 'chef@restaurant.com',
          username: 'chef',
          role: 'chef',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          firstName: 'Guest',
          lastName: 'Customer',
          phone: '9999999996',
          email: 'customer@restaurant.com',
          username: 'customer',
          role: 'customer',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      
      const credentials = {
        admin: 'admin123',
        waiter: 'waiter123',
        chef: 'chef123',
        customer: 'customer123',
      };
      
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      localStorage.setItem('credentials', JSON.stringify(credentials));
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const credentials = JSON.parse(localStorage.getItem('credentials') || '{}');
    
    const foundUser = users.find(u => u.username === username && u.isActive);
    
    if (foundUser && credentials[username] === password) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${foundUser.firstName}!`,
      });
      return true;
    }
    
    toast({
      title: 'Login Failed',
      description: 'Invalid username or password',
      variant: 'destructive',
    });
    return false;
  };

  const signup = async (data: Omit<User, 'id' | 'createdAt' | 'isActive'>): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.username === data.username)) {
      toast({
        title: 'Signup Failed',
        description: 'Username already exists',
        variant: 'destructive',
      });
      return false;
    }
    
    const newUser: User = {
      ...data,
      id: Date.now().toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    toast({
      title: 'Signup Successful',
      description: 'Account created successfully!',
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
