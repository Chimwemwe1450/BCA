import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './navigation/authContext';
import Register from './screen/RegisterScreen';
import LoginScreen from './screen/LoginScreen';
import ForgetPasswordScreen from './screen/ForgetPasswordScreen';
import MainTabs from './MainTabs'; 

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HomeTabs: undefined;
  Forget: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="HomeTabs" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Forget" component={ForgetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  </AuthProvider>
);

export default App;
