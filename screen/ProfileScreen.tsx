import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../navigation/authContext';

const ProfileScreen: React.FC = () => {
  const { user, logout, token } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    Alert.alert('Logged Out', 'You have been logged out successfully.');
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
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Unable to connect to the server.');
            }
          },
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
            <Image 
              source={{ uri: 'https://via.placeholder.com/80' }} 
              style={styles.profileImage}
            />
            <View style={styles.profileText}>
              <Text style={styles.name}>{userName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Personal info</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Safety</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="globe-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Language</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

 
        <View style={styles.divider} />

       
        <View style={styles.savedPlacesSection}>
          <Text style={styles.sectionTitle}>Saved places</Text>
          <TouchableOpacity style={styles.enterLocationButton}>
            <Text style={styles.enterLocationText}>Enter home location</Text>
          </TouchableOpacity>
        </View>

      
        <View style={styles.accountActionsSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#6366F1" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  profileText: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
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
});

export default ProfileScreen;