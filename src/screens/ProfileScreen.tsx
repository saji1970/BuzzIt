import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser, User, Interest} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, setUser, interests, updateUserInterests} = useUser();
  const {logout} = useAuth();
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    displayName: '',
    email: '',
    bio: '',
    city: '',
    country: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        city: user.city || '',
        country: user.country || '',
      });
      setSelectedInterests(user.interests);
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (!editForm.username.trim() || !editForm.displayName.trim()) {
      Alert.alert('Error', 'Username and display name are required');
      return;
    }

    if (selectedInterests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    const updatedUser: User = {
      ...user!,
      username: editForm.username.trim(),
      displayName: editForm.displayName.trim(),
      email: editForm.email.trim(),
      bio: editForm.bio.trim(),
      city: editForm.city.trim(),
      country: editForm.country.trim(),
      interests: selectedInterests,
    };

    setUser(updatedUser);
    updateUserInterests(selectedInterests);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
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

  const renderProfileForm = () => (
    <Animatable.View animation="fadeInUp" style={styles.formContainer}>
      <Text style={[styles.formTitle, {color: theme.colors.text}]}>
        Edit Profile
      </Text>

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

  const renderProfileView = () => (
    <Animatable.View animation="fadeInUp" style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
          {user?.avatar ? (
            <Image source={{uri: user.avatar}} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {user?.username.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={[styles.displayName, {color: theme.colors.text}]}>
          {user?.displayName}
        </Text>
        <Text style={[styles.username, {color: theme.colors.textSecondary}]}>
          @{user?.username}
        </Text>
        {user?.bio && (
          <Text style={[styles.bio, {color: theme.colors.text}]}>
            {user.bio}
          </Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, {color: theme.colors.primary}]}>
            {user?.buzzCount || 0}
          </Text>
          <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
            Buzzes
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, {color: theme.colors.primary}]}>
            {user?.followers || 0}
          </Text>
          <Text style={[styles.statLabel, {color: theme.colors.textSecondary}]}>
            Followers
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, {color: theme.colors.primary}]}>
            {user?.following || 0}
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
          {user?.interests.map((interest, index) => (
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
    </Animatable.View>
  );

  if (!user) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
          <Text style={styles.headerTitle}>Create Profile</Text>
          <Text style={styles.headerSubtitle}>Let's get you started!</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          {renderProfileForm()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}>
            <Icon name="logout" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}>
            <Icon
              name={isEditing ? 'close' : 'edit'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isEditing ? renderProfileForm() : renderProfileView()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default ProfileScreen;
