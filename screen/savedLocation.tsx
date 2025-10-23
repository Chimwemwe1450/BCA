import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SavedLocation: React.FC = () => {
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    // Mock suggestions - replace with real API call
    const mockSuggestions = [
      `${searchQuery} - Main Street`,
      `${searchQuery} - Downtown`,
      `${searchQuery} - City Center`,
      `${searchQuery} - Residential Area`,
    ];
    
    setSuggestions(mockSuggestions);
  };

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setSearchQuery(location);
    setSuggestions([]);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location first');
      return;
    }

    Alert.alert(
      'Confirm Location',
      `Save "${selectedLocation}" as your location?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: () => {
            console.log('Location saved:', selectedLocation);
            Alert.alert('Success', 'Location saved successfully!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Save Location</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Search Results</Text>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectLocation(suggestion)}
              >
                <Text style={styles.suggestionText}>📍 {suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedLocation ? (
          <View style={styles.selectedLocationContainer}>
            <Text style={styles.selectedTitle}>Selected Location</Text>
            <Text style={styles.selectedAddress}>📍 {selectedLocation}</Text>
            <Text style={styles.instructions}>
              This location will be saved for quick access in the future.
            </Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>🗺️</Text>
            <Text style={styles.placeholderText}>
              Search for your location above to get started
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            !selectedLocation && styles.confirmButtonDisabled
          ]} 
          onPress={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>
            Confirm Location
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLocationContainer: {
    padding: 16,
    margin: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  selectedAddress: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SavedLocation;