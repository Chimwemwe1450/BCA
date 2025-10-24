import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview'; 
import { useNavigation } from '@react-navigation/native';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBVClcUZEYhtso1Ld3w9jH7XkhG8xnYHuQ';

const SavedLocation: React.FC = () => {
  const navigation = useNavigation();
  const webViewRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -25.746, lng: 28.2293 });
  const [zoom, setZoom] = useState(14);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Generate Embed API URL
  const getEmbedMapUrl = () => {
    if (selectedLocation) {
      return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${selectedLocation.latitude},${selectedLocation.longitude}&zoom=${zoom}&maptype=roadmap`;
    }
    return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${mapCenter.lat},${mapCenter.lng}&zoom=${zoom}&maptype=roadmap`;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          overflow: hidden;
        }
        iframe { 
          width: 100%; 
          height: 100%; 
          border: none;
        }
        .map-container {
          position: relative;
          height: 100vh;
          width: 100%;
        }
        .click-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="map-container">
        <iframe
          id="embedMap"
          src="${getEmbedMapUrl()}"
          allowfullscreen>
        </iframe>
        <div class="click-overlay" onclick="handleMapClick()"></div>
      </div>
      
      <script>
        function handleMapClick() {
          // Since Embed API doesn't support click events directly,
          // we'll just notify the app that user wants to interact
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'map_click'
          }));
        }
        
        // Update iframe source when needed
        function updateMapSource(newSrc) {
          document.getElementById('embedMap').src = newSrc;
        }
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'map_click') {
        Alert.alert(
          'Select Location',
          'Use the search bar above to find and select locations. The Embed API supports viewing but limited interaction.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    setLoading(true);
    try {
      // Use Geocoding API to get coordinates
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.results && geocodeData.results.length > 0) {
        const result = geocodeData.results[0];
        const location = result.geometry.location;
        
        const newLocation = {
          name: result.formatted_address,
          latitude: location.lat,
          longitude: location.lng,
        };

        setSelectedLocation(newLocation);
        setMapCenter({ lat: location.lat, lng: location.lng });
        setSuggestions([]);

        // Update the WebView with new map
        if (webViewRef.current) {
          const newMapUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${location.lat},${location.lng}&zoom=16&maptype=roadmap`;
          // @ts-ignore
          webViewRef.current.injectJavaScript(`
            updateMapSource("${newMapUrl}");
            true;
          `);
        }
      } else {
        Alert.alert('Error', 'Location not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search location');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 1, 20);
    setZoom(newZoom);
    updateMapView();
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 1, 1);
    setZoom(newZoom);
    updateMapView();
  };

  const updateMapView = () => {
    if (webViewRef.current) {
      const newMapUrl = selectedLocation 
        ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${selectedLocation.latitude},${selectedLocation.longitude}&zoom=${zoom}&maptype=roadmap`
        : `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${mapCenter.lat},${mapCenter.lng}&zoom=${zoom}&maptype=roadmap`;
      
      // @ts-ignore
      webViewRef.current.injectJavaScript(`
        updateMapSource("${newMapUrl}");
        true;
      `);
    }
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location first');
      return;
    }

    Alert.alert(
      'Confirm Location',
      `Save "${selectedLocation.name}" as your location?`,
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

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4285F4" />
              <Text style={styles.loadingText}>Loading Map...</Text>
            </View>
          )}
        />

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchOverlay}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>🔍</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {selectedLocation && (
        <View style={styles.selectedLocationBar}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedTitle}>Selected Location</Text>
            <Text style={styles.selectedAddress} numberOfLines={2}>
              📍 {selectedLocation.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4285F4',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  zoomButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  zoomButtonText: {
    fontSize: 24,
    color: '#4285F4',
    fontWeight: 'bold',
  },
  searchOverlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    marginHorizontal: 16,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  searchButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedLocationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'space-between',
  },
  selectedInfo: {
    flex: 1,
    marginRight: 12,
  },
  selectedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  selectedAddress: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SavedLocation;