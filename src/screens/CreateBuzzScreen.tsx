import React, {useState} from 'react';
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
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser, Interest} from '../context/UserContext';
import {useFeatures} from '../context/FeatureContext';
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
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number; city?: string; country?: string} | null>(null);

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
        timeout: 10000,
        maximumAge: 60000,
      });

      // Get reverse geocoding (city, country)
      let city = user?.city || 'Unknown';
      let country = user?.country || 'Unknown';
      
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (reverseGeocode && reverseGeocode.length > 0) {
          city = reverseGeocode[0].city || city;
          country = reverseGeocode[0].country || country;
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
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again or create buzz without location.');
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

    if (!user) {
      Alert.alert('Error', 'Please create a profile first');
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

    const newBuzz = {
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
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
      isLiked: false,
    };

    addBuzz(newBuzz);
    
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
    
    Alert.alert('Success', 'Your buzz has been created!');
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

        {/* Location Section */}
        <Animatable.View animation="fadeInUp" delay={150} style={styles.section}>
          <View style={styles.locationRow}>
            <View style={styles.locationInfo}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Add Location
              </Text>
              <Text style={[styles.locationDescription, {color: theme.colors.textSecondary}]}>
                Include your current location with this buzz
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
                  getCurrentLocation();
                }
                setIncludeLocation(!includeLocation);
              }}>
              <Icon 
                name={includeLocation ? "my-location" : "location-off"} 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
          {includeLocation && userLocation && (
            <View style={[styles.locationInfo, {backgroundColor: theme.colors.surface, padding: 12, borderRadius: 8, marginTop: 8}]}>
              <Text style={[styles.locationText, {color: theme.colors.text}]}>
                📍 {userLocation.city}, {userLocation.country}
              </Text>
            </View>
          )}
        </Animatable.View>

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
