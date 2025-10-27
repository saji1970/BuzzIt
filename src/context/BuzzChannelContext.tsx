import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BuzzChannelContent {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  title: string;
  description: string;
  type: 'music_video' | 'movie' | 'song' | 'event_teaser' | 'voice_snippet' | 'announcement';
  media: {
    type: 'video' | 'audio' | 'image';
    url: string;
    thumbnail?: string;
    duration?: number; // in seconds
    fileSize?: number; // in bytes
  };
  category: 'entertainment' | 'education' | 'government' | 'university' | 'corporate' | 'personal';
  tags: string[];
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
    likes: number;
    votes: number;
    views: number;
    shares: number;
    comments: number;
    isLiked: boolean;
    userVote?: 'up' | 'down' | null;
  };
  analytics: {
    demographics: {
      ageGroups: {[key: string]: number};
      locations: {[key: string]: number};
      interests: {[key: string]: number};
    };
    engagement: {
      peakHours: number[];
      averageWatchTime: number;
      completionRate: number;
    };
  };
  visibility: 'public' | 'targeted' | 'private';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuzzChannelCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export interface BuzzChannelStats {
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  totalVotes: number;
  averageEngagement: number;
  topContent: BuzzChannelContent[];
  audienceReach: {
    countries: {[key: string]: number};
    ageGroups: {[key: string]: number};
    interests: {[key: string]: number};
  };
}

interface BuzzChannelContextType {
  // Content management
  channelContent: BuzzChannelContent[];
  addChannelContent: (content: Omit<BuzzChannelContent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChannelContent: (id: string, updates: Partial<BuzzChannelContent>) => void;
  deleteChannelContent: (id: string) => void;
  
  // Engagement
  likeContent: (contentId: string) => void;
  voteContent: (contentId: string, vote: 'up' | 'down') => void;
  viewContent: (contentId: string) => void;
  shareContent: (contentId: string) => void;
  
  // Filtering and search
  getContentByType: (type: BuzzChannelContent['type']) => BuzzChannelContent[];
  getContentByCategory: (category: BuzzChannelContent['category']) => BuzzChannelContent[];
  getContentByAudience: (location: string, demographics?: any) => BuzzChannelContent[];
  searchContent: (query: string) => BuzzChannelContent[];
  
  // Analytics
  getChannelStats: () => BuzzChannelStats;
  getContentAnalytics: (contentId: string) => any;
  
  // Categories
  categories: BuzzChannelCategory[];
  addCategory: (category: Omit<BuzzChannelCategory, 'id'>) => void;
  
  // Audience targeting
  getTargetAudience: (contentId: string) => any;
  updateTargetAudience: (contentId: string, audience: any) => void;
}

const BuzzChannelContext = createContext<BuzzChannelContextType | undefined>(undefined);

const defaultCategories: BuzzChannelCategory[] = [
  {id: '1', name: 'Music Videos', emoji: '🎵', description: 'Music videos and performances', color: '#FF6B6B'},
  {id: '2', name: 'Movies', emoji: '🎬', description: 'Movie trailers and clips', color: '#4ECDC4'},
  {id: '3', name: 'Songs', emoji: '🎶', description: 'New songs and music releases', color: '#45B7D1'},
  {id: '4', name: 'Events', emoji: '🎪', description: 'Event teasers and announcements', color: '#96CEB4'},
  {id: '5', name: 'Voice Snippets', emoji: '🎤', description: 'Voice messages and audio clips', color: '#FFEAA7'},
  {id: '6', name: 'Announcements', emoji: '📢', description: 'Official announcements and news', color: '#DDA0DD'},
  {id: '7', name: 'University', emoji: '🎓', description: 'University and educational content', color: '#98D8C8'},
  {id: '8', name: 'Government', emoji: '🏛️', description: 'Government announcements and updates', color: '#F7DC6F'},
];

export const BuzzChannelProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [channelContent, setChannelContent] = useState<BuzzChannelContent[]>([]);
  const [categories] = useState<BuzzChannelCategory[]>(defaultCategories);

  useEffect(() => {
    loadChannelContent();
  }, []);

  const loadChannelContent = async () => {
    try {
      const savedContent = await AsyncStorage.getItem('buzz_channel_content');
      if (savedContent) {
        const contentData = JSON.parse(savedContent);
        setChannelContent(contentData);
      }
    } catch (error) {
      console.log('Error loading channel content:', error);
    }
  };

  const saveChannelContent = async (content: BuzzChannelContent[]) => {
    try {
      await AsyncStorage.setItem('buzz_channel_content', JSON.stringify(content));
    } catch (error) {
      console.log('Error saving channel content:', error);
    }
  };

  const addChannelContent = async (contentData: Omit<BuzzChannelContent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContent: BuzzChannelContent = {
      ...contentData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedContent = [newContent, ...channelContent];
    setChannelContent(updatedContent);
    await saveChannelContent(updatedContent);
  };

  const updateChannelContent = async (id: string, updates: Partial<BuzzChannelContent>) => {
    const updatedContent = channelContent.map(content => 
      content.id === id 
        ? {...content, ...updates, updatedAt: new Date()}
        : content
    );
    
    setChannelContent(updatedContent);
    await saveChannelContent(updatedContent);
  };

  const deleteChannelContent = async (id: string) => {
    const updatedContent = channelContent.filter(content => content.id !== id);
    setChannelContent(updatedContent);
    await saveChannelContent(updatedContent);
  };

  const likeContent = async (contentId: string) => {
    const updatedContent = channelContent.map(content => {
      if (content.id === contentId) {
        return {
          ...content,
          engagement: {
            ...content.engagement,
            isLiked: !content.engagement.isLiked,
            likes: content.engagement.isLiked 
              ? content.engagement.likes - 1 
              : content.engagement.likes + 1,
          }
        };
      }
      return content;
    });
    
    setChannelContent(updatedContent);
    await saveChannelContent(updatedContent);
  };

  const voteContent = async (contentId: string, vote: 'up' | 'down') => {
    const updatedContent = channelContent.map(content => {
      if (content.id === contentId) {
        const currentVote = content.engagement.userVote;
        let voteChange = 0;
        
        if (currentVote === vote) {
          // Remove vote
          voteChange = vote === 'up' ? -1 : 1;
        } else if (currentVote) {
          // Change vote
          voteChange = vote === 'up' ? 2 : -2;
        } else {
          // New vote
          voteChange = vote === 'up' ? 1 : -1;
        }
        
        return {
          ...content,
          engagement: {
            ...content.engagement,
            votes: content.engagement.votes + voteChange,
            userVote: currentVote === vote ? null : vote,
          }
        };
      }
      return content;
    });
    
    setChannelContent(updatedContent);
    await saveChannelContent(updatedContent);
  };

  const viewContent = async (contentId: string) => {
    const updatedContent = channelContent.map(content => {
      if (content.id === contentId) {
        return {
          ...content,
          engagement: {
            ...content.engagement,
            views: content.engagement.views + 1,
          }
        };
      }
      return content;
    });
    
    setChannelContent(updatedContent);
    await saveChannelContent(updatedContent);
  };

  const shareContent = async (contentId: string) => {
    const updatedContent = channelContent.map(content => {
      if (content.id === contentId) {
        return {
          ...content,
          engagement: {
            ...content.engagement,
            shares: content.engagement.shares + 1,
          }
        };
      }
      return content;
    });
    
    setChannelContent(updatedContent);
    await saveChannelContent(updatedContent);
  };

  const getContentByType = (type: BuzzChannelContent['type']): BuzzChannelContent[] => {
    return channelContent.filter(content => content.type === type);
  };

  const getContentByCategory = (category: BuzzChannelContent['category']): BuzzChannelContent[] => {
    return channelContent.filter(content => content.category === category);
  };

  const getContentByAudience = (location: string, demographics?: any): BuzzChannelContent[] => {
    return channelContent.filter(content => {
      if (content.visibility === 'public') return true;
      if (content.visibility === 'private') return false;
      
      // Check geographic targeting
      const targetCountries = content.targetAudience.geographic.countries;
      const targetStates = content.targetAudience.geographic.states;
      const targetCities = content.targetAudience.geographic.cities;
      
      return targetCountries.includes(location) || 
             targetStates.includes(location) || 
             targetCities.includes(location);
    });
  };

  const searchContent = (query: string): BuzzChannelContent[] => {
    const lowercaseQuery = query.toLowerCase();
    return channelContent.filter(content => 
      content.title.toLowerCase().includes(lowercaseQuery) ||
      content.description.toLowerCase().includes(lowercaseQuery) ||
      (content.tags && content.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  };

  const getChannelStats = (): BuzzChannelStats => {
    const totalContent = channelContent.length;
    const totalViews = channelContent.reduce((sum, content) => sum + content.engagement.views, 0);
    const totalLikes = channelContent.reduce((sum, content) => sum + content.engagement.likes, 0);
    const totalVotes = channelContent.reduce((sum, content) => sum + content.engagement.votes, 0);
    const averageEngagement = totalContent > 0 ? (totalViews + totalLikes + totalVotes) / totalContent : 0;
    
    const topContent = channelContent
      .sort((a, b) => (b.engagement.views + b.engagement.likes + b.engagement.votes) - 
                     (a.engagement.views + a.engagement.likes + a.engagement.votes))
      .slice(0, 5);
    
    const audienceReach = {
      countries: {},
      ageGroups: {},
      interests: {}
    };
    
    channelContent.forEach(content => {
      content.targetAudience.geographic.countries.forEach(country => {
        audienceReach.countries[country] = (audienceReach.countries[country] || 0) + 1;
      });
    });
    
    return {
      totalContent,
      totalViews,
      totalLikes,
      totalVotes,
      averageEngagement,
      topContent,
      audienceReach
    };
  };

  const getContentAnalytics = (contentId: string) => {
    const content = channelContent.find(c => c.id === contentId);
    return content?.analytics || null;
  };

  const addCategory = async (categoryData: Omit<BuzzChannelCategory, 'id'>) => {
    const newCategory: BuzzChannelCategory = {
      ...categoryData,
      id: Date.now().toString(),
    };
    
    // In a real app, this would be stored in a database
    console.log('New category added:', newCategory);
  };

  const getTargetAudience = (contentId: string) => {
    const content = channelContent.find(c => c.id === contentId);
    return content?.targetAudience || null;
  };

  const updateTargetAudience = async (contentId: string, audience: any) => {
    await updateChannelContent(contentId, {targetAudience: audience});
  };

  return (
    <BuzzChannelContext.Provider
      value={{
        channelContent,
        addChannelContent,
        updateChannelContent,
        deleteChannelContent,
        likeContent,
        voteContent,
        viewContent,
        shareContent,
        getContentByType,
        getContentByCategory,
        getContentByAudience,
        searchContent,
        getChannelStats,
        getContentAnalytics,
        categories,
        addCategory,
        getTargetAudience,
        updateTargetAudience,
      }}>
      {children}
    </BuzzChannelContext.Provider>
  );
};

export const useBuzzChannel = () => {
  const context = useContext(BuzzChannelContext);
  if (context === undefined) {
    throw new Error('useBuzzChannel must be used within a BuzzChannelProvider');
  }
  return context;
};
