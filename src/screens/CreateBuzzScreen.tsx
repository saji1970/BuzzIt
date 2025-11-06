import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser, Interest} from '../context/UserContext';
import {useFeatures} from '../context/FeatureContext';
import {useAuth} from '../context/AuthContext';
import ApiService from '../services/APIService';
import * as Location from 'expo-location';

type BuzzType = 'event' | 'gossip' | 'thought' | 'poll';

interface PollOption {
  id: string;
  text: string;
}

const CreateBuzzScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, addBuzz, interests} = useUser();
  const {features} = useFeatures();
  const {user: authUser} = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [buzzType, setBuzzType] = useState<BuzzType | null>(null);
  const [eventDate, setEventDate] = useState<string>('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    {id: '1', text: 'Yes'},
    {id: '2', text: 'No'},
    {id: '3', text: "Don't Know"},
  ]);
  const [media, setMedia] = useState<{type: 'image' | 'video' | null; url: string | null}>({
    type: null,
    url: null,
  });
  const [includeLocation, setIncludeLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number; city?: string; country?: string; address?: string; name?: string} | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  const handleMediaPicker = () => {
    Alert.alert(
      'Select Media',
      'Choose how you want to add media',
      [
        {text: 'Camera', onPress: () => openCamera()},
        {text: 'Gallery', onPress: () => openGallery()},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const openCamera = async () => {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos. Please enable it in Settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only images for camera on simulator
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setMedia({
          type: 'image',
          url: asset.uri || null,
        });
        Alert.alert('Success', 'Photo captured successfully!');
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      // Check if it's a simulator error
      if (error.message && error.message.includes('simulator')) {
        Alert.alert(
          'Camera Not Available',
          'Camera is not available on the simulator. Please use the gallery option or test on a real device.',
          [{text: 'OK'}]
        );
      } else {
        Alert.alert('Error', 'Failed to open camera. Please try the gallery option instead.');
      }
    }
  };

  const openGallery = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required to select media. Please enable it in Settings.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setMedia({
          type: asset.type?.startsWith('video') ? 'video' : 'image',
          url: asset.uri || null,
        });
        Alert.alert('Success', 'Media selected successfully!');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const toggleInterest = (interest: Interest) => {
    const isSelected = selectedInterests.some(i => i.id === interest.id);
    if (isSelected) {
      setSelectedInterests(selectedInterests.filter(i => i.id !== interest.id));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handlePollOptionChange = (id: string, text: string) => {
    setPollOptions(prev => prev.map(option => 
      option.id === id ? {...option, text} : option
    ));
  };

  const addPollOption = () => {
    const newId = (pollOptions.length + 1).toString();
    setPollOptions([...pollOptions, {id: newId, text: ''}]);
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter(option => option.id !== id));
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Check if location services are available
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert('Location Disabled', 'Please enable location services in your device settings');
        return;
      }

      // Request location permission
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to add location to your buzz');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Get reverse geocoding (city, country)
      let city = user?.city || 'Unknown';
      let country = user?.country || 'Unknown';
      let address = 'Current Location';
      
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (reverseGeocode && reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          city = addr.city || city;
          country = addr.country || country;
          // Build address string
          const addressParts = [
            addr.street,
            addr.city,
            addr.region,
            addr.country,
          ].filter(Boolean);
          address = addressParts.join(', ') || 'Current Location';
        }
      } catch (geocodeError) {
        console.log('Geocoding failed, using fallback:', geocodeError);
        // Continue with fallback values
      }

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city,
        country,
        address,
        name: 'Current Location',
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again or create buzz without location.');
    }
  };

  // Search for locations using OpenStreetMap Nominatim API
  const searchLocation = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setLocationSearchResults([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      // Use OpenStreetMap Nominatim API (free, no API key required)
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'BuzzIt-App', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error('Location search failed');
      }

      const data = await response.json();
      
      // Format results
      const formattedResults = data.map((item: any) => ({
        id: item.place_id,
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        city: item.address?.city || item.address?.town || item.address?.village || '',
        country: item.address?.country || '',
        address: item.display_name,
        type: item.type,
      }));

      setLocationSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Error', 'Failed to search locations. Please try again.');
      setLocationSearchResults([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Debounce location search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationSearchQuery.trim().length >= 3) {
        searchLocation(locationSearchQuery);
      } else {
        setLocationSearchResults([]);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [locationSearchQuery]);

  const handleSelectLocation = (location: any) => {
    setUserLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city || 'Unknown',
      country: location.country || 'Unknown',
      address: location.address,
      name: location.name,
    });
    setLocationSearchQuery('');
    setLocationSearchResults([]);
    setShowLocationSearch(false);
    setIncludeLocation(true);
  };

  const handleOpenLocationSearch = () => {
    setShowLocationSearch(true);
    if (!includeLocation) {
      setIncludeLocation(true);
    }
  };

  const handleCreateBuzz = () => {
    // Check if buzz creation is enabled
    if (!features.buzzCreation) {
      Alert.alert('Feature Disabled', 'Buzz creation is currently disabled by admin.');
      return;
    }

    if (!buzzType) {
      Alert.alert('Error', 'Please select a buzz type');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your buzz');
      return;
    }

    if (buzzType === 'event' && !eventDate.trim()) {
      Alert.alert('Error', 'Please enter an event date');
      return;
    }

    if (buzzType === 'poll') {
      const validOptions = pollOptions.filter(option => option.text.trim());
      if (validOptions.length < 2) {
        Alert.alert('Error', 'Please provide at least 2 poll options');
        return;
      }
    }

    if (selectedInterests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    // Check for user from either UserContext or AuthContext
    const currentUser = user || authUser;
    if (!currentUser) {
      Alert.alert('Error', 'Please login and create a profile first');
      return;
    }

    let buzzContent = content.trim();
    
    // Add event date if it's an event
    if (buzzType === 'event' && eventDate) {
      buzzContent += `\n\n📅 Event Date: ${eventDate}`;
    }
    
    // Add poll options if it's a poll
    if (buzzType === 'poll') {
      const validOptions = pollOptions.filter(option => option.text.trim());
      buzzContent += `\n\n📊 Poll Options:\n${validOptions.map((option, index) => `${index + 1}. ${option.text}`).join('\n')}`;
    }

    setIsCreating(true);

    const newBuzz = {
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar || null,
      content: buzzContent,
      media,
      interests: selectedInterests,
      location: includeLocation && userLocation ? userLocation : undefined,
      buzzType,
      eventDate: buzzType === 'event' ? eventDate : undefined,
      pollOptions: buzzType === 'poll' ? pollOptions.filter(option => option.text.trim()) : undefined,
      likes: 0,
      comments: 0,
      shares: 0,
    };

    // Save to backend first
    console.log('Creating buzz:', {
      userId: currentUser.id,
      username: currentUser.username,
      contentLength: buzzContent.length,
      buzzType,
      interestsCount: selectedInterests.length,
    });
    
    // Use addBuzz which handles API call and state management
    // This prevents duplicate API calls
    addBuzz({
      ...newBuzz,
      isLiked: false,
    }, false) // false = don't skip API call, let addBuzz handle it
      .then(() => {
        // Reset form
        setContent('');
        setSelectedInterests([]);
        setBuzzType(null);
        setEventDate('');
        setPollOptions([
          {id: '1', text: 'Yes'},
          {id: '2', text: 'No'},
          {id: '3', text: "Don't Know"},
        ]);
        setMedia({type: null, url: null});
        setIncludeLocation(false);
        setUserLocation(null);
        setLocationSearchQuery('');
        setLocationSearchResults([]);
        setShowLocationSearch(false);
        
        setIsCreating(false);
      })
      .catch((error: any) => {
        console.error('Error creating buzz:', error);
        setIsCreating(false);
        Alert.alert('Error', 'Failed to create buzz. Please try again.');
      });
  };

  const handleShareToSocial = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content first');
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Only share if we have a valid local file URI
        if (media.url && !media.url.startsWith('http')) {
          await Sharing.shareAsync(media.url);
          Alert.alert('Success', 'Content shared successfully!');
        } else {
          // For text or remote URLs, use clipboard or show info
          Alert.alert(
            'Share Info',
            'Copy to clipboard:\n\n' + content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            [
              {text: 'OK'}
            ]
          );
        }
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.log('Share error:', error);
      // Provide a fallback
      Alert.alert(
        'Share Your Buzz',
        'Buzz Content:\n\n' + content,
        [{text: 'OK'}]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>Create Buzz</Text>
        <Text style={styles.headerSubtitle}>What's on your mind?</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Buzz Type Selection */}
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            What type of buzz?
          </Text>
          <View style={styles.buzzTypeContainer}>
            {(['event', 'gossip', 'thought', 'poll'] as BuzzType[]).map((type, index) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.buzzTypeButton,
                  {
                    backgroundColor: buzzType === type ? theme.colors.primary : theme.colors.surface,
                    borderColor: buzzType === type ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setBuzzType(type)}>
                <Icon
                  name={
                    type === 'event' ? 'event' :
                    type === 'gossip' ? 'chat' :
                    type === 'thought' ? 'lightbulb' :
                    type === 'poll' ? 'poll' :
                    'send'
                  }
                  size={20}
                  color={buzzType === type ? '#FFFFFF' : theme.colors.text}
                />
                <Text
                  style={[
                    styles.buzzTypeText,
                    {color: buzzType === type ? '#FFFFFF' : theme.colors.text},
                  ]}>
                  {type === 'thought' ? 'Just a Thought' : 
                   type === 'poll' ? 'Poll' :
                   type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {buzzType === 'event' && (
            <Animatable.View animation="fadeIn" style={styles.eventDateContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Event Date (e.g., Dec 25, 2024 at 7 PM)"
                placeholderTextColor={theme.colors.textSecondary}
                value={eventDate}
                onChangeText={setEventDate}
              />
            </Animatable.View>
          )}

          {buzzType === 'poll' && (
            <Animatable.View animation="fadeIn" style={styles.pollOptionsContainer}>
              <Text style={[styles.pollLabel, {color: theme.colors.text}]}>
                Poll Options
              </Text>
              {pollOptions.map((option, index) => (
                <View key={option.id} style={styles.pollOptionRow}>
                  <TextInput
                    style={[
                      styles.pollOptionInput,
                      {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={option.text}
                    onChangeText={(text) => handlePollOptionChange(option.id, text)}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity
                      style={styles.removePollOptionButton}
                      onPress={() => removePollOption(option.id)}>
                      <Icon name="close" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={[styles.addPollOptionButton, {borderColor: theme.colors.primary}]}
                onPress={addPollOption}>
                <Icon name="add" size={16} color={theme.colors.primary} />
                <Text style={[styles.addPollOptionText, {color: theme.colors.primary}]}>
                  Add Option
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </Animatable.View>

        {/* Content Input */}
        <Animatable.View animation="fadeInUp" delay={50} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            What's buzzing?
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Share what's on your mind..."
            placeholderTextColor={theme.colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
          />
          <Text style={[styles.characterCount, {color: theme.colors.textSecondary}]}>
            {content.length}/500
          </Text>
        </Animatable.View>

        {/* Media Section */}
        <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Add Media
          </Text>
          <View style={styles.mediaSection}>
            <TouchableOpacity
              style={[styles.mediaButton, {backgroundColor: theme.colors.primary}]}
              onPress={handleMediaPicker}>
              <Icon name="add-a-photo" size={24} color="#FFFFFF" />
              <Text style={styles.mediaButtonText}>Add Photo/Video</Text>
            </TouchableOpacity>

            {media.url && (
              <Animatable.View animation="fadeIn" style={styles.mediaPreview}>
                <Image source={{uri: media.url}} style={styles.mediaImage} />
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => setMedia({type: null, url: null})}>
                  <Icon name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </Animatable.View>
            )}
          </View>
        </Animatable.View>

        {/* Location Section - Only show for events */}
        {buzzType === 'event' && (
          <Animatable.View animation="fadeInUp" delay={150} style={styles.section}>
            <View style={styles.locationRow}>
              <View style={styles.locationInfo}>
                <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                  Add Event Location
                </Text>
                <Text style={[styles.locationDescription, {color: theme.colors.textSecondary}]}>
                  Search and select a location for your event
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.locationToggle,
                  {
                    backgroundColor: includeLocation ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => {
                  if (!includeLocation) {
                    // Show location search instead of auto-getting current location
                    handleOpenLocationSearch();
                  } else {
                    setIncludeLocation(false);
                    setUserLocation(null);
                  }
                }}>
                <Icon 
                  name={includeLocation ? "my-location" : "location-off"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </View>

            {/* Location Search Input */}
            {includeLocation && (
              <View style={styles.locationSearchContainer}>
                <View style={[styles.locationSearchInputContainer, {backgroundColor: theme.colors.surface}]}>
                  <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
                  <TextInput
                    style={[styles.locationSearchInput, {color: theme.colors.text}]}
                    placeholder="Search for a location..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={locationSearchQuery}
                    onChangeText={setLocationSearchQuery}
                    onFocus={() => setShowLocationSearch(true)}
                  />
                  {isSearchingLocation && (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.searchLoader} />
                  )}
                </View>

                {/* Current Location Button */}
                <TouchableOpacity
                  style={[styles.currentLocationButton, {backgroundColor: theme.colors.surface}]}
                  onPress={getCurrentLocation}>
                  <Icon name="my-location" size={18} color={theme.colors.primary} />
                  <Text style={[styles.currentLocationText, {color: theme.colors.primary}]}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Selected Location Display */}
            {includeLocation && userLocation && (
              <View style={[styles.selectedLocationContainer, {backgroundColor: theme.colors.surface}]}>
                <Icon name="place" size={20} color={theme.colors.primary} />
                <View style={styles.selectedLocationTextContainer}>
                  <Text style={[styles.selectedLocationName, {color: theme.colors.text}]} numberOfLines={1}>
                    {userLocation.name || userLocation.address || `${userLocation.city}, ${userLocation.country}`}
                  </Text>
                  {(userLocation.city || userLocation.country) && (
                    <Text style={[styles.selectedLocationAddress, {color: theme.colors.textSecondary}]} numberOfLines={1}>
                      {userLocation.city}{userLocation.city && userLocation.country ? ', ' : ''}{userLocation.country}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setUserLocation(null);
                    setLocationSearchQuery('');
                    setShowLocationSearch(false);
                  }}>
                  <Icon name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Location Search Results Modal */}
            <Modal
              visible={showLocationSearch && locationSearchResults.length > 0}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowLocationSearch(false)}>
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, {backgroundColor: theme.colors.surface}]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
                      Select Location
                    </Text>
                    <TouchableOpacity onPress={() => setShowLocationSearch(false)}>
                      <Icon name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={locationSearchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={[styles.locationResultItem, {backgroundColor: theme.colors.background}]}
                        onPress={() => handleSelectLocation(item)}>
                        <Icon name="place" size={24} color={theme.colors.primary} />
                        <View style={styles.locationResultTextContainer}>
                          <Text style={[styles.locationResultName, {color: theme.colors.text}]} numberOfLines={2}>
                            {item.name}
                          </Text>
                          {item.city && (
                            <Text style={[styles.locationResultAddress, {color: theme.colors.textSecondary}]} numberOfLines={1}>
                              {item.city}{item.country ? `, ${item.country}` : ''}
                            </Text>
                          )}
                        </View>
                        <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      locationSearchQuery.length >= 3 && !isSearchingLocation ? (
                        <View style={styles.emptyResults}>
                          <Text style={[styles.emptyResultsText, {color: theme.colors.textSecondary}]}>
                            No locations found
                          </Text>
                        </View>
                      ) : null
                    }
                  />
                </View>
              </View>
            </Modal>
          </Animatable.View>
        )}

        {/* Interests Selection */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Select Interests
          </Text>
          <View style={styles.interestsGrid}>
            {interests.map((interest, index) => {
              const isSelected = selectedInterests.some(i => i.id === interest.id);
              return (
                <Animatable.View
                  key={interest.id}
                  animation="fadeInUp"
                  delay={300 + index * 50}>
                  <TouchableOpacity
                    style={[
                      styles.interestButton,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                    onPress={() => toggleInterest(interest)}>
                    <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                    <Text
                      style={[
                        styles.interestName,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : theme.colors.text,
                        },
                      ]}>
                      {interest.name}
                    </Text>
                    {isSelected && (
                      <Icon
                        name="check"
                        size={16}
                        color="#FFFFFF"
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                </Animatable.View>
              );
            })}
          </View>
        </Animatable.View>
      </ScrollView>

      {/* Action Buttons */}
      <Animatable.View
        animation="fadeInUp"
        delay={400}
        style={[styles.actionBar, {backgroundColor: theme.colors.surface}]}>
        <TouchableOpacity
          style={[styles.shareButton, {backgroundColor: theme.colors.accent}]}
          onPress={handleShareToSocial}>
          <Icon name="share" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share to Social</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createButton, {backgroundColor: theme.colors.primary}]}
          onPress={handleCreateBuzz}>
          <Icon name="trending-up" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Buzz</Text>
        </TouchableOpacity>
      </Animatable.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 5,
  },
  mediaSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buzzTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  buzzTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  buzzTypeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  eventDateContainer: {
    marginTop: 15,
  },
  pollOptionsContainer: {
    marginTop: 15,
  },
  pollLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pollOptionInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginRight: 8,
  },
  removePollOptionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPollOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
  },
  addPollOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flex: 1,
    marginRight: 16,
  },
  locationDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  locationToggle: {
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationSearchContainer: {
    marginTop: 12,
  },
  locationSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  locationSearchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchLoader: {
    marginLeft: 8,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 12,
  },
  selectedLocationTextContainer: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedLocationAddress: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  locationResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  locationResultTextContainer: {
    flex: 1,
  },
  locationResultName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationResultAddress: {
    fontSize: 14,
  },
  emptyResults: {
    padding: 40,
    alignItems: 'center',
  },
  emptyResultsText: {
    fontSize: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  mediaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mediaPreview: {
    marginLeft: 15,
    position: 'relative',
  },
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  interestEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  interestName: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CreateBuzzScreen;
