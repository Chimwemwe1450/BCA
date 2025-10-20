import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
name: string;
email: string;
};

type AuthContextType = {
token: string | null;
user: User | null;
login: (token: string, user?: User) => Promise<void>;
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
const savedName = await SecureStore.getItemAsync('userName');
const savedEmail = await SecureStore.getItemAsync('userEmail');


    if (savedToken && savedName && savedEmail) {
      setToken(savedToken);
      setUser({ name: savedName, email: savedEmail });
    }
  } catch (error) {
    console.error('Error loading stored user data:', error);
  } finally {
    setLoading(false);
  }
};

loadStoredData();


}, []);

const login = async (userToken: string, user?: User) => {
if (!user || !user.name || !user.email) {
await SecureStore.setItemAsync('userToken', userToken);
setToken(userToken);
setUser(null);
return;
}


try {
  await SecureStore.setItemAsync('userToken', userToken);
  await SecureStore.setItemAsync('userName', user.name);
  await SecureStore.setItemAsync('userEmail', user.email);
  setToken(userToken);
  setUser(user);
} catch (error) {
  console.error('Error saving user data:', error);
}


};

const logout = async () => {
try {
await SecureStore.deleteItemAsync('userToken');
await SecureStore.deleteItemAsync('userName');
await SecureStore.deleteItemAsync('userEmail');
setToken(null);
setUser(null);
} catch (error) {
console.error('Error clearing user data:', error);
}
};

return (
<AuthContext.Provider value={{ token, user, login, logout, loading }}>
{children}
</AuthContext.Provider>
);
};
