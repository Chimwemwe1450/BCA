import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';

type ForgetPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const ForgetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgetPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [emailError, setEmailError] = useState('');

  // Check email immediately on change
  useEffect(() => {
    if (!email) {
      setEmailError('');
      return;
    }

    const checkEmail = async () => {
      try {
        const response = await fetch('http://192.168.1.57:5291/api/Users');
        const data = await response.json();

        const userExists = data.some((u: any) => u.email === email);
        if (userExists) {
          if (step !== 'reset') {
            Alert.alert('Success', 'Email found! You can now reset your password.');
          }
          setStep('reset');
          setEmailError('');
        } else {
          setEmailError('Email does not exist.');
          setStep('email');
        }
      } catch (error) {
        console.log('Error checking email:', error);
        setEmailError('Unable to check email.');
      }
    };

    checkEmail();
  }, [email]);

  const handleResetPassword = async () => {
    if (!newPassword) {
      setEmailError('Please enter a new password.');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.57:5291/api/Users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailError('');
        Alert.alert('Success', 'Password has been reset. You can now login.');
        navigation.replace('Login');
      } else {
        setEmailError(data.error || 'Something went wrong.');
      }
    } catch (error) {
      setEmailError('Unable to connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forget Password</Text>

      {step === 'email' && (
        <>
          <Text style={styles.subtitle}>Enter your email to continue:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

          {/* Back to Login only in email step */}
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 'reset' && (
        <>
          <Text style={styles.subtitle}>Enter your new password:</Text>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 25, 
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25, 
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20, 
  },
  button: {
    backgroundColor: '#6366F1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '50%',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#aaa',
    marginTop: 15, 
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});
