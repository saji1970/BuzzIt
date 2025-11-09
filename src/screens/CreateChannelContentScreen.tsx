import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary, launchCamera, MediaType} from 'react-native-image-picker';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useBuzzChannel, BuzzChannelContent} from '../context/BuzzChannelContext';
import {useUser} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';

const CreateChannelContentScreen: React.FC = () => {
  const {theme} = useTheme();
  const {addChannelContent} = useBuzzChannel();
  const {user} = useUser();
  const {user: authUser} = useAuth();
  
  const [contentType, setContentType] = useState<BuzzChannelContent['type']>('music_video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState<{
    type: 'video' | 'audio' | 'image';
    url: string;
    thumbnail?: string;
    duration?: number;
    fileSize?: number;
  } | null>(null);
  const [targetAudience, setTargetAudience] = useState({
    geographic: {
      countries: [] as string[],
      states: [] as string[],
      cities: [] as string[],
    },
    demographic: {
      ageRange: {min: 18, max: 65},
      interests: [] as string[],
      education: [] as string[],
      occupation: [] as string[],
    },
    university: {
      name: '',
      department: [] as string[],
      year: [] as string[],
    },
  });
  const [visibility, setVisibility] = useState<'public' | 'targeted' | 'private'>('public');

  const contentTypes = [
    {id: 'music_video', name: 'Music Video', emoji: '🎵', color: '#FF6B6B'},
    {id: 'movie', name: 'Movie', emoji: '🎬', color: '#4ECDC4'},
    {id: 'song', name: 'Song', emoji: '🎶', color: '#45B7D1'},
    {id: 'event_teaser', name: 'Event Teaser', emoji: '🎪', color: '#96CEB4'},
    {id: 'voice_snippet', name: 'Voice Snippet', emoji: '🎤', color: '#FFEAA7'},
    {id: 'announcement', name: 'Announcement', emoji: '📢', color: '#DDA0DD'},
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'South Korea', 'India', 'Brazil', 'Mexico', 'Spain',
    'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
    'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand'
  ];

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

  const openCamera = () => {
    const options = {
      mediaType: contentType === 'voice_snippet' ? 'audio' as MediaType : 'mixed' as MediaType,
      quality: 0.8,
    };
    launchCamera(options, response => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setMedia({
          type: asset.type?.startsWith('video') ? 'video' : 'audio',
          url: asset.uri || '',
          duration: asset.duration,
          fileSize: asset.fileSize,
        });
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: contentType === 'voice_snippet' ? 'audio' as MediaType : 'mixed' as MediaType,
      quality: 0.8,
    };
    launchImageLibrary(options, response => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setMedia({
          type: asset.type?.startsWith('video') ? 'video' : 'audio',
          url: asset.uri || '',
          duration: asset.duration,
          fileSize: asset.fileSize,
        });
      }
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleCountry = (country: string) => {
    const currentCountries = targetAudience.geographic.countries;
    if (currentCountries.includes(country)) {
      setTargetAudience({
        ...targetAudience,
        geographic: {
          ...targetAudience.geographic,
          countries: currentCountries.filter(c => c !== country),
        },
      });
    } else {
      setTargetAudience({
        ...targetAudience,
        geographic: {
          ...targetAudience.geographic,
          countries: [...currentCountries, country],
        },
      });
    }
  };

  const handleCreateContent = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your content');
      return;
    }

    if (!media) {
      Alert.alert('Error', 'Please add media to your content');
      return;
    }

    // Check both user contexts
    const currentUser = user || authUser;
    if (!currentUser) {
      Alert.alert('Error', 'Please login and create a profile first');
      return;
    }

    const newContent: Omit<BuzzChannelContent, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar || null,
      title: title.trim(),
      description: description.trim(),
      type: contentType,
      media,
      category: contentType === 'announcement' ? 'government' : 'entertainment',
      tags,
      targetAudience,
      engagement: {
        likes: 0,
        votes: 0,
        views: 0,
        shares: 0,
        comments: 0,
        isLiked: false,
      },
      analytics: {
        demographics: {
          ageGroups: {},
          locations: {},
          interests: {},
        },
        engagement: {
          peakHours: [],
          averageWatchTime: 0,
          completionRate: 0,
        },
      },
      visibility,
      status: 'published',
    };

    addChannelContent(newContent);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setMedia(null);
    setTargetAudience({
      geographic: {countries: [], states: [], cities: []},
      demographic: {ageRange: {min: 18, max: 65}, interests: [], education: [], occupation: []},
      university: {name: '', department: [], year: []},
    });
    setVisibility('public');
    
    Alert.alert('Success', 'Your content has been published to Buzz Channel!');
  };

  const renderContentTypeSelector = () => (
    <Animatable.View animation="fadeInUp" style={styles.section}>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Content Type
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {contentTypes.map((type, index) => (
          <Animatable.View
            key={type.id}
            animation="fadeInRight"
            delay={index * 100}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: contentType === type.id ? type.color : theme.colors.surface,
                  borderColor: contentType === type.id ? type.color : theme.colors.border,
                },
              ]}
              onPress={() => setContentType(type.id as BuzzChannelContent['type'])}>
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
              <Text
                style={[
                  styles.typeName,
                  {
                    color: contentType === type.id ? '#FFFFFF' : theme.colors.text,
                  },
                ]}>
                {type.name}
              </Text>
              {contentType === type.id && (
                <Icon
                  name="check"
                  size={12}
                  color="#FFFFFF"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </ScrollView>
    </Animatable.View>
  );

  const renderMediaSection = () => (
    <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Add Media
      </Text>
      <View style={styles.mediaSection}>
        <TouchableOpacity
          style={[styles.mediaButton, {backgroundColor: theme.colors.primary}]}
          onPress={handleMediaPicker}>
          <Icon name="add-a-photo" size={24} color="#FFFFFF" />
          <Text style={styles.mediaButtonText}>
            Add {contentType === 'voice_snippet' ? 'Audio' : 'Media'}
          </Text>
        </TouchableOpacity>

        {media && (
          <Animatable.View animation="fadeIn" style={styles.mediaPreview}>
            <Image source={{uri: media.url}} style={styles.mediaImage} />
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => setMedia(null)}>
              <Icon name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animatable.View>
        )}
      </View>
    </Animatable.View>
  );

  const renderAudienceTargeting = () => (
    <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Target Audience
      </Text>
      
      <View style={styles.visibilitySection}>
        <Text style={[styles.subsectionTitle, {color: theme.colors.text}]}>
          Visibility
        </Text>
        <View style={styles.visibilityButtons}>
          {[
            {id: 'public', name: 'Public', icon: 'public'},
            {id: 'targeted', name: 'Targeted', icon: 'target'},
            {id: 'private', name: 'Private', icon: 'lock'},
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.visibilityButton,
                {
                  backgroundColor: visibility === option.id ? theme.colors.primary : theme.colors.surface,
                  borderColor: visibility === option.id ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => setVisibility(option.id as any)}>
              <Icon
                name={option.icon}
                size={16}
                color={visibility === option.id ? '#FFFFFF' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.visibilityButtonText,
                  {
                    color: visibility === option.id ? '#FFFFFF' : theme.colors.text,
                  },
                ]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {visibility === 'targeted' && (
        <View style={styles.targetingSection}>
          <Text style={[styles.subsectionTitle, {color: theme.colors.text}]}>
            Geographic Targeting
          </Text>
          <ScrollView style={styles.countriesList} showsVerticalScrollIndicator={false}>
            {countries.map((country, index) => (
              <Animatable.View
                key={country}
                animation="fadeInLeft"
                delay={index * 50}>
                <TouchableOpacity
                  style={[
                    styles.countryButton,
                    {
                      backgroundColor: targetAudience.geographic.countries.includes(country)
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: targetAudience.geographic.countries.includes(country)
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => toggleCountry(country)}>
                  <Text
                    style={[
                      styles.countryText,
                      {
                        color: targetAudience.geographic.countries.includes(country)
                          ? '#FFFFFF'
                          : theme.colors.text,
                      },
                    ]}>
                    {country}
                  </Text>
                  {targetAudience.geographic.countries.includes(country) && (
                    <Icon name="check" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </ScrollView>
        </View>
      )}
    </Animatable.View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>Create Channel Content</Text>
        <Text style={styles.headerSubtitle}>Share your media with the world</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContentTypeSelector()}
        {renderMediaSection()}

        {/* Content Details */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Content Details
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
            placeholder="Enter content title..."
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          
          <TextInput
            style={[
              styles.textInput,
              styles.descriptionInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Enter description..."
            placeholderTextColor={theme.colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
          />
          
          <Text style={[styles.characterCount, {color: theme.colors.textSecondary}]}>
            {description.length}/500
          </Text>
        </Animatable.View>

        {/* Tags */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Tags
          </Text>
          
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[
                styles.tagInput,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Add tags..."
              placeholderTextColor={theme.colors.textSecondary}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity
              style={[styles.addTagButton, {backgroundColor: theme.colors.primary}]}
              onPress={addTag}>
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <Animatable.View
                  key={index}
                  animation="fadeInRight"
                  delay={index * 100}>
                  <View style={[styles.tag, {backgroundColor: theme.colors.primary + '20'}]}>
                    <Text style={[styles.tagText, {color: theme.colors.primary}]}>
                      #{tag}
                    </Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Icon name="close" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </Animatable.View>
              ))}
            </View>
          )}
        </Animatable.View>

        {renderAudienceTargeting()}
      </ScrollView>

      {/* Action Buttons */}
      <Animatable.View
        animation="fadeInUp"
        delay={500}
        style={[styles.actionBar, {backgroundColor: theme.colors.surface}]}>
        <TouchableOpacity
          style={[styles.createButton, {backgroundColor: theme.colors.primary}]}
          onPress={handleCreateContent}>
          <Icon name="publish" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Publish Content</Text>
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 10,
  },
  typeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
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
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  visibilitySection: {
    marginBottom: 15,
  },
  visibilityButtons: {
    flexDirection: 'row',
  },
  visibilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  targetingSection: {
    marginTop: 15,
  },
  countriesList: {
    maxHeight: 200,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  countryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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

export default CreateChannelContentScreen;
