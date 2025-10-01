import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Register from './screen/RegisterScreen';
import LoginScreen from './screen/LoginScreen';
import HomeScreen from './screen/HomeScreen'; 

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
     
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={HomeScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
