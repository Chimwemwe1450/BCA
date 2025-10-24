import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../navigation/authContext';
import { useNavigation } from '@react-navigation/native';

const PersonalInfoScreen: React.FC = () => {
  console.log('🚀 PersonalInfoScreen component rendering');
  
  const { user, token, updateUser } = useAuth();
  console.log('🔑 Auth context:', { 
    userExists: !!user,
    userId: user?.id,
    userName: user?.name,
    userPhone: user?.phone,
    tokenExists: !!token,
    tokenLength: token?.length
  });
  
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  console.log('⏳ Loading state:', loading);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  
  console.log('📝 Form state:', { name, phone, editingField });

  // Load user data when component mounts
  useEffect(() => {
    console.log('🔄 useEffect triggered - loading user data');
    if (user) {
      console.log('👤 User data found:', { 
        name: user.name, 
        phone: user.phone 
      });
      setName(user.name || '');
      setPhone(user.phone || '');
      console.log('✅ State updated with user data');
    } else {
      console.log('❌ No user data found in context');
    }
  }, [user]);

  const handlePhoneChange = (text: string) => {
    console.log('📞 handlePhoneChange called with text:', text);
    // Ensure phone always starts with +27
    if (!text.startsWith('+27')) {
      console.log('🔄 Phone does not start with +27, setting to +27');
      setPhone('+27');
    } else {
      console.log('✅ Setting phone to:', text);
      setPhone(text);
    }
  };

  const handleSave = async (field: string) => {
    console.log('💾 handleSave CALLED for field:', field);
    console.log('📋 Current values - name:', `"${name}"`, 'phone:', `"${phone}"`);
    
    if (field === 'name' && !name.trim()) {
      console.log('❌ Validation failed: Name is required');
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (field === 'phone') {
      console.log('🔍 Validating phone field...');
      if (!phone.trim()) {
        console.log('❌ Validation failed: Phone number is required');
        Alert.alert('Error', 'Phone number is required');
        return;
      }
      // Validate phone number format
      const phoneRegex = /^\+27[0-9]{9}$/;
      const isValidPhone = phoneRegex.test(phone);
      console.log('📞 Phone regex test:', isValidPhone, 'for phone:', phone);
      console.log('📞 Phone length:', phone.length);
      console.log('📞 Phone starts with +27:', phone.startsWith('+27'));
      
      if (!isValidPhone) {
        console.log('❌ Validation failed: Phone format invalid');
        Alert.alert('Error', 'Please enter a valid South African phone number (e.g., +27123456789)');
        return;
      }
      console.log('✅ Phone validation passed');
    }

    // Add pre-flight checks
    console.log('🔍 Pre-flight checks:');
    console.log('👤 User ID:', user?.id);
    console.log('🔑 Token exists:', !!token);
    
    if (!user?.id) {
      console.log('❌ Pre-flight failed: No user ID');
      Alert.alert('Error', 'User information is missing');
      return;
    }
    
    if (!token) {
      console.log('❌ Pre-flight failed: No token');
      Alert.alert('Error', 'Authentication token is missing');
      return;
    }

    console.log('✅ All pre-flight checks passed');
    
    try {
      console.log('🔄 Starting API call to update user');
      setLoading(true);
      console.log('⏳ Loading state set to true');
      
      // FIX: Use proper field names that match backend (PascalCase)
      const requestBody: any = {};
      
      if (field === 'name') {
        requestBody.Name = name.trim();
        console.log('📤 Adding Name to request:', name.trim());
      }
      
      if (field === 'phone') {
        requestBody.Phone = phone.trim();
        console.log('📤 Adding Phone to request:', phone.trim());
      }
      
      console.log('📦 Final request body:', JSON.stringify(requestBody, null, 2));
      
      const apiUrl = `http://192.168.1.57:5291/api/Users/${user.id}`;
      console.log('🌐 Making PUT request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 API Response status:', response.status);
      console.log('✅ API Response ok:', response.ok);
      
      // Get the raw response text first
      const responseText = await response.text();
      console.log('📄 API Response raw text:', responseText);
      console.log('📄 API Response text length:', responseText.length);
      console.log('📄 API Response first 200 chars:', responseText.substring(0, 200));
      
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
        console.log('📄 API Response parsed result:', result);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError);
   
      }

      if (response.ok) {
        // Check if result has success property or if we should consider 200 status as success
        if (result.success || response.status === 200) {
          console.log('🎉 API call successful, updating local state');
          // Update local state
          await updateUser({ 
            name: name.trim(),
            phone: phone.trim(),
          });
          
          console.log('🔄 Resetting editing field');
          setEditingField(null);
          console.log('✅ Showing success alert');
          Alert.alert('Success', 'Profile updated successfully');
        } else {
          console.log('❌ API returned 200 but success is false');
          const errorMessage = result.error || result.message || 'Profile update failed';
          Alert.alert('Error', errorMessage);
        }
      } else {
        console.log('❌ API call failed with status:', response.status);
        
        // Handle different error cases
        let errorMessage = 'Failed to update profile';
        
        if (response.status === 400) {
          errorMessage = 'Bad request - please check your input data';
          if (result.error) errorMessage = result.error;
          if (result.message) errorMessage = result.message;
          if (result.errors) errorMessage = JSON.stringify(result.errors);
          if (result.rawResponse && result.rawResponse.includes('validation')) {
            errorMessage = 'Data validation failed - please check your input';
          }
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed - please login again';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to update this profile';
        } else if (response.status === 404) {
          errorMessage = 'User not found';
        } else if (response.status === 500) {
          errorMessage = 'Server error - please try again later';
        }
        
        console.log('📊 Final error message:', errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.log('💥 API call network error:', error);
  
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      console.log('🏁 API call completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ handleCancel called');
    console.log('📊 Original user data:', { 
      name: user?.name, 
      phone: user?.phone 
    });
    // Reset to original values from user context
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEditingField(null);
    console.log('🔄 State reset completed');
  };

  console.log('🎨 Rendering UI components');
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            console.log('⬅️ Back button pressed');
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Personal Information</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
       
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Name</Text>
              {editingField !== 'name' && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    console.log('✏️ Edit name button pressed');
                    setEditingField('name');
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#6366F1" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {editingField === 'name' ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(text) => {
                    console.log('📝 Name input changed to:', text);
                    setName(text);
                  }}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => {
                      console.log('❌ Name cancel button pressed');
                      handleCancel();
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <View style={styles.buttonSpacer} />
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={() => {
                      console.log('💾 Name save button pressed');
                      console.log('📊 Save button state:', {
                        loading,
                        nameEmpty: !name.trim(),
                        disabled: loading || !name.trim()
                      });
                      handleSave('name');
                    }}
                    disabled={loading || !name.trim()}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.displayText}>{name || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>Phone</Text>
              {editingField !== 'phone' && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => {
                    console.log('✏️ Edit phone button pressed');
                    setEditingField('phone');
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#6366F1" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {editingField === 'phone' ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={(text) => {
                    console.log('📝 Phone input changed to:', text);
                    handlePhoneChange(text);
                  }}
                  placeholder="+27XXXXXXXXX"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoFocus
                  maxLength={12}
                />
                <Text style={styles.phoneHint}>
                  South African number (e.g., +27123456789)
                </Text>
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => {
                      console.log('❌ Phone cancel button pressed');
                      handleCancel();
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <View style={styles.buttonSpacer} />
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={() => {
                      console.log('💾 Phone save button pressed');
                      console.log('📊 Save button state:', {
                        loading,
                        phoneEmpty: !phone.trim(),
                        disabled: loading || !phone.trim()
                      });
                      handleSave('phone');
                    }}
                    disabled={loading || !phone.trim()}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.displayText}>{phone || 'Not provided'}</Text>
            )}
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
          <Text style={styles.noteText}>
            You can edit your name and phone number. Changes will be reflected across the app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 35, 
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  topHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingTop: 30,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 4,
  },
  displayText: {
    fontSize: 16,
    color: '#666',
    paddingVertical: 8,
  },
  editContainer: {
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  phoneHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    marginLeft: 5,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonSpacer: {
    width: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    margin: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 12,
  },
});

export default PersonalInfoScreen;