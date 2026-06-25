import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithGoogle } from '@/services/googleAuth';
import { API_URL, API_HEADERS } from '@/services/api';

interface AuthContextProps {
  user: any;
  token: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading auth:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.type === 'success' && result.params?.access_token) {
        // Send Google token to backend to save user
        const response = await fetch(`${API_URL}/auth/google/callback`, {
          method: 'POST',
          headers: { ...API_HEADERS },
          body: JSON.stringify({ access_token: result.params.access_token }),
        });
        
        const data = await response.json();
        
        if (data.user) {
          // Save user data locally
          setUser(data.user);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          
          // Store token if provided
          if (data.token) {
            setToken(data.token);
            await AsyncStorage.setItem('token', data.token);
          }
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};