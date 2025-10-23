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
  const { user, token, updateUser } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handlePhoneChange = (text: string) => {
    // Ensure phone always starts with +27
    if (!text.startsWith('+27')) {
      setPhone('+27');
    } else {
      setPhone(text);
    }
  };

  const handleSave = async (field: string) => {
    if (field === 'name' && !name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (field === 'phone') {
      if (!phone.trim()) {
        Alert.alert('Error', 'Phone number is required');
        return;
      }
      // Validate phone number format
      const phoneRegex = /^\+27[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        Alert.alert('Error', 'Please enter a valid South African phone number (e.g., +27123456789)');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Update user data via API
      const response = await fetch(`http://192.168.1.57:5291/api/Users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local state
        await updateUser({ 
          name: name.trim(),
          phone: phone.trim(),
        });
        
        setEditingField(null);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values from user context
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEditingField(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      

      <View style={styles.topHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
                  onPress={() => setEditingField('name')}
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
                  onChangeText={setName}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleCancel}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <View style={styles.buttonSpacer} />
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={() => handleSave('name')}
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
                  onPress={() => setEditingField('phone')}
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
                  onChangeText={handlePhoneChange}
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
                    onPress={handleCancel}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <View style={styles.buttonSpacer} />
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={() => handleSave('phone')}
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