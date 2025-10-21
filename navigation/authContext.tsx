import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: number; // ✅ Added id field
  name: string;
  email: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => Promise<void>; // ✅ User is now required
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('userToken');
        const savedId = await SecureStore.getItemAsync('userId');
        const savedName = await SecureStore.getItemAsync('userName');
        const savedEmail = await SecureStore.getItemAsync('userEmail');

        if (savedToken && savedId && savedName && savedEmail) {
          setToken(savedToken);
          setUser({ 
            id: parseInt(savedId), 
            name: savedName, 
            email: savedEmail 
          });
        }
      } catch (error) {
        console.error('Error loading stored user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const login = async (userToken: string, userData: User) => {
    try {
     
      if (!userToken || !userData?.id || !userData?.name || !userData?.email) {
        throw new Error('Invalid login data: token, id, name, and email are required');
      }

     
      await SecureStore.setItemAsync('userToken', userToken);
      await SecureStore.setItemAsync('userId', userData.id.toString());
      await SecureStore.setItemAsync('userName', userData.name);
      await SecureStore.setItemAsync('userEmail', userData.email);
      

      setToken(userToken);
      setUser(userData);

      console.log('Login successful:', { 
        id: userData.id,
        user: userData.name, 
        email: userData.email 
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
  
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userId');
      await SecureStore.deleteItemAsync('userName');
      await SecureStore.deleteItemAsync('userEmail');
      
 
      setToken(null);
      setUser(null);

      console.log('Logout successful - user data cleared');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};