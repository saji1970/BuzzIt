import React, {useState, useEffect} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import ApiService from '../services/APIService';

const CreateStreamScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user: currentUser} = useAuth();
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [streamUrl, setStreamUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStream, setActiveStream] = useState<any>(null);

  const categories = [
    {value: 'general', label: 'General'},
    {value: 'entertainment', label: 'Entertainment'},
    {value: 'education', label: 'Education'},
    {value: 'sports', label: 'Sports'},
    {value: 'music', label: 'Music'},
    {value: 'gaming', label: 'Gaming'},
    {value: 'news', label: 'News'},
  ];

  useEffect(() => {
    checkActiveStream();
  }, []);

  const checkActiveStream = async () => {
    try {
      const response = await ApiService.getLiveStreams();
      if (response.success && response.data) {
        const userStream = response.data.find(
          (s: any) => s.userId === currentUser?.id && s.isLive
        );
        if (userStream) {
          setActiveStream(userStream);
        }
      }
    } catch (error) {
      console.error('Error checking active stream:', error);
    }
  };

  const handleCreateStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }

    if (activeStream) {
      Alert.alert(
        'Active Stream Exists',
        'You already have an active stream. Please end it first before starting a new one.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'End Stream', onPress: () => handleEndStream(activeStream.id)},
        ]
      );
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.createLiveStream({
        title: title.trim(),
        description: description.trim(),
        category,
        streamUrl: streamUrl.trim() || undefined,
      });

      if (response.success) {
        Alert.alert(
          'Success',
          'Stream started successfully! Your stream is now live.',
          [
            {
              text: 'OK',
              onPress: () => {
                setTitle('');
                setDescription('');
                setStreamUrl('');
                setCategory('general');
                checkActiveStream();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to start stream');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start stream. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async (streamId: string) => {
    Alert.alert(
      'End Stream',
      'Are you sure you want to end this stream?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'End Stream',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.endLiveStream(streamId);
              if (response.success) {
                Alert.alert('Success', 'Stream ended successfully');
                setActiveStream(null);
              } else {
                Alert.alert('Error', response.error || 'Failed to end stream');
              }
            } catch (error: any) {
              Alert.alert('Error', 'Failed to end stream. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShareStream = async (streamId: string) => {
    const shareUrl = `https://buzzit-production.up.railway.app/stream/${streamId}`;
    try {
      const Share = await import('react-native').then(m => m.Share);
      await Share.share({
        message: `Check out my live stream: ${shareUrl}`,
        title: 'Live Stream',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share stream link');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, {backgroundColor: theme.colors.surface}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Create Live Stream
          </Text>
          <View style={styles.backButton} />
        </View>

        {/* Active Stream Alert */}
        {activeStream && (
          <Animatable.View
            animation="fadeInDown"
            style={[styles.activeStreamCard, {backgroundColor: theme.colors.primary + '20'}]}>
            <View style={styles.activeStreamHeader}>
              <View>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Text style={[styles.activeStreamTitle, {color: theme.colors.text}]}>
                  {activeStream.title}
                </Text>
                <Text style={[styles.activeStreamMeta, {color: theme.colors.textSecondary}]}>
                  {activeStream.viewers} viewers • {activeStream.category}
                </Text>
              </View>
              <View style={styles.activeStreamActions}>
                <TouchableOpacity
                  style={[styles.iconButton, {backgroundColor: theme.colors.primary}]}
                  onPress={() => handleShareStream(activeStream.id)}>
                  <Icon name="share" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, {backgroundColor: theme.colors.error}]}
                  onPress={() => handleEndStream(activeStream.id)}>
                  <Icon name="stop" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.activeStreamNote, {color: theme.colors.textSecondary}]}>
              End your current stream before starting a new one.
            </Text>
          </Animatable.View>
        )}

        {/* Form */}
        <Animatable.View
          animation="fadeInUp"
          style={[styles.formCard, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.formSection}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              Stream Title *
            </Text>
            <TextInput
              style={[styles.input, {color: theme.colors.text, borderColor: theme.colors.border}]}
              placeholder="Enter stream title"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {color: theme.colors.text, borderColor: theme.colors.border},
              ]}
              placeholder="Describe your stream..."
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, {color: theme.colors.text}]}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    category === cat.value && {
                      backgroundColor: theme.colors.primary,
                    },
                    category !== cat.value && {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.value)}>
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.value
                        ? {color: '#FFFFFF'}
                        : {color: theme.colors.text},
                    ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, {color: theme.colors.text}]}>
              Stream URL (Optional)
            </Text>
            <TextInput
              style={[styles.input, {color: theme.colors.text, borderColor: theme.colors.border}]}
              placeholder="rtmp://your-server.com/stream"
              placeholderTextColor={theme.colors.textSecondary}
              value={streamUrl}
              onChangeText={setStreamUrl}
              autoCapitalize="none"
            />
            <Text style={[styles.helperText, {color: theme.colors.textSecondary}]}>
              Leave empty to use default streaming server
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.createButton, {opacity: loading ? 0.6 : 1}]}
            onPress={handleCreateStream}
            disabled={loading || !!activeStream}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.createButtonGradient}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="videocam" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Start Stream</Text>
                </>
              )}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeStreamCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF0069',
  },
  activeStreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0069',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeStreamTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeStreamMeta: {
    fontSize: 12,
  },
  activeStreamActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStreamNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  formCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
  },
  createButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateStreamScreen;
