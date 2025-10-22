import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: number;
  name: string;
  email: string;
  image?: string; 
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>; 
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: async () => {},
  logout: async () => {},
  loading: true,
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [savedToken, savedId, savedName, savedEmail, savedImage] = await Promise.all([
          SecureStore.getItemAsync('userToken'),
          SecureStore.getItemAsync('userId'),
          SecureStore.getItemAsync('userName'),
          SecureStore.getItemAsync('userEmail'),
          SecureStore.getItemAsync('userImage'), 
        ]);

        if (savedToken && savedId && savedName && savedEmail) {
          setToken(savedToken);
          setUser({ 
            id: parseInt(savedId), 
            name: savedName, 
            email: savedEmail,
            image: savedImage || undefined, 
          });
        }
      } catch (error) {
 
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

      await Promise.all([
        SecureStore.setItemAsync('userToken', userToken),
        SecureStore.setItemAsync('userId', userData.id.toString()),
        SecureStore.setItemAsync('userName', userData.name),
        SecureStore.setItemAsync('userEmail', userData.email),
        userData.image ? SecureStore.setItemAsync('userImage', userData.image) : Promise.resolve(),
      ]);

      setToken(userToken);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // ✅ Clear all stored data
      await Promise.all([
        SecureStore.deleteItemAsync('userToken'),
        SecureStore.deleteItemAsync('userId'),
        SecureStore.deleteItemAsync('userName'),
        SecureStore.deleteItemAsync('userEmail'),
        SecureStore.deleteItemAsync('userImage'), // ✅ Clear image too
      ]);

      // ✅ Clear state
      setToken(null);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };


  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = { ...user, ...updates };
      
 
      const storageUpdates = [];
      
      if (updates.name !== undefined) {
        storageUpdates.push(SecureStore.setItemAsync('userName', updates.name));
      }
      if (updates.email !== undefined) {
        storageUpdates.push(SecureStore.setItemAsync('userEmail', updates.email));
      }
      if (updates.image !== undefined) {
        if (updates.image) {
          storageUpdates.push(SecureStore.setItemAsync('userImage', updates.image));
        } else {
          storageUpdates.push(SecureStore.deleteItemAsync('userImage'));
        }
      }

      await Promise.all(storageUpdates);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      login, 
      logout, 
      loading,
      updateUser, // ✅ Include the new function
    }}>
      {children}
    </AuthContext.Provider>
  );
};