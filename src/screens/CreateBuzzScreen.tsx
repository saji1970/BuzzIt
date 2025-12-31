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
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import {launchCamera, launchImageLibrary, Asset} from 'react-native-image-picker';
import Geolocation, {GeoPosition} from 'react-native-geolocation-service';
import {
  check,
  request,
  openSettings,
  RESULTS,
  PERMISSIONS,
  Permission,
} from 'react-native-permissions';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {useTheme} from '../context/ThemeContext';
import {useUser, Interest} from '../context/UserContext';
import {useFeatures} from '../context/FeatureContext';
import {useAuth} from '../context/AuthContext';
import ApiService from '../services/APIService';
import SocialMediaService, {SocialPlatform, PublishResult} from '../services/SocialMediaService';
import ScreenContainer from '../components/ScreenContainer';
import BuzzitButton from '../components/BuzzitButton';
import SocialPlatformSelector from '../components/SocialPlatformSelector';

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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const bottomOffset = Platform.select({
    ios: insets.bottom + 48,
    android: insets.bottom + 96,
    default: insets.bottom + 64,
  });
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
  const [media, setMedia] = useState<{
    type: 'image' | 'video';
    url: string;
    mimeType: string;
    fileName: string;
  } | null>(null);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number; city?: string; country?: string; address?: string; name?: string} | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialPlatform[]>([]);
  const [publishingResults, setPublishingResults] = useState<PublishResult[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  type PermissionResolution = 'retry' | 'settings' | 'cancel';

  const promptPermissionResolution = async (
    title: string,
    message: string,
    allowRetry: boolean,
  ): Promise<PermissionResolution> =>
    new Promise(resolve => {
      const buttons: Array<{text: string; onPress?: () => void; style?: 'cancel' | 'destructive' | 'default'}> = [
        {
          text: 'Open Settings',
          onPress: () => {
            openSettings().catch(() => {});
            resolve('settings');
          },
        },
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => resolve('cancel'),
        },
      ];

      if (allowRetry) {
        buttons.unshift({text: 'Try Again', onPress: () => resolve('retry')});
      }

      Alert.alert(title, message, buttons, {cancelable: true});
    });

  const requestPermissionWithPrompt = async (
    permission: Permission,
    title: string,
    message: string,
  ): Promise<boolean> => {
    try {
      let attempts = 0;
      while (attempts < 3) {
        const status = await check(permission);

        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
          return true;
        }

        if (status === RESULTS.BLOCKED) {
          await promptPermissionResolution(
            title,
            `${message}\n\nPlease enable this permission in your device settings.`,
            false,
          );
          return false;
        }

        const result = await request(permission);

        if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
          return true;
        }

        if (result === RESULTS.BLOCKED) {
          await promptPermissionResolution(
            title,
            `${message}\n\nPlease enable this permission in your device settings.`,
            false,
          );
          return false;
        }

        const decision = await promptPermissionResolution(title, message, true);

        if (decision === 'retry') {
          attempts += 1;
          continue;
        }

        return false;
      }

      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      await promptPermissionResolution(title, message, true);
      return false;
    }
  };

  const ensureCameraPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    return requestPermissionWithPrompt(
      permission,
      'Camera Permission Required',
      'Camera access is required to capture photos.',
    );
  };

  const ensureMicrophonePermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    return requestPermissionWithPrompt(
      permission,
      'Microphone Permission Required',
      'Microphone access is required to record videos with audio.',
    );
  };

  const ensurePhotoLibraryPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : Platform.Version >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    const baseGranted = await requestPermissionWithPrompt(
      permission,
      'Media Library Permission Required',
      'Media library access is required to select photos or videos.',
    );

    if (!baseGranted) {
      return false;
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const videoGranted = await requestPermissionWithPrompt(
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        'Media Library Permission Required',
        'Media library access is required to select photos or videos.',
      );

      if (!videoGranted) {
        return false;
      }
    }

    return true;
  };

  const ensureLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    return requestPermissionWithPrompt(
      permission,
      'Location Permission Required',
      'Location access is required to add your current location.',
    );
  };

  const applySelectedAsset = (asset?: Asset | null) => {
    if (!asset || !asset.uri) {
      Alert.alert('Error', 'No media selected. Please try again.');
      return;
    }

    const inferredMimeType = asset.type ||
      (asset.fileName?.toLowerCase().endsWith('.mp4') ? 'video/mp4' : undefined) ||
      (asset.fileName?.toLowerCase().endsWith('.mov') ? 'video/quicktime' : undefined) ||
      (asset.fileName?.toLowerCase().endsWith('.png') ? 'image/png' : undefined) ||
      (asset.fileName?.toLowerCase().endsWith('.jpg') || asset.fileName?.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' : undefined) ||
      'image/jpeg';

    const isVideo = inferredMimeType.startsWith('video/');
    const extension = asset.fileName?.split('.').pop()?.toLowerCase()
      || (isVideo ? inferredMimeType.split('/')[1] || 'mp4' : inferredMimeType.split('/')[1] || 'jpg');
    const safeFileName = asset.fileName && asset.fileName.includes('.')
      ? asset.fileName
      : `buzz-${Date.now()}.${extension}`;

    setMedia({
      type: isVideo ? 'video' : 'image',
      url: asset.uri,
      mimeType: inferredMimeType,
      fileName: safeFileName,
    });
  };

  const handleMediaPicker = () => {
    Alert.alert(
      'Select Media',
      'Choose how you want to add media',
      [
        {text: 'Take Photo', onPress: () => openCamera('photo')},
        {text: 'Record Video', onPress: () => openCamera('video')},
        {text: 'Gallery', onPress: () => openGallery()},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const openCamera = async (mediaType: 'photo' | 'video' = 'photo') => {
    try {
      const granted = await ensureCameraPermission();
      if (!granted) {
        return;
      }

      // For video, also check microphone permission
      if (mediaType === 'video') {
        const micGranted = await ensureMicrophonePermission();
        if (!micGranted) {
          return;
        }
      }

      // Build camera options based on media type
      const cameraOptions: any = {
        mediaType: mediaType === 'video' ? 'video' : 'photo',
        includeBase64: false,
        cameraType: 'back',
        saveToPhotos: true,
        quality: 0.8,
      };

      // Set durationLimit based on media type
      // For photos, set to 0 to prevent native module errors when reading the value
      // For video, set to 300 seconds (5 minutes max)
      if (mediaType === 'video') {
        cameraOptions.videoQuality = 'high';
        cameraOptions.durationLimit = 300; // 5 minutes max
      } else {
        cameraOptions.durationLimit = 0; // Explicitly set to 0 for photos
      }

      const result = await launchCamera(cameraOptions);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        console.error('Camera error:', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Failed to open camera. Please try again.');
        return;
      }

      const asset = result.assets?.[0];
      if (asset) {
        applySelectedAsset(asset);
        console.log('Media captured:', {
          type: asset.type,
          uri: asset.uri,
          duration: asset.duration,
          fileSize: asset.fileSize,
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open the camera. Please try again or use the gallery option.');
    }
  };

  const openGallery = async () => {
    try {
      const granted = await ensurePhotoLibraryPermission();
      if (!granted) {
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'mixed',
        selectionLimit: 1,
        includeBase64: false,
        quality: 0.8,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        console.error('Gallery error:', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Failed to open gallery. Please try again.');
        return;
      }

      const asset = result.assets?.[0];
      applySelectedAsset(asset);
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
      const granted = await ensureLocationPermission();
      if (!granted) {
        return;
      }

      if (Platform.OS === 'ios') {
        await Geolocation.requestAuthorization('whenInUse');
      }

      const position: GeoPosition = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        });
      });

      const {latitude, longitude} = position.coords;
      let city = user?.city || '';
      let country = user?.country || '';
      let address = '';
      let name = 'Current Location';

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'BuzzIt-App',
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const addr = data.address || {};
          city = addr.city || addr.town || addr.village || city;
          country = addr.country || country;
          address = data.display_name || address;
          name = data.name || addr.road || name;
        }
      } catch (geoError) {
        console.warn('Reverse geocoding failed, using fallback values:', geoError);
      }

      setUserLocation({
        latitude,
        longitude,
        city: city || undefined,
        country: country || undefined,
        address: address || undefined,
        name,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error',
        'Failed to get current location. Please try again or create buzz without location.',
      );
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

  const handleCreateBuzz = async () => {
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

    let uploadedMedia: { type: 'image' | 'video'; url: string } | null = null;
    const localMediaUri = media?.url || null;

    if (media?.url) {
      try {
        const uploadResponse = await ApiService.uploadMedia({
          uri: media.url,
          type: media.mimeType,
          name: media.fileName,
        });

        if (uploadResponse.success && uploadResponse.data?.url) {
          uploadedMedia = {
            type: media.type,
            url: uploadResponse.data.url,
          };
        } else {
          setIsCreating(false);
          Alert.alert('Upload Failed', uploadResponse.error || 'Unable to upload media. Please try again.');
          return;
        }
      } catch (uploadError) {
        console.error('Media upload error:', uploadError);
        setIsCreating(false);
        Alert.alert('Upload Failed', 'Unable to upload media. Please check your connection and try again.');
        return;
      }
    }

    const newBuzz = {
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar || null,
      content: buzzContent,
      media: uploadedMedia,
      localMediaUri,
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
      .then(async (createdBuzz) => {
        // Publish to selected social platforms if any
        if (selectedPlatforms.length > 0) {
          const mediaUrl = uploadedMedia?.url;
          const mediaType = uploadedMedia?.type;
          if (mediaUrl) {
            await publishToSocialPlatforms(buzzContent, mediaUrl, mediaType);
          } else {
            // Text-only post
            await publishToSocialPlatforms(buzzContent);
          }
        }

        // Show success notification
        Alert.alert('Success', 'Buzz has been created!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form after user acknowledges
              setContent('');
              setSelectedInterests([]);
              setBuzzType(null);
              setEventDate('');
              setPollOptions([
                {id: '1', text: 'Yes'},
                {id: '2', text: 'No'},
                {id: '3', text: "Don't Know"},
              ]);
              setMedia(null);
              setIncludeLocation(false);
              setUserLocation(null);
              setLocationSearchQuery('');
              setLocationSearchResults([]);
              setShowLocationSearch(false);
              setSelectedPlatforms([]);
              setPublishingResults([]);
              setIsCreating(false);
            }
          }
        ]);
      })
      .catch((error: any) => {
        console.error('Error creating buzz:', error);
        setIsCreating(false);
        Alert.alert('Error', 'Failed to create buzz. Please try again.');
      });
  };

  const publishToSocialPlatforms = async (
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video'
  ) => {
    if (selectedPlatforms.length === 0) return;

    setIsPublishing(true);
    setPublishingResults([]);

    try {
      const results = await SocialMediaService.publishToPlatforms({
        content,
        mediaUrl,
        mediaType,
        platforms: selectedPlatforms,
      });

      setPublishingResults(results);

      // Show results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0 && failCount === 0) {
        Alert.alert(
          'Success',
          `Buzz published to ${successCount} platform${successCount > 1 ? 's' : ''}!`
        );
      } else if (successCount > 0 && failCount > 0) {
        const failedPlatforms = results
          .filter(r => !r.success)
          .map(r => r.platform)
          .join(', ');
        Alert.alert(
          'Partial Success',
          `Published to ${successCount} platform${successCount > 1 ? 's' : ''}. Failed: ${failedPlatforms}`
        );
      } else {
        const errors = results
          .filter(r => !r.success)
          .map(r => `${r.platform}: ${r.error}`)
          .join('\n');
        Alert.alert('Publishing Failed', `Failed to publish to all platforms:\n${errors}`);
      }
    } catch (error: any) {
      console.error('Error publishing to social platforms:', error);
      Alert.alert('Error', 'Failed to publish to social platforms. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Load connected platforms on mount
  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  const loadConnectedPlatforms = async () => {
    try {
      const accounts = await SocialMediaService.getConnectedAccounts();
      const connected = accounts
        .filter(acc => acc.isConnected && acc.status === 'connected')
        .map(acc => acc.platform);
      setConnectedPlatforms(connected);
    } catch (error) {
      console.error('Error loading connected platforms:', error);
    }
  };

  const togglePlatform = (platform: SocialPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      if (!connectedPlatforms.includes(platform)) {
        Alert.alert(
          'Not Connected',
          `Please connect ${platform.charAt(0).toUpperCase() + platform.slice(1)} in Settings first.`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Go to Settings',
              onPress: () => {
                navigation.navigate('Settings' as never);
              },
            },
          ]
        );
        return;
      }
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleShareToSocial = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content first');
      return;
    }

    try {
      const shareLines = [content.trim()];
      if (media?.url && media.url.startsWith('http')) {
        shareLines.push(media.url);
      }

      const result = await Share.share({
        message: shareLines.filter(Boolean).join('\n\n'),
        url: media?.url && media.url.startsWith('file://') ? media.url : undefined,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Content shared successfully!');
      }
    } catch (error) {
      console.log('Share error:', error);
      Alert.alert('Error', 'Unable to open sharing options. Please try again later.');
    }
  };

  return (
    <ScreenContainer
      title="Create"
      subtitle="Share a new buzz"
      onBackPress={() => navigation.goBack()}
      contentStyle={{paddingHorizontal: 0}}
    >
      <KeyboardAvoidingView
        style={[styles.container, {backgroundColor: 'transparent'}]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 220 + (bottomOffset || 0)}}
        >
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
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Add Media</Text>
            <View style={styles.mediaSection}>
              <BuzzitButton
                label="Add Photo/Video"
                icon="add-a-photo"
                onPress={handleMediaPicker}
                style={styles.mediaButtonWrapper}
              />

              {media && (
                <Animatable.View animation="fadeIn" style={styles.mediaPreview}>
                  {media.type === 'image' ? (
                    <Image source={{uri: media.url}} style={styles.mediaImage} />
                  ) : (
                    <View style={[styles.mediaImage, styles.mediaVideoPlaceholder]}>
                      <Icon name="videocam" size={48} color="#FFFFFF" />
                      <View style={styles.videoPlayButton}>
                        <Icon name="play-arrow" size={32} color="#FFFFFF" />
                      </View>
                      <Text style={styles.videoLabel}>Video Selected</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => setMedia(null)}>
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

          {/* Social Platform Selection */}
          <Animatable.View animation="fadeInUp" delay={240} style={styles.section}>
            <SocialPlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformsChange={setSelectedPlatforms}
              mediaType={media?.type}
              contentLength={content.length}
            />
            {isPublishing && (
              <View style={styles.publishingIndicator}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.publishingText, {color: theme.colors.textSecondary}]}>
                  Publishing to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}...
                </Text>
              </View>
            )}
            {publishingResults.length > 0 && (
              <View style={styles.publishingResults}>
                {publishingResults.map(result => (
                  <View key={result.platform} style={styles.publishingResultItem}>
                    <Icon
                      name={result.success ? 'check-circle' : 'error'}
                      size={16}
                      color={result.success ? theme.colors.primary : theme.colors.error}
                    />
                    <Text
                      style={[
                        styles.publishingResultText,
                        {
                          color: result.success ? theme.colors.primary : theme.colors.error,
                        },
                      ]}>
                      {result.platform}: {result.success ? 'Published' : result.error}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Animatable.View>

          {/* Share Out Section */}
          <Animatable.View animation="fadeInUp" delay={280} style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Share Beyond Buzzit</Text>
            <Text style={[styles.sectionSubtitle, {color: theme.colors.textSecondary}]}>Instantly send this buzz to other apps while you create.</Text>
            <BuzzitButton
              label="Share to Social"
              icon="share"
              variant="secondary"
              onPress={handleShareToSocial}
              style={styles.shareButtonInline}
            />
          </Animatable.View>
        </ScrollView>

        {/* Action Buttons */}
        <Animatable.View
          animation="fadeInUp"
          delay={400}
          style={[
            styles.actionBar,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom + 16,
              marginBottom: Math.max((bottomOffset || 0) - 32, 24),
            },
          ]}>
          <BuzzitButton
            label="Create Buzz"
            icon="trending-up"
            onPress={handleCreateBuzz}
            style={styles.fullWidthAction}
          />
        </Animatable.View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
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
    gap: 16,
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
  mediaButtonWrapper: {
    alignSelf: 'flex-start',
  },
  shareButtonInline: {
    width: '100%',
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
  mediaVideoPlaceholder: {
    backgroundColor: 'rgba(47,123,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlayButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  videoLabel: {
    position: 'absolute',
    bottom: 8,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    marginTop: 12,
    marginBottom: 12,
  },
  fullWidthAction: {
    width: '100%',
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  platformButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  platformNotConnected: {
    fontSize: 10,
    marginLeft: 4,
  },
  publishingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  publishingText: {
    fontSize: 14,
  },
  publishingResults: {
    marginTop: 12,
    gap: 8,
  },
  publishingResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  publishingResultText: {
    fontSize: 12,
  },
});

export default CreateBuzzScreen;
