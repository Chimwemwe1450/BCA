import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // ✅ navigation hook
import { useAuth } from '../navigation/authContext';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>(); // ✅ Add navigation
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter Email and Password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid Email address');
      return;
    }

    try {
      setLoading(true);
      const url = `http://192.168.1.57:5291/api/Users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

      const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      if (data.success && data.token) {
        await login(data.token);
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', data.message || 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Image source={require('../assets/sports-car2.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            If you haven’t created an account yet,{' '}
            <Text style={styles.registerText}>please register</Text>.
          </Text>

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
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#555" />
            </TouchableOpacity>
          </View>

        
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>

  
          <TouchableOpacity onPress={() => navigation.navigate('Forget')}>
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 25 },
  title: { fontSize: 32, fontWeight: 'bold', alignSelf: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 25 },
  registerText: { color: '#6366F1', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 10, marginBottom: 20 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 25, paddingRight: 10 },
  passwordInput: { flex: 1, padding: 12 },
  eyeButton: { padding: 8 },
  button: { backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 25 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  forgotText: { fontSize: 17, color: '#6366F1', textAlign: 'center' },
});
