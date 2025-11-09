import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Geolocation, {GeoPosition} from 'react-native-geolocation-service';

import {useTheme} from '../context/ThemeContext';
import {useUser} from '../context/UserContext';

const LocationSettingsScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, updateLocationSettings} = useUser();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [priority, setPriority] = useState<'location' | 'interests' | 'mixed'>('mixed');
  const [radius, setRadius] = useState(10);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    if (user?.locationSettings) {
      setLocationEnabled(user.locationSettings.enabled);
      setPriority(user.locationSettings.priority);
      setRadius(user.locationSettings.radius);
    }
  }, [user]);

  const requestLocationPermission = async () => {
    try {
      if (locationPermission) {
        return true;
      }

      if (Platform.OS === 'ios') {
        const status = await Geolocation.requestAuthorization('whenInUse');
        if (status === 'granted' || status === 'whenInUse') {
          setLocationPermission(true);
          return true;
        }

        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby buzzes. Please enable it in your device settings.'
        );
        return false;
      }

      const androidStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Buzz it Location Permission',
          message: 'Location permission is required to show nearby buzzes.',
          buttonPositive: 'Allow',
        }
      );

      if (androidStatus === PermissionsAndroid.RESULTS.GRANTED) {
        setLocationPermission(true);
        return true;
      }

      Alert.alert(
        'Permission Denied',
        'Location permission is required to show nearby buzzes. Please enable it in your device settings.'
      );
      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return;
      }

      Geolocation.getCurrentPosition(
        (location: GeoPosition) => {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          Alert.alert('Error', 'Failed to get current location');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleSaveSettings = () => {
    if (locationEnabled && !currentLocation) {
      Alert.alert('Location Required', 'Please get your current location first');
      return;
    }

    updateLocationSettings({
      enabled: locationEnabled,
      priority,
      radius,
    });

    Alert.alert('Success', 'Location settings saved successfully!');
  };

  const PriorityButton = ({value, label, icon}: {value: 'location' | 'interests' | 'mixed', label: string, icon: string}) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        {
          backgroundColor: priority === value ? theme.colors.primary : theme.colors.surface,
          borderColor: priority === value ? theme.colors.primary : theme.colors.border,
        },
      ]}
      onPress={() => setPriority(value)}>
      <Icon 
        name={icon} 
        size={20} 
        color={priority === value ? '#FFFFFF' : theme.colors.text} 
      />
      <Text
        style={[
          styles.priorityButtonText,
          {color: priority === value ? '#FFFFFF' : theme.colors.text},
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>Location Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your buzz feed</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Permission */}
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, {color: theme.colors.text}]}>
                Enable Location
              </Text>
              <Text style={[styles.settingDescription, {color: theme.colors.textSecondary}]}>
                Show buzzes from your area first
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{false: theme.colors.border, true: theme.colors.primary}}
              thumbColor={locationEnabled ? '#FFFFFF' : theme.colors.textSecondary}
            />
          </View>
        </Animatable.View>

        {/* Get Current Location */}
        {locationEnabled && (
          <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
            <TouchableOpacity
              style={[styles.locationButton, {backgroundColor: theme.colors.primary}]}
              onPress={getCurrentLocation}>
              <Icon name="my-location" size={20} color="#FFFFFF" />
              <Text style={styles.locationButtonText}>
                {currentLocation ? 'Location Updated' : 'Get Current Location'}
              </Text>
            </TouchableOpacity>
            {currentLocation && (
              <Text style={[styles.locationText, {color: theme.colors.textSecondary}]}>
                Lat: {currentLocation.latitude.toFixed(4)}, Lng: {currentLocation.longitude.toFixed(4)}
              </Text>
            )}
          </Animatable.View>
        )}

        {/* Priority Settings */}
        {locationEnabled && (
          <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Feed Priority
            </Text>
            <Text style={[styles.sectionDescription, {color: theme.colors.textSecondary}]}>
              Choose how to prioritize buzzes in your feed
            </Text>
            
            <View style={styles.priorityContainer}>
              <PriorityButton
                value="location"
                label="Location First"
                icon="place"
              />
              <PriorityButton
                value="interests"
                label="Interests First"
                icon="favorite"
              />
              <PriorityButton
                value="mixed"
                label="Mixed"
                icon="blend"
              />
            </View>
          </Animatable.View>
        )}

        {/* Radius Settings */}
        {locationEnabled && (
          <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Search Radius
            </Text>
            <Text style={[styles.sectionDescription, {color: theme.colors.textSecondary}]}>
              How far to search for nearby buzzes
            </Text>
            
            <View style={styles.radiusContainer}>
              <Text style={[styles.radiusLabel, {color: theme.colors.text}]}>
                {radius} km
              </Text>
              <View style={styles.radiusButtons}>
                {[1, 5, 10, 25, 50].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.radiusButton,
                      {
                        backgroundColor: radius === value ? theme.colors.primary : theme.colors.surface,
                        borderColor: radius === value ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setRadius(value)}>
                    <Text
                      style={[
                        styles.radiusButtonText,
                        {color: radius === value ? '#FFFFFF' : theme.colors.text},
                      ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animatable.View>
        )}

        {/* Save Button */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <TouchableOpacity
            style={[styles.saveButton, {backgroundColor: theme.colors.primary}]}
            onPress={handleSaveSettings}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    minWidth: 120,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  radiusContainer: {
    alignItems: 'center',
  },
  radiusLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  radiusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationSettingsScreen;
