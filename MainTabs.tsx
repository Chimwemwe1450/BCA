import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

import HomeScreen from './screen/HomeScreen';
import ProfileScreen from './screen/ProfileScreen';
import PersonalInfoScreen from './screen/Personalinfoscreen';
import LanguageScreen from './screen/Languagescreen';
import savedLocation from './screen/savedLocation';
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();


const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <ProfileStack.Screen name="Language" component={LanguageScreen} />
      <ProfileStack.Screen name="savedLocation" component={savedLocation}/>
    </ProfileStack.Navigator>
  );
};

const MainTabs: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 65,
            position: 'absolute',
            left: 8,
            right: 8,
            bottom: insets.bottom > 0 ? insets.bottom - 3 : 0,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            elevation: 4,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: -1 },
            shadowRadius: 4,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

            if (route.name === 'Home') iconName = 'home-outline';
            else if (route.name === 'Profile') iconName = 'person-outline';
            else if (route.name === 'Settings') iconName = 'settings-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      </Tab.Navigator>
    </View>
  );
};

export default MainTabs;