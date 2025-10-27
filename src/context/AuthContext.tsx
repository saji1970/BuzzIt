import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService, {User} from '../services/ApiService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{success: boolean; error?: string}>;
  register: (userData: RegisterData) => Promise<{success: boolean; error?: string}>;
  sendVerificationCode: (mobileNumber: string, username: string) => Promise<{success: boolean; error?: string}>;
  verifyCode: (mobileNumber: string, code: string, verificationId: string) => Promise<{success: boolean; error?: string}>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<{success: boolean; error?: string}>;
}

interface RegisterData {
  username: string;
  displayName: string;
  mobileNumber: string;
  password: string;
  interests: any[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const isAdminFlag = await AsyncStorage.getItem('isAdmin');
      
      if (token) {
        const response = await ApiService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAdmin(isAdminFlag === 'true');
        } else {
          // Token is invalid, clear it
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('isAdmin');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(username, password);
      
      if (response.success && response.data) {
        const {user: userData, token, isAdmin: adminFlag} = response.data;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('isAdmin', (adminFlag || false).toString());
        setUser(userData);
        setIsAdmin(adminFlag || false);
        return {success: true};
      } else {
        return {success: false, error: response.error || 'Login failed'};
      }
    } catch (error) {
      console.error('Login error:', error);
      return {success: false, error: 'Network error. Please try again.'};
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      // First send verification code
      const verificationResponse = await ApiService.sendVerificationCode({
        mobileNumber: userData.mobileNumber,
        username: userData.username,
      });

      if (!verificationResponse.success) {
        return {success: false, error: verificationResponse.error || 'Failed to send verification code'};
      }

      // For now, we'll simulate the verification process
      // In a real app, you'd show a verification screen
      return {success: true, message: 'Verification code sent'};
    } catch (error) {
      console.error('Registration error:', error);
      return {success: false, error: 'Network error. Please try again.'};
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async (mobileNumber: string, username: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.sendVerificationCode({
        mobileNumber,
        username,
      });

      if (response.success) {
        return {success: true, message: response.data?.message || 'Verification code sent'};
      } else {
        return {success: false, error: response.error || 'Failed to send verification code'};
      }
    } catch (error) {
      console.error('Send verification error:', error);
      return {success: false, error: 'Network error. Please try again.'};
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (mobileNumber: string, code: string, verificationId: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.verifyCode({
        mobileNumber,
        code,
        verificationId,
      });

      if (response.success && response.data) {
        const {user: userData, token} = response.data;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return {success: true};
      } else {
        return {success: false, error: response.error || 'Verification failed'};
      }
    } catch (error) {
      console.error('Verification error:', error);
      return {success: false, error: 'Network error. Please try again.'};
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
      await AsyncStorage.removeItem('isAdmin');
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user) return {success: false, error: 'No user logged in'};

      const response = await ApiService.updateUser(user.id, updates);
      
      if (response.success && response.data) {
        setUser(response.data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        return {success: true};
      } else {
        return {success: false, error: response.error || 'Update failed'};
      }
    } catch (error) {
      console.error('Update user error:', error);
      return {success: false, error: 'Network error. Please try again.'};
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
    login,
    register,
    sendVerificationCode,
    verifyCode,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
