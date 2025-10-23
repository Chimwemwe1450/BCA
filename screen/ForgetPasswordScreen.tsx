import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  useEffect(() => {
    if (!email) {
      setEmailError('');
      return;
    }

    const timer = setTimeout(async () => {
      await checkEmail();
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const checkEmail = async () => {
    if (!email) return;
    
    setIsCheckingEmail(true);
    try {
      const response = await fetch('http://192.168.1.57:5291/api/Users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      

      let users = [];
      if (data && Array.isArray(data)) {
   
        users = data;
      } else if (data && data.users && Array.isArray(data.users)) {
      
        users = data.users;
      } else if (data && data.success && Array.isArray(data.users)) {

        users = data.users;
      }
      
      console.log('Users found:', users.length); 
 
      const normalizedInputEmail = email.toLowerCase().trim();
      const userExists = users.some((u: any) => 
        u.email && u.email.toLowerCase().trim() === normalizedInputEmail
      );
      
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
      console.error('Error checking email:', error);
      setEmailError('Unable to check email. Please try again.');
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setEmailError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setEmailError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.57:5291/api/Users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailError('');
        Alert.alert('Success', 'Password has been reset. You can now login.');
        navigation.replace('Login');
      } else {
        setEmailError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setEmailError('Unable to connect to the server. Please check your connection.');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Reset step when user starts typing a new email
    if (step === 'reset') {
      setStep('email');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Image
            source={require('../assets/sports-car2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Forget Password</Text>

          {step === 'email' && (
            <>
              <Text style={styles.subtitle}>Enter your email to continue:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {isCheckingEmail && <Text style={styles.checking}>Checking email...</Text>}
              {emailError ? (
                <Text style={styles.error}>{emailError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.replace('Login')}
              >
                <Text style={styles.buttonText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'reset' && (
            <>
              <Text style={styles.subtitle}>
                Enter new password for {email}:
              </Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              {emailError ? (
                <Text style={styles.error}>{emailError}</Text>
              ) : null}

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleResetPassword}
              >
                <Text style={styles.buttonText}>Reset Password</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '60%',
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#aaa',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  checking: {
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});