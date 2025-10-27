import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useTheme} from '../context/ThemeContext';
import {useUser, Interest} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';

const CreateProfileScreen: React.FC = () => {
  const {theme} = useTheme();
  const {interests, updateUserInterests, setUser} = useUser();
  const {sendVerificationCode, verifyCode, register, isLoading} = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [buzzProfileName, setBuzzProfileName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);

  const handleInterestToggle = (interest: Interest) => {
    if (selectedInterests.some(i => i.id === interest.id)) {
      setSelectedInterests(selectedInterests.filter(i => i.id !== interest.id));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSendVerificationCode = async () => {
    // Basic mobile number validation
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter a mobile number');
      return;
    }
    if (!mobileRegex.test(mobileNumber.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    const result = await sendVerificationCode(mobileNumber.trim(), username.trim());
    
    if (result.success) {
      Alert.alert(
        'Verification Code Sent',
        `A verification code has been sent to ${mobileNumber}.\n\n${result.message}`,
        [{text: 'OK', onPress: () => setIsVerifying(true)}]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to send verification code');
    }
  };

  const handleVerifyAndCreate = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    // Validate profile details
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!buzzProfileName.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }
    if (selectedInterests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    // For demo purposes, we'll use a mock verification ID
    // In a real app, this would come from the sendVerificationCode response
    const verificationId = 'demo-verification-id';
    
    const result = await verifyCode(mobileNumber.trim(), verificationCode.trim(), verificationId);
    
    if (result.success) {
      // User is now authenticated and profile is created
      Alert.alert('Success', 'Profile created and verified successfully! 🎉');
    } else {
      Alert.alert('Verification Failed', result.error || 'Invalid verification code');
    }
  };

  const handleCreateProfile = () => {
    if (!isVerifying) {
      handleSendVerificationCode();
    } else {
      handleVerifyAndCreate();
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
        <Text style={styles.headerTitle}>Create Profile</Text>
        <Text style={styles.headerSubtitle}>Set up your buzz profile</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Username */}
        <Animatable.View animation="fadeInUp" delay={100}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Username</Text>
          <View style={[styles.inputContainer, {backgroundColor: theme.colors.surface}]}>
            <Icon name="person" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Enter username"
              placeholderTextColor={theme.colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
        </Animatable.View>

        {/* Password */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Password</Text>
          <View style={[styles.inputContainer, {backgroundColor: theme.colors.surface}]}>
            <Icon name="lock" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Enter password"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </Animatable.View>

        {/* Confirm Password */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Confirm Password</Text>
          <View style={[styles.inputContainer, {backgroundColor: theme.colors.surface}]}>
            <Icon name="lock-outline" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Confirm password"
              placeholderTextColor={theme.colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </Animatable.View>

        {/* Mobile Number */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Mobile Number</Text>
          <View style={[styles.inputContainer, {backgroundColor: theme.colors.surface}]}>
            <Icon name="phone" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Enter mobile number"
              placeholderTextColor={theme.colors.textSecondary}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
          </View>
        </Animatable.View>

        {/* Verification Code (only show when isVerifying is true) */}
        {isVerifying && (
          <Animatable.View animation="fadeInUp" delay={450}>
            <Text style={[styles.label, {color: theme.colors.text}]}>Verification Code</Text>
            <View style={[styles.inputContainer, {backgroundColor: theme.colors.surface}]}>
              <Icon name="lock" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, {color: theme.colors.text}]}
                placeholder="Enter verification code"
                placeholderTextColor={theme.colors.textSecondary}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </Animatable.View>
        )}

        {/* Buzz Profile Name */}
        <Animatable.View animation="fadeInUp" delay={500}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Buzz Profile Name</Text>
          <View style={[styles.inputContainer, {backgroundColor: theme.colors.surface}]}>
            <Icon name="badge" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Enter your profile name"
              placeholderTextColor={theme.colors.textSecondary}
              value={buzzProfileName}
              onChangeText={setBuzzProfileName}
            />
          </View>
        </Animatable.View>

        {/* Interests */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Select Interests</Text>
          <Text style={[styles.subLabel, {color: theme.colors.textSecondary}]}>
            Choose your interests to customize your feed
          </Text>
          
          <View style={styles.interestsGrid}>
            {interests.map((interest, index) => {
              const isSelected = selectedInterests.some(i => i.id === interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  onPress={() => handleInterestToggle(interest)}
                  style={[
                    styles.interestCard,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    },
                  ]}>
                  <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                  <Text
                    style={[
                      styles.interestName,
                      {color: isSelected ? '#FFFFFF' : theme.colors.text},
                    ]}>
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animatable.View>

        {/* Create Profile Button */}
        <Animatable.View animation="fadeInUp" delay={700}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateProfile}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.createButtonGradient}>
              <Icon name={isVerifying ? "check-circle" : "send"} size={24} color="#FFFFFF" />
              <Text style={styles.createButtonText}>
                {isVerifying ? 'Verify & Create Profile' : 'Send Verification Code'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 20,
  },
  interestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
  },
  interestEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  interestName: {
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    marginTop: 20,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default CreateProfileScreen;
