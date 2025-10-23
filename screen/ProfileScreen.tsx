import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../navigation/authContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PersonalInfo: undefined;
  Language: undefined;
  savedLocation: undefined; // ✅ Added savedLocation to the param list
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const ProfileScreen: React.FC = () => {
  const { user, logout, token, updateUser } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [uploading, setUploading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoadingImage(true);

      const userData = await getCurrentUser();
      if (userData) {
        await updateUser(userData);
      } else {
        if (user?.id && !user?.image) {
          await refreshUserImage();
        }
      }
    } catch (error) {

    } finally {
      setLoadingImage(false);
    }
  };


  const getCurrentUser = async () => {
    try {
      const API_URL = `http://192.168.1.57:5291/api/Users/me`;
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 404 || response.status === 405) {
        return null;
      }
      
      if (!response.ok) {
        return null;
      }

      const responseText = await response.text();

      if (!responseText || responseText.trim() === '') {
        return null;
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        return null;
      }

      if (result.success && result.user) {
        return result.user;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };


  const getUserImage = async (userId: number) => {
    try {
      const API_URL = `http://192.168.1.57:5291/api/Users/${userId}/image`;
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }

      const responseText = await response.text();

      if (!responseText || responseText.trim() === '') {
        return null;
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        return null;
      }

      if (result.success && result.image) {
        return result.image;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };


  const refreshUserImage = async () => {
    if (!user?.id) {
      return;
    }
    
    try {
      setLoadingImage(true);
      const imageData = await getUserImage(user.id);
      if (imageData) {
        await updateUser({ image: imageData });
        Alert.alert('Success', 'Image refreshed successfully');
      }
    } catch (error) {

    } finally {
      setLoadingImage(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              const response = await fetch(`http://192.168.1.57:5291/api/Users/${user?.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const result = await response.json();

              if (response.ok && result.success) {
                Alert.alert('Success', 'Your account has been deleted successfully.');
                await logout();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete account.');
              }
            } catch (error) {
              Alert.alert('Error', 'Unable to connect to the server. Please check your connection.');
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const uploadImage = async (imageAsset: any) => {
    if (!imageAsset.base64) {
      Alert.alert('Error', 'Failed to get image data. Please try again.');
      return;
    }

    try {
      setUploading(true);
      
      // Create base64 data URL
      const base64Image = `data:image/jpeg;base64,${imageAsset.base64}`;
      
      const response = await fetch(`http://192.168.1.57:5291/api/Users/${user?.id}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: base64Image
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update local state with the new image
        await updateUser({ 
          image: result.user.image,
          email: result.user.email
        });
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile picture.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update profile picture. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    if (uploading) {
      Alert.alert('Please Wait', 'Image upload in progress...');
      return;
    }

    Alert.alert(
      'Update Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: pickImage,
        },
        {
          text: 'Refresh Image',
          onPress: refreshUserImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const userName = user?.name || 'User Name';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topSpacing} />
        
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={showImageOptions} disabled={uploading || loadingImage}>
                <View style={styles.imageWrapper}>
                  {user?.image ? (
                    <Image 
                      source={{ uri: user.image }} 
                      style={styles.profileImage}
                      onError={() => {}}
                      onLoad={() => {}}
                    />
                  ) : (
                    <View style={styles.profileIcon}>
                      <Ionicons name="person" size={40} color="#6366F1" />
                    </View>
                  )}
                  {(uploading || loadingImage) && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  )}
                  <View style={styles.cameraIcon}>
                    <Ionicons name="camera-outline" size={16} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.name}>{userName}</Text>
              {uploading && (
                <Text style={styles.statusText}>
                  Uploading...
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PersonalInfo')}
          >
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Personal info</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Safety</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Language')}
          >
            <Ionicons name="globe-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Language</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.savedPlacesSection}>
          <Text style={styles.sectionTitle}>Saved places</Text>
          <TouchableOpacity 
            style={styles.enterLocationButton}
            onPress={() => navigation.navigate('savedLocation')} // ✅ Added navigation
          >
            <Text style={styles.enterLocationText}>Enter home location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountActionsSection}>
          <TouchableOpacity 
            style={[styles.logoutButton, (uploading || loadingImage) && styles.buttonDisabled]} 
            onPress={handleLogout}
            disabled={uploading || loadingImage}
          >
            <Ionicons name="log-out-outline" size={24} color="#6366F1" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.deleteAccountButton, (uploading || loadingImage) && styles.buttonDisabled]}
            onPress={handleDeleteAccount}
            disabled={uploading || loadingImage}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  topSpacing: {
    height: 20,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfo: {
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  divider: {
    height: 8,
    backgroundColor: '#f8f8f8',
    marginVertical: 20,
  },
  savedPlacesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  enterLocationButton: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  enterLocationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  accountActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#6366F1',
    marginLeft: 15,
    fontWeight: '500',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  deleteAccountText: {
    flex: 1,
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 15,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ProfileScreen;