import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

const Register: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [email, setEmail] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

 
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true
      );

      return () => backHandler.remove();
    }, [])
  );

  const handleRegister = () => {
    let missingFields: string[] = [];

    if (!user) missingFields.push('Username');
    if (!email) missingFields.push('Email');
    if (!password) missingFields.push('Password');

    if (missingFields.length > 0) {
      Alert.alert('Error', `Please enter ${missingFields.join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid Email address');
      return;
    }

    Alert.alert('Success', 'User registered successfully!');
    navigation.replace('Login'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>
        If you already created an account,{' '}
        <Text
          style={styles.registerText}
          onPress={() => navigation.replace('Login')} 
        >
          please login
        </Text>
        .
      </Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={user}
        onChangeText={setUser}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          style={[styles.input, { paddingRight: 45 }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.iconButton}
        >
          <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={24}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    top: '35%',
    transform: [{ translateY: -12 }],
  },
  button: {
    backgroundColor: '#6366F1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
