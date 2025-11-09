import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';

import {useTheme} from '../context/ThemeContext';
import {useUser, User, Interest, Buzz} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import ApiService from '../services/APIService';
import BuzzCard from '../components/BuzzCard';
import {FlatList} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
  Permission,
  openSettings,
} from 'react-native-permissions';

const ProfileScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, setUser, interests, updateUserInterests, buzzes, likeBuzz, shareBuzz} = useUser();
  const {logout, user: authUser, isAuthenticated} = useAuth();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showMyBuzzes, setShowMyBuzzes] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    displayName: '',
    email: '',
    bio: '',
    city: '',
    country: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = user || authUser;
    if (currentUser) {
      setEditForm({
        username: currentUser.username || '',
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        city: currentUser.city || '',
        country: currentUser.country || '',
      });
      setSelectedInterests(currentUser.interests || []);
      setAvatarUri(currentUser.avatar || null);
    }
  }, [user, authUser]);

  // Refresh form data when entering edit mode
  useEffect(() => {
    const currentUser = user || authUser;
    if (isEditing && currentUser) {
      setEditForm({
        username: currentUser.username || '',
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        city: currentUser.city || '',
        country: currentUser.country || '',
      });
      setSelectedInterests(currentUser.interests || []);
      setAvatarUri(currentUser.avatar || null);
    }
  }, [isEditing, user, authUser]);

  const handleSaveProfile = async () => {
    if (!editForm.username.trim() || !editForm.displayName.trim()) {
      Alert.alert('Error', 'Username and display name are required');
      return;
    }

    if (selectedInterests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    if (!avatarUri) {
      Alert.alert('Add Profile Photo', 'Please add a profile photo or avatar before saving your profile.');
      return;
    }

    try {
      const currentUser = user || authUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }

      // Update profile on backend
      const response = await ApiService.updateUser(currentUser.id, {
        displayName: editForm.displayName.trim(),
        email: editForm.email.trim(),
        bio: editForm.bio.trim(),
        city: editForm.city.trim(),
        country: editForm.country.trim(),
        interests: selectedInterests,
        avatar: avatarUri,
      });

      if (response.success && response.data) {
        const updatedUser: User = {
          ...currentUser,
          ...response.data,
          interests: selectedInterests,
          avatar: avatarUri,
        };

        setUser(updatedUser);
        updateUserInterests(selectedInterests);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        // Backend update failed, still save locally
        const updatedUser: User = {
          ...currentUser,
          username: editForm.username.trim(),
          displayName: editForm.displayName.trim(),
          email: editForm.email.trim(),
          bio: editForm.bio.trim(),
          city: editForm.city.trim(),
          country: editForm.country.trim(),
          interests: selectedInterests,
          avatar: avatarUri,
        };

        setUser(updatedUser);
        updateUserInterests(selectedInterests);
        setIsEditing(false);
        Alert.alert(
          'Partial Success',
          'Profile updated locally, but failed to sync with server. Some changes may not be visible to other users.'
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout from AuthContext to clear auth state
              await logout();
              // Clear user from UserContext
            setUser(null);
              // Navigate to login screen and reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{name: 'Login' as never}],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleInterest = (interest: Interest) => {
    const isSelected = selectedInterests.some(i => i.id === interest.id);
    if (isSelected) {
      setSelectedInterests(selectedInterests.filter(i => i.id !== interest.id));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const ensureAvatarPermission = async (): Promise<boolean> => {
    const permission: Permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : Platform.Version >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    try {
      const currentStatus = await check(permission);
      if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
        return true;
      }

      if (currentStatus === RESULTS.BLOCKED) {
        Alert.alert(
          'Media Permission Needed',
          'Please enable photo library access in Settings to change your profile picture.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings().catch(() => {})},
          ],
        );
        return false;
      }

      const result = await request(permission);
      return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
    } catch (error) {
      console.error('Profile avatar permission error:', error);
      Alert.alert('Permission Error', 'Unable to request photo library permission.');
      return false;
    }
  };

  const handleSelectAvatar = async () => {
    const granted = await ensureAvatarPermission();
    if (!granted) {
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      includeBase64: false,
      quality: 0.8,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      console.error('Profile avatar picker error:', result.errorMessage);
      Alert.alert('Error', result.errorMessage || 'Failed to open gallery. Please try again.');
      return;
    }

    const asset = result.assets?.[0];
    if (!asset || !asset.uri) {
      Alert.alert('Error', 'No image selected. Please try again.');
      return;
    }

    setAvatarUri(asset.uri);
  };

  const clearAvatarSelection = () => {
    setAvatarUri(null);
  };

  const renderProfileForm = () => (
    <Animatable.View animation="fadeInUp" style={styles.formContainer}>
      <Text style={[styles.formTitle, {color: theme.colors.text}]}>
        Edit Profile
      </Text>

      <View style={styles.avatarEditSection}>
        <TouchableOpacity
          style={[styles.avatarEditPicker, {borderColor: theme.colors.border, backgroundColor: theme.colors.surface}]}
          onPress={handleSelectAvatar}
        >
          {avatarUri ? (
            <Image source={{uri: avatarUri}} style={styles.avatarEditPreview} />
          ) : (
            <View style={styles.avatarEditPlaceholder}>
              <Icon name="add-a-photo" size={28} color={theme.colors.textSecondary} />
            </View>
          )}
          <View style={styles.avatarEditTextContainer}>
            <Text style={[styles.avatarEditTitle, {color: theme.colors.text}]}>Tap to {avatarUri ? 'change' : 'add'} profile photo</Text>
            <Text style={[styles.avatarEditSubtitle, {color: theme.colors.textSecondary}]}>Required · square images recommended</Text>
          </View>
        </TouchableOpacity>
        {avatarUri && (
          <TouchableOpacity style={styles.avatarEditRemoveButton} onPress={clearAvatarSelection}>
            <Icon name="delete" size={18} color={theme.colors.error || '#FF5252'} />
            <Text style={[styles.avatarEditRemoveText, {color: theme.colors.error || '#FF5252'}]}>Remove photo</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
          Username
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
          value={editForm.username}
          onChangeText={text => setEditForm({...editForm, username: text})}
          placeholder="Enter username"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
          Display Name
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
          value={editForm.displayName}
          onChangeText={text => setEditForm({...editForm, displayName: text})}
          placeholder="Enter display name"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
          Email
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
          value={editForm.email}
          onChangeText={text => setEditForm({...editForm, email: text})}
          placeholder="Enter email"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
          Bio
        </Text>
        <TextInput
          style={[
            styles.textInput,
            styles.bioInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          value={editForm.bio}
          onChangeText={text => setEditForm({...editForm, bio: text})}
          placeholder="Tell us about yourself..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={150}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
          City
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
          value={editForm.city}
          onChangeText={text => setEditForm({...editForm, city: text})}
          placeholder="Enter your city"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
          Country
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
          value={editForm.country}
          onChangeText={text => setEditForm({...editForm, country: text})}
          placeholder="Enter your country"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, {color: theme.colors.text}]}>
          Your Interests
        </Text>
        <View style={styles.interestsGrid}>
          {interests.map((interest, index) => {
            const isSelected = selectedInterests.some(i => i.id === interest.id);
            return (
              <Animatable.View
                key={interest.id}
                animation="fadeInUp"
                delay={index * 50}>
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
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.cancelButton, {backgroundColor: theme.colors.border}]}
          onPress={() => setIsEditing(false)}>
          <Text style={[styles.cancelButtonText, {color: theme.colors.text}]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, {backgroundColor: theme.colors.primary}]}
          onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  // Get the current user from UserContext or AuthContext
  const currentUser = user || authUser;

  const renderProfileView = () => {
    if (!currentUser) return null;
    
    return (
    <Animatable.View animation="fadeInUp" style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
          {currentUser?.avatar ? (
            <Image source={{uri: currentUser.avatar}} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {currentUser?.username.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={[styles.displayName, {color: theme.colors.text}]}>
          {currentUser?.displayName}
        </Text>
        <Text style={[styles.username, {color: theme.colors.textSecondary}]}>
          @{currentUser?.username}
        </Text>
        {currentUser?.bio && (
          <Text style={[styles.bio, {color: theme.colors.text}]}>
            {currentUser.bio}
          </Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, {color: theme.colors.primary}]}>
            {currentUser?.buzzCount || 0}
          </Text>
          <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
            Buzzes
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, {color: theme.colors.primary}]}>
            {currentUser?.followers || 0}
          </Text>
          <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
            Followers
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, {color: theme.colors.primary}]}>
            {currentUser?.following || 0}
          </Text>
          <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
            Following
          </Text>
        </View>
      </View>

      <View style={styles.interestsSection}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          My Interests
        </Text>
        <View style={styles.interestsList}>
          {currentUser?.interests.map((interest, index) => (
            <Animatable.View
              key={interest.id}
              animation="fadeInUp"
              delay={index * 100}>
              <View
                style={[
                  styles.interestTag,
                  {backgroundColor: theme.colors.primary + '20'},
                ]}>
                <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                <Text style={[styles.interestName, {color: theme.colors.primary}]}>
                  {interest.name}
                </Text>
              </View>
            </Animatable.View>
          ))}
        </View>
      </View>

      <View style={styles.myBuzzesSection}>
        <TouchableOpacity
          style={styles.myBuzzesHeader}
          onPress={() => setShowMyBuzzes(!showMyBuzzes)}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            My Buzzes ({buzzes.filter(b => b.userId === currentUser?.id).length})
          </Text>
          <Icon
            name={showMyBuzzes ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        {showMyBuzzes && (
          <View style={styles.myBuzzesList}>
            {buzzes.filter(b => b.userId === currentUser?.id).length === 0 ? (
              <View style={styles.emptyBuzzes}>
                <Icon name="article" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyBuzzesText, {color: theme.colors.textSecondary}]}>
                  You haven't created any buzzes yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={buzzes.filter(b => b.userId === currentUser?.id).sort((a, b) => {
                  const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
                  const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
                  return dateB.getTime() - dateA.getTime();
                })}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <BuzzCard
                    buzz={item}
                    onLike={() => likeBuzz(item.id)}
                    onShare={() => shareBuzz(item.id)}
                    onPress={() => {}}
                  />
                )}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </View>
    </Animatable.View>
    );
  };

  // If no user and not authenticated, show message to create profile first
  if (!currentUser || !isAuthenticated) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Please login or create a profile</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, minHeight: 400}}>
            <Icon name="person" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.sectionTitle, {color: theme.colors.text, marginTop: 20, textAlign: 'center'}]}>
              No Profile Found
            </Text>
            <Text style={[styles.sectionSubtitle, {color: theme.colors.textSecondary, marginTop: 10, textAlign: 'center'}]}>
              Please login or create a profile to view and edit your profile information.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScreenContainer
      title="Profile"
      subtitle={currentUser?.displayName || currentUser?.username || 'Your profile'}
      onBackPress={() => navigation.goBack()}
      rightAction={
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={() => {
            if (isEditing) {
              handleSaveProfile();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Text style={styles.headerActionText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      }
      onScrollDownPress={() => scrollViewRef.current?.scrollToEnd({animated: true})}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? renderProfileForm() : renderProfileView()}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  headerActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  headerActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 8,
    marginRight: 8,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 36,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  interestsSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
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
  checkIcon: {
    marginLeft: 4,
  },
  formActions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  myBuzzesSection: {
    marginTop: 20,
  },
  myBuzzesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  myBuzzesList: {
    marginTop: 10,
  },
  emptyBuzzes: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyBuzzesText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  avatarEditSection: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  avatarEditPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'flex-start',
    padding: 14,
    marginBottom: 12,
  },
  avatarEditPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarEditPlaceholder: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 36,
  },
  avatarEditTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  avatarEditTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  avatarEditSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  avatarEditRemoveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  avatarEditRemoveText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ProfileScreen;
