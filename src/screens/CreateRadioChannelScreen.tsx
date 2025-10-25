import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useRadioChannel, RadioChannel} from '../context/RadioChannelContext';
import {useUser} from '../context/UserContext';

const CreateRadioChannelScreen: React.FC = () => {
  const {theme} = useTheme();
  const {addRadioChannel} = useRadioChannel();
  const {user} = useUser();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RadioChannel['category']>('entertainment');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [maxListeners, setMaxListeners] = useState(100);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
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

  const categories = [
    {id: 'entertainment', name: 'Entertainment', emoji: '🎭', color: '#FF6B6B'},
    {id: 'education', name: 'Education', emoji: '🎓', color: '#4ECDC4'},
    {id: 'news', name: 'News', emoji: '📰', color: '#45B7D1'},
    {id: 'sports', name: 'Sports', emoji: '⚽', color: '#96CEB4'},
    {id: 'music', name: 'Music', emoji: '🎵', color: '#FFEAA7'},
    {id: 'technology', name: 'Technology', emoji: '💻', color: '#DDA0DD'},
    {id: 'business', name: 'Business', emoji: '💼', color: '#98D8C8'},
    {id: 'health', name: 'Health', emoji: '🏥', color: '#F7DC6F'},
    {id: 'lifestyle', name: 'Lifestyle', emoji: '🌟', color: '#BB8FCE'},
    {id: 'comedy', name: 'Comedy', emoji: '😂', color: '#85C1E9'},
    {id: 'politics', name: 'Politics', emoji: '🏛️', color: '#F8C471'},
    {id: 'science', name: 'Science', emoji: '🔬', color: '#82E0AA'},
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'South Korea', 'India', 'Brazil', 'Mexico', 'Spain',
    'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
    'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand'
  ];

  const handleCreateChannel = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your radio channel');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please create a profile first');
      return;
    }

    const newChannel: Omit<RadioChannel, 'id' | 'createdAt' | 'updatedAt'> = {
      hostId: user.id,
      hostName: user.username,
      hostAvatar: user.avatar,
      title: title.trim(),
      description: description.trim(),
      category,
      tags,
      status: scheduledAt ? 'scheduled' : 'live',
      isLive: !scheduledAt,
      isPublic,
      maxListeners,
      duration: 0,
      scheduledAt: scheduledAt || undefined,
      startedAt: scheduledAt ? undefined : new Date(),
      targetAudience,
      engagement: {
        totalListeners: 0,
        peakListeners: 0,
        averageListenTime: 0,
        likes: 0,
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
          averageListenTime: 0,
          completionRate: 0,
          retentionRate: 0,
        },
      },
      participants: [],
      chatMessages: [],
    };

    addRadioChannel(newChannel);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setIsPublic(true);
    setMaxListeners(100);
    setScheduledAt(null);
    setTargetAudience({
      geographic: {countries: [], states: [], cities: []},
      demographic: {ageRange: {min: 18, max: 65}, interests: [], education: [], occupation: []},
      university: {name: '', department: [], year: []},
    });
    
    Alert.alert('Success', 'Your radio channel has been created!');
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

  const renderCategorySelector = () => (
    <Animatable.View animation="fadeInUp" style={styles.section}>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        Category
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat, index) => (
          <Animatable.View
            key={cat.id}
            animation="fadeInRight"
            delay={index * 100}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                {
                  backgroundColor: category === cat.id ? cat.color : theme.colors.surface,
                  borderColor: category === cat.id ? cat.color : theme.colors.border,
                },
              ]}
              onPress={() => setCategory(cat.id as RadioChannel['category'])}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryName,
                  {
                    color: category === cat.id ? '#FFFFFF' : theme.colors.text,
                  },
                ]}>
                {cat.name}
              </Text>
              {category === cat.id && (
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
          <TouchableOpacity
            style={[
              styles.visibilityButton,
              {
                backgroundColor: isPublic ? theme.colors.primary : theme.colors.surface,
                borderColor: isPublic ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setIsPublic(true)}>
            <Icon
              name="public"
              size={16}
              color={isPublic ? '#FFFFFF' : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.visibilityButtonText,
                {
                  color: isPublic ? '#FFFFFF' : theme.colors.text,
                },
              ]}>
              Public
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.visibilityButton,
              {
                backgroundColor: !isPublic ? theme.colors.primary : theme.colors.surface,
                borderColor: !isPublic ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setIsPublic(false)}>
            <Icon
              name="target"
              size={16}
              color={!isPublic ? '#FFFFFF' : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.visibilityButtonText,
                {
                  color: !isPublic ? '#FFFFFF' : theme.colors.text,
                },
              ]}>
              Targeted
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isPublic && (
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
        <Text style={styles.headerTitle}>Create Radio Channel</Text>
        <Text style={styles.headerSubtitle}>Start your live podcast</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCategorySelector()}

        {/* Channel Details */}
        <Animatable.View animation="fadeInUp" delay={100} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Channel Details
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
            placeholder="Enter channel title..."
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
            placeholder="Enter channel description..."
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
        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
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

        {/* Channel Settings */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Channel Settings
          </Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, {color: theme.colors.text}]}>
              Max Listeners
            </Text>
            <TextInput
              style={[
                styles.numberInput,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={maxListeners.toString()}
              onChangeText={(text) => setMaxListeners(parseInt(text) || 100)}
              keyboardType="numeric"
            />
          </View>
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
          onPress={handleCreateChannel}>
          <Icon name="radio" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Channel</Text>
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
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  numberInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
    fontSize: 16,
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

export default CreateRadioChannelScreen;
