import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import API_BASE_URL from '@/config';


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
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
    }
  }, []);

  const mapApiRoleToUserRole = (apiRole: string): UserRole => {
    switch (apiRole.toLowerCase()) {
      case 'admin':
      case 'client':
        return 'admin';
      case 'waiter':
        return 'waiter';
      case 'chef':
        return 'chef';
      default:
        return 'customer';
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await axios.post(`${API_BASE_URL}api/auth/login/`, { email, password }, { headers: { 'Content-Type': 'application/json' } });
      if (response.status === 200) {
        const data = response.data;
        const role = mapApiRoleToUserRole(data.role);
        const userData: User = {
          id: data.user_id ? String(data.user_id) : '',
          firstName: data.first_name || email.split('@')[0],
          lastName: data.last_name || '',
          email,
          username: email,
          role,
          phone: data.phone || '',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        toast({
          title: 'Login Successful',
          description: data.message || `Welcome back, ${userData.firstName}!`,
        });
        return userData;
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      });
      return null;
    }
    return null;
  };

  const signup = async (data: Omit<User, 'id' | 'createdAt' | 'isActive'>): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}api/auth/register/`, data, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 201) {
        toast({
          title: 'Signup Successful',
          description: 'Your account has been created successfully.',
        });
        return true;
      }

      return false;
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.response?.data?.message || 'Something went wrong.',
        variant: 'destructive',
      });
      return false;
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
