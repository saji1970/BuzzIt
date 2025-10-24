import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RadioChannel {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string | null;
  title: string;
  description: string;
  category: 'entertainment' | 'education' | 'news' | 'sports' | 'music' | 'technology' | 'business' | 'health' | 'lifestyle' | 'comedy' | 'politics' | 'science';
  tags: string[];
  status: 'scheduled' | 'live' | 'ended' | 'archived';
  isLive: boolean;
  isPublic: boolean;
  maxListeners: number;
  currentListeners: number;
  duration: number; // in seconds
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  audioUrl?: string;
  thumbnail?: string;
  targetAudience: {
    geographic: {
      countries: string[];
      states: string[];
      cities: string[];
    };
    demographic: {
      ageRange: {min: number; max: number};
      interests: string[];
      education: string[];
      occupation: string[];
    };
    university?: {
      name: string;
      department: string[];
      year: string[];
    };
  };
  engagement: {
    totalListeners: number;
    peakListeners: number;
    averageListenTime: number;
    likes: number;
    shares: number;
    comments: number;
    isLiked: boolean;
  };
  analytics: {
    demographics: {
      ageGroups: {[key: string]: number};
      locations: {[key: string]: number};
      interests: {[key: string]: number};
    };
    engagement: {
      peakHours: number[];
      averageListenTime: number;
      completionRate: number;
      retentionRate: number;
    };
  };
  participants: RadioParticipant[];
  chatMessages: RadioChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RadioParticipant {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  role: 'host' | 'co-host' | 'speaker' | 'listener';
  isMuted: boolean;
  isSpeaking: boolean;
  joinedAt: Date;
  leftAt?: Date;
  totalSpeakTime: number;
}

export interface RadioChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  message: string;
  timestamp: Date;
  type: 'text' | 'emoji' | 'reaction';
  isModerator: boolean;
  isHighlighted: boolean;
}

export interface RadioChannelCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  isPopular: boolean;
}

export interface RadioChannelStats {
  totalChannels: number;
  totalListeners: number;
  totalDuration: number;
  averageListenTime: number;
  topChannels: RadioChannel[];
  popularCategories: {[key: string]: number};
  liveChannels: number;
  scheduledChannels: number;
}

interface RadioChannelContextType {
  // Channel management
  radioChannels: RadioChannel[];
  addRadioChannel: (channel: Omit<RadioChannel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRadioChannel: (id: string, updates: Partial<RadioChannel>) => void;
  deleteRadioChannel: (id: string) => void;
  
  // Live channel management
  startLiveChannel: (channelId: string) => void;
  endLiveChannel: (channelId: string) => void;
  joinChannel: (channelId: string, userId: string, role: RadioParticipant['role']) => void;
  leaveChannel: (channelId: string, userId: string) => void;
  
  // Participant management
  updateParticipantRole: (channelId: string, userId: string, role: RadioParticipant['role']) => void;
  muteParticipant: (channelId: string, userId: string, muted: boolean) => void;
  kickParticipant: (channelId: string, userId: string) => void;
  
  // Chat management
  sendChatMessage: (channelId: string, message: RadioChatMessage) => void;
  deleteChatMessage: (channelId: string, messageId: string) => void;
  moderateChatMessage: (channelId: string, messageId: string, action: 'highlight' | 'delete') => void;
  
  // Engagement
  likeChannel: (channelId: string) => void;
  shareChannel: (channelId: string) => void;
  reportChannel: (channelId: string, reason: string) => void;
  
  // Filtering and search
  getLiveChannels: () => RadioChannel[];
  getScheduledChannels: () => RadioChannel[];
  getChannelsByCategory: (category: RadioChannel['category']) => RadioChannel[];
  getChannelsByHost: (hostId: string) => RadioChannel[];
  searchChannels: (query: string) => RadioChannel[];
  
  // Analytics
  getRadioChannelStats: () => RadioChannelStats;
  getChannelAnalytics: (channelId: string) => any;
  
  // Categories
  categories: RadioChannelCategory[];
  addCategory: (category: Omit<RadioChannelCategory, 'id'>) => void;
  
  // Audio management
  startRecording: (channelId: string) => void;
  stopRecording: (channelId: string) => void;
  pauseRecording: (channelId: string) => void;
  resumeRecording: (channelId: string) => void;
}

const RadioChannelContext = createContext<RadioChannelContextType | undefined>(undefined);

const defaultCategories: RadioChannelCategory[] = [
  {id: '1', name: 'Entertainment', emoji: '🎭', description: 'Fun and entertaining content', color: '#FF6B6B', isPopular: true},
  {id: '2', name: 'Education', emoji: '🎓', description: 'Educational and learning content', color: '#4ECDC4', isPopular: true},
  {id: '3', name: 'News', emoji: '📰', description: 'Current events and news', color: '#45B7D1', isPopular: true},
  {id: '4', name: 'Sports', emoji: '⚽', description: 'Sports discussions and analysis', color: '#96CEB4', isPopular: false},
  {id: '5', name: 'Music', emoji: '🎵', description: 'Music discussions and reviews', color: '#FFEAA7', isPopular: true},
  {id: '6', name: 'Technology', emoji: '💻', description: 'Tech news and discussions', color: '#DDA0DD', isPopular: true},
  {id: '7', name: 'Business', emoji: '💼', description: 'Business and entrepreneurship', color: '#98D8C8', isPopular: false},
  {id: '8', name: 'Health', emoji: '🏥', description: 'Health and wellness topics', color: '#F7DC6F', isPopular: false},
  {id: '9', name: 'Lifestyle', emoji: '🌟', description: 'Lifestyle and personal topics', color: '#BB8FCE', isPopular: false},
  {id: '10', name: 'Comedy', emoji: '😂', description: 'Comedy and humor', color: '#85C1E9', isPopular: true},
  {id: '11', name: 'Politics', emoji: '🏛️', description: 'Political discussions', color: '#F8C471', isPopular: false},
  {id: '12', name: 'Science', emoji: '🔬', description: 'Science and research', color: '#82E0AA', isPopular: false},
];

export const RadioChannelProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [radioChannels, setRadioChannels] = useState<RadioChannel[]>([]);
  const [categories] = useState<RadioChannelCategory[]>(defaultCategories);

  useEffect(() => {
    loadRadioChannels();
  }, []);

  const loadRadioChannels = async () => {
    try {
      const savedChannels = await AsyncStorage.getItem('radio_channels');
      if (savedChannels) {
        const channelsData = JSON.parse(savedChannels);
        setRadioChannels(channelsData);
      }
    } catch (error) {
      console.log('Error loading radio channels:', error);
    }
  };

  const saveRadioChannels = async (channels: RadioChannel[]) => {
    try {
      await AsyncStorage.setItem('radio_channels', JSON.stringify(channels));
    } catch (error) {
      console.log('Error saving radio channels:', error);
    }
  };

  const addRadioChannel = async (channelData: Omit<RadioChannel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newChannel: RadioChannel = {
      ...channelData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedChannels = [newChannel, ...radioChannels];
    setRadioChannels(updatedChannels);
    await saveRadioChannels(updatedChannels);
  };

  const updateRadioChannel = async (id: string, updates: Partial<RadioChannel>) => {
    const updatedChannels = radioChannels.map(channel => 
      channel.id === id 
        ? {...channel, ...updates, updatedAt: new Date()}
        : channel
    );
    
    setRadioChannels(updatedChannels);
    await saveRadioChannels(updatedChannels);
  };

  const deleteRadioChannel = async (id: string) => {
    const updatedChannels = radioChannels.filter(channel => channel.id !== id);
    setRadioChannels(updatedChannels);
    await saveRadioChannels(updatedChannels);
  };

  const startLiveChannel = async (channelId: string) => {
    await updateRadioChannel(channelId, {
      status: 'live',
      isLive: true,
      startedAt: new Date(),
    });
  };

  const endLiveChannel = async (channelId: string) => {
    await updateRadioChannel(channelId, {
      status: 'ended',
      isLive: false,
      endedAt: new Date(),
    });
  };

  const joinChannel = async (channelId: string, userId: string, role: RadioParticipant['role']) => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    const newParticipant: RadioParticipant = {
      id: Date.now().toString(),
      userId,
      username: 'User', // This would come from user context
      avatar: null,
      role,
      isMuted: role === 'listener',
      isSpeaking: false,
      joinedAt: new Date(),
      totalSpeakTime: 0,
    };

    await updateRadioChannel(channelId, {
      participants: [...channel.participants, newParticipant],
      currentListeners: channel.currentListeners + 1,
    });
  };

  const leaveChannel = async (channelId: string, userId: string) => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    const updatedParticipants = channel.participants.filter(p => p.userId !== userId);
    const leftParticipant = channel.participants.find(p => p.userId === userId);
    
    if (leftParticipant) {
      leftParticipant.leftAt = new Date();
    }

    await updateRadioChannel(channelId, {
      participants: updatedParticipants,
      currentListeners: Math.max(0, channel.currentListeners - 1),
    });
  };

  const updateParticipantRole = async (channelId: string, userId: string, role: RadioParticipant['role']) => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    const updatedParticipants = channel.participants.map(p => 
      p.userId === userId ? {...p, role} : p
    );

    await updateRadioChannel(channelId, {
      participants: updatedParticipants,
    });
  };

  const muteParticipant = async (channelId: string, userId: string, muted: boolean) => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    const updatedParticipants = channel.participants.map(p => 
      p.userId === userId ? {...p, isMuted: muted} : p
    );

    await updateRadioChannel(channelId, {
      participants: updatedParticipants,
    });
  };

  const kickParticipant = async (channelId: string, userId: string) => {
    await leaveChannel(channelId, userId);
  };

  const sendChatMessage = async (channelId: string, message: RadioChatMessage) => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    await updateRadioChannel(channelId, {
      chatMessages: [...channel.chatMessages, message],
    });
  };

  const deleteChatMessage = async (channelId: string, messageId: string) => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    const updatedMessages = channel.chatMessages.filter(m => m.id !== messageId);
    await updateRadioChannel(channelId, {
      chatMessages: updatedMessages,
    });
  };

  const moderateChatMessage = async (channelId: string, messageId: string, action: 'highlight' | 'delete') => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    if (action === 'delete') {
      await deleteChatMessage(channelId, messageId);
    } else {
      const updatedMessages = channel.chatMessages.map(m => 
        m.id === messageId ? {...m, isHighlighted: true} : m
      );
      await updateRadioChannel(channelId, {
        chatMessages: updatedMessages,
      });
    }
  };

  const likeChannel = async (channelId: string) => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    await updateRadioChannel(channelId, {
      engagement: {
        ...channel.engagement,
        isLiked: !channel.engagement.isLiked,
        likes: channel.engagement.isLiked 
          ? channel.engagement.likes - 1 
          : channel.engagement.likes + 1,
      }
    });
  };

  const shareChannel = async (channelId: string) => {
    const channel = radioChannels.find(c => c.id === channelId);
    if (!channel) return;

    await updateRadioChannel(channelId, {
      engagement: {
        ...channel.engagement,
        shares: channel.engagement.shares + 1,
      }
    });
  };

  const reportChannel = async (channelId: string, reason: string) => {
    // In a real app, this would send a report to moderators
    console.log('Channel reported:', channelId, 'Reason:', reason);
  };

  const getLiveChannels = (): RadioChannel[] => {
    return radioChannels.filter(channel => channel.isLive);
  };

  const getScheduledChannels = (): RadioChannel[] => {
    return radioChannels.filter(channel => channel.status === 'scheduled');
  };

  const getChannelsByCategory = (category: RadioChannel['category']): RadioChannel[] => {
    return radioChannels.filter(channel => channel.category === category);
  };

  const getChannelsByHost = (hostId: string): RadioChannel[] => {
    return radioChannels.filter(channel => channel.hostId === hostId);
  };

  const searchChannels = (query: string): RadioChannel[] => {
    const lowercaseQuery = query.toLowerCase();
    return radioChannels.filter(channel => 
      channel.title.toLowerCase().includes(lowercaseQuery) ||
      channel.description.toLowerCase().includes(lowercaseQuery) ||
      channel.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getRadioChannelStats = (): RadioChannelStats => {
    const totalChannels = radioChannels.length;
    const totalListeners = radioChannels.reduce((sum, channel) => sum + channel.engagement.totalListeners, 0);
    const totalDuration = radioChannels.reduce((sum, channel) => sum + channel.duration, 0);
    const averageListenTime = totalChannels > 0 ? totalDuration / totalChannels : 0;
    
    const topChannels = radioChannels
      .sort((a, b) => b.engagement.totalListeners - a.engagement.totalListeners)
      .slice(0, 5);
    
    const popularCategories = {};
    radioChannels.forEach(channel => {
      popularCategories[channel.category] = (popularCategories[channel.category] || 0) + 1;
    });
    
    const liveChannels = radioChannels.filter(c => c.isLive).length;
    const scheduledChannels = radioChannels.filter(c => c.status === 'scheduled').length;
    
    return {
      totalChannels,
      totalListeners,
      totalDuration,
      averageListenTime,
      topChannels,
      popularCategories,
      liveChannels,
      scheduledChannels,
    };
  };

  const getChannelAnalytics = (channelId: string) => {
    const channel = radioChannels.find(c => c.id === channelId);
    return channel?.analytics || null;
  };

  const addCategory = async (categoryData: Omit<RadioChannelCategory, 'id'>) => {
    const newCategory: RadioChannelCategory = {
      ...categoryData,
      id: Date.now().toString(),
    };
    
    // In a real app, this would be stored in a database
    console.log('New category added:', newCategory);
  };

  const startRecording = async (channelId: string) => {
    // In a real app, this would start audio recording
    console.log('Starting recording for channel:', channelId);
  };

  const stopRecording = async (channelId: string) => {
    // In a real app, this would stop audio recording
    console.log('Stopping recording for channel:', channelId);
  };

  const pauseRecording = async (channelId: string) => {
    // In a real app, this would pause audio recording
    console.log('Pausing recording for channel:', channelId);
  };

  const resumeRecording = async (channelId: string) => {
    // In a real app, this would resume audio recording
    console.log('Resuming recording for channel:', channelId);
  };

  return (
    <RadioChannelContext.Provider
      value={{
        radioChannels,
        addRadioChannel,
        updateRadioChannel,
        deleteRadioChannel,
        startLiveChannel,
        endLiveChannel,
        joinChannel,
        leaveChannel,
        updateParticipantRole,
        muteParticipant,
        kickParticipant,
        sendChatMessage,
        deleteChatMessage,
        moderateChatMessage,
        likeChannel,
        shareChannel,
        reportChannel,
        getLiveChannels,
        getScheduledChannels,
        getChannelsByCategory,
        getChannelsByHost,
        searchChannels,
        getRadioChannelStats,
        getChannelAnalytics,
        categories,
        addCategory,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
      }}>
      {children}
    </RadioChannelContext.Provider>
  );
};

export const useRadioChannel = () => {
  const context = useContext(RadioChannelContext);
  if (context === undefined) {
    throw new Error('useRadioChannel must be used within a RadioChannelProvider');
  }
  return context;
};
