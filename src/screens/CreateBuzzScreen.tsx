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

const CreateBuzzScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, addBuzz, interests} = useUser();
  const [content, setContent] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [media, setMedia] = useState<{type: 'image' | 'video' | null; url: string | null}>({
    type: null,
    url: null,
  });

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
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setMedia({
          type: asset.type === 'video' ? 'video' : 'image',
          url: asset.uri || null,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required to select media');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setMedia({
          type: asset.type === 'video' ? 'video' : 'image',
          url: asset.uri || null,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
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

  const handleCreateBuzz = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your buzz');
      return;
    }

    if (selectedInterests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please create a profile first');
      return;
    }

    const newBuzz = {
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content: content.trim(),
      media,
      interests: selectedInterests,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
    };

    addBuzz(newBuzz);
    
    // Reset form
    setContent('');
    setSelectedInterests([]);
    setMedia({type: null, url: null});
    
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
        {/* Content Input */}
        <Animatable.View animation="fadeInUp" style={styles.section}>
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
