import React, {createContext, useContext, useState, useEffect} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/APIService';

export interface Interest {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatar: string | null;
  city?: string;
  country?: string;
  mobileNumber?: string; // Optional for backward compatibility
  isVerified?: boolean; // Optional for backward compatibility
  interests: Interest[];
  followers: number;
  following: number;
  buzzCount: number;
  createdAt: Date;
  subscribedChannels: string[]; // Array of user IDs
  blockedUsers: string[]; // Array of user IDs
  locationSettings?: {
    enabled: boolean;
    priority: 'location' | 'interests' | 'mixed';
    radius: number; // in kilometers
  };
}

export interface Buzz {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  content: string;
  media: {
    type: 'image' | 'video' | null;
    url: string | null;
  };
  interests: Interest[];
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  buzzType?: 'event' | 'gossip' | 'thought' | 'poll';
  eventDate?: string;
  pollOptions?: Array<{id: string; text: string}>;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  isLiked: boolean;
}

interface UserContextType {
  user: User | null;
  buzzes: Buzz[];
  interests: Interest[];
  setUser: (user: User | null) => void;
  addBuzz: (buzz: Omit<Buzz, 'id' | 'createdAt'> | Buzz, skipApiCall?: boolean) => Promise<void>;
  likeBuzz: (buzzId: string) => void;
  shareBuzz: (buzzId: string) => void;
  updateUserInterests: (interests: Interest[]) => void;
  getBuzzesByInterests: (userInterests: Interest[]) => Buzz[];
  getBuzzesByLocation: (userLocation: {latitude: number; longitude: number}, radius: number) => Buzz[];
  getBuzzesByLocationAndInterests: (userLocation: {latitude: number; longitude: number}, userInterests: Interest[], radius: number) => Buzz[];
  updateLocationSettings: (settings: {enabled: boolean; priority: 'location' | 'interests' | 'mixed'; radius: number}) => void;
  subscribeToChannel: (channelId: string) => Promise<void>;
  unsubscribeFromChannel: (channelId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  isBlocked: (userId: string) => boolean;
  isSubscribed: (channelId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultInterests: Interest[] = [
  {id: '1', name: 'Technology', category: 'Tech', emoji: '💻'},
  {id: '2', name: 'Music', category: 'Entertainment', emoji: '🎵'},
  {id: '3', name: 'Sports', category: 'Sports', emoji: '⚽'},
  {id: '4', name: 'Fashion', category: 'Lifestyle', emoji: '👗'},
  {id: '5', name: 'Food', category: 'Lifestyle', emoji: '🍕'},
  {id: '6', name: 'Travel', category: 'Lifestyle', emoji: '✈️'},
  {id: '7', name: 'Gaming', category: 'Entertainment', emoji: '🎮'},
  {id: '8', name: 'Art', category: 'Culture', emoji: '🎨'},
  {id: '9', name: 'Fitness', category: 'Health', emoji: '💪'},
  {id: '10', name: 'Movies', category: 'Entertainment', emoji: '🎬'},
  {id: '11', name: 'Books', category: 'Culture', emoji: '📚'},
  {id: '12', name: 'Photography', category: 'Creative', emoji: '📸'},
  {id: '13', name: 'Politics', category: 'Society', emoji: '🏛️'},
];

export const UserProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [buzzes, setBuzzes] = useState<Buzz[]>([]);
  const [interests] = useState<Interest[]>(defaultInterests);

  useEffect(() => {
    // Load user and buzzes on app start
    loadUser();
    loadBuzzes();
  }, []);

  // Sync user when AsyncStorage changes (e.g., after login)
  useEffect(() => {
    const syncUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Only update if different from current user
          if (!user || user.id !== userData.id) {
            if (!userData.subscribedChannels) {
              userData.subscribedChannels = [];
            }
            if (!userData.blockedUsers) {
              userData.blockedUsers = [];
            }
            setUserState(userData);
          }
        }
      } catch (error) {
        console.log('Error syncing user:', error);
      }
    };

    // Sync every 2 seconds (for login sync)
    const interval = setInterval(syncUser, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // Migrate old users to include new fields
        if (!userData.subscribedChannels) {
          userData.subscribedChannels = [];
        }
        if (!userData.blockedUsers) {
          userData.blockedUsers = [];
        }
        setUserState(userData);
        // Save migrated user data
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const loadBuzzes = async () => {
    try {
      // Try to load from API first
      const response = await ApiService.getBuzzes();
      
      if (response.success && response.data) {
        // Convert createdAt strings back to Date objects
        const buzzesWithDates = response.data.map((buzz: any) => ({
          ...buzz,
          createdAt: buzz.createdAt ? new Date(buzz.createdAt) : new Date(),
        }));
        setBuzzes(buzzesWithDates);
        
        // Also save to local storage as backup
        await AsyncStorage.setItem('buzzes', JSON.stringify(buzzesWithDates));
      } else {
        // Fallback to local storage if API fails
        const savedBuzzes = await AsyncStorage.getItem('buzzes');
        if (savedBuzzes) {
          const buzzesData = JSON.parse(savedBuzzes);
          const buzzesWithDates = buzzesData.map((buzz: any) => ({
            ...buzz,
            createdAt: buzz.createdAt ? new Date(buzz.createdAt) : new Date(),
          }));
          setBuzzes(buzzesWithDates);
        } else {
          // Initialize with sample buzzes if no saved data
          const sampleBuzzes: Buzz[] = [
            {
              id: '1',
              userId: 'buzzuser',
              username: 'buzzuser',
              userAvatar: null,
              content: 'Welcome to Buzzit! 🎉 Join the conversation and share what\'s buzzing!',
              media: {type: null, url: null},
              interests: [interests[0]],
              likes: 42,
              comments: 12,
              shares: 8,
              isLiked: false,
              createdAt: new Date(Date.now() - 86400000), // 1 day ago
            },
            {
              id: '2',
              userId: 'techguru',
              username: 'techguru',
              userAvatar: null,
              content: 'Tech update: New features coming soon! Stay tuned 🚀',
              media: {type: null, url: null},
              interests: [interests[0]],
              likes: 89,
              comments: 23,
              shares: 15,
              isLiked: false,
              createdAt: new Date(Date.now() - 43200000), // 12 hours ago
            },
            {
              id: '3',
              userId: 'foodie',
              username: 'foodie',
              userAvatar: null,
              content: 'Check out this amazing recipe! 🍕 Home made pizza is the best!',
              media: {type: 'image', url: null},
              interests: [interests[1]],
              likes: 156,
              comments: 45,
              shares: 32,
              isLiked: false,
              createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            },
          ];
          setBuzzes(sampleBuzzes);
          await AsyncStorage.setItem('buzzes', JSON.stringify(sampleBuzzes));
        }
        console.log('API failed, loaded from local storage:', response.error);
      }
    } catch (error) {
      console.log('Error loading buzzes:', error);
      // Fallback to local storage
      try {
        const savedBuzzes = await AsyncStorage.getItem('buzzes');
        if (savedBuzzes) {
          const buzzesData = JSON.parse(savedBuzzes);
          const buzzesWithDates = buzzesData.map((buzz: any) => ({
            ...buzz,
            createdAt: buzz.createdAt ? new Date(buzz.createdAt) : new Date(),
          }));
          setBuzzes(buzzesWithDates);
        }
      } catch (localError) {
        console.log('Error loading from local storage:', localError);
      }
    }
  };

  const setUser = async (userData: User | null) => {
    setUserState(userData);
    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem('user');
      }
    } catch (error) {
      console.log('Error saving user:', error);
    }
  };

  const addBuzz = async (buzzData: Omit<Buzz, 'id' | 'createdAt'> | Buzz, skipApiCall: boolean = false) => {
    console.log('Adding buzz:', buzzData, 'skipApiCall:', skipApiCall);
    
    // Check if buzz already has an ID (means it was already created on server)
    const isAlreadyCreated = 'id' in buzzData && buzzData.id;
    
    // If buzz already exists in state, don't add it again
    if (isAlreadyCreated) {
      setBuzzes(prevBuzzes => {
        const exists = prevBuzzes.some(b => b.id === buzzData.id);
        if (exists) {
          console.log('Buzz already exists, skipping duplicate:', buzzData.id);
          return prevBuzzes;
        }
        return prevBuzzes;
      });
    }
    
    try {
      if (skipApiCall || isAlreadyCreated) {
        // Buzz was already created on server, just add to local state
        const newBuzz: Buzz = isAlreadyCreated 
          ? {
              ...buzzData as Buzz,
              createdAt: (buzzData as Buzz).createdAt ? new Date((buzzData as Buzz).createdAt) : new Date(),
            }
          : {
              ...buzzData,
              id: Date.now().toString(),
              createdAt: new Date(),
            } as Buzz;
        
        setBuzzes(prevBuzzes => {
          // Check for duplicates before adding
          const exists = prevBuzzes.some(b => b.id === newBuzz.id);
          if (exists) {
            console.log('Buzz already exists in state, skipping:', newBuzz.id);
            return prevBuzzes;
          }
          const updatedBuzzes = [newBuzz, ...prevBuzzes];
          AsyncStorage.setItem('buzzes', JSON.stringify(updatedBuzzes));
          return updatedBuzzes;
        });
        
        // Refresh buzzes after a short delay to get latest from server
        setTimeout(() => {
          loadBuzzes();
        }, 1000);
        return Promise.resolve();
      }
      
      // Try to save to backend first - this is critical for other users to see the buzz
      const response = await ApiService.createBuzz(buzzData as Omit<Buzz, 'id' | 'createdAt'>);
      console.log('API response:', response);
      
      if (response.success && response.data) {
        // API call successful - buzz is now on server
        const newBuzz = {
          ...response.data,
          createdAt: response.data.createdAt ? new Date(response.data.createdAt) : new Date(),
        };
        setBuzzes(prevBuzzes => {
          // Check for duplicates before adding
          const exists = prevBuzzes.some(b => b.id === newBuzz.id);
          if (exists) {
            console.log('Buzz already exists in state, skipping:', newBuzz.id);
            return prevBuzzes;
          }
          const updatedBuzzes = [newBuzz, ...prevBuzzes];
          // Also save to local storage as backup
          AsyncStorage.setItem('buzzes', JSON.stringify(updatedBuzzes));
          return updatedBuzzes;
        });
        console.log('Buzz saved to server successfully');
        
        // Refresh buzzes from server to ensure all users see the new buzz (faster refresh)
        setTimeout(() => {
          loadBuzzes();
        }, 500);
      } else {
        // API failed - show error but still save locally for this user
        console.error('API failed to save buzz:', response.error);
        const newBuzz: Buzz = {
          ...buzzData as Omit<Buzz, 'id' | 'createdAt'>,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        
        setBuzzes(prevBuzzes => {
          // Check for duplicates
          const exists = prevBuzzes.some(b => b.id === newBuzz.id);
          if (exists) {
            return prevBuzzes;
          }
          const updatedBuzzes = [newBuzz, ...prevBuzzes];
          // Save to AsyncStorage as fallback
          AsyncStorage.setItem('buzzes', JSON.stringify(updatedBuzzes));
          return updatedBuzzes;
        });
        
        // Show alert to user that buzz wasn't synced
        Alert.alert(
          'Warning',
          'Your buzz was saved locally but may not be visible to other users. Please check your internet connection.',
          [{text: 'OK'}]
        );
      }
    } catch (error: any) {
      console.error('Error saving buzz:', error);
      // Network or other error - save locally but warn user
        const newBuzz: Buzz = {
          ...buzzData as Omit<Buzz, 'id' | 'createdAt'>,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        
        setBuzzes(prevBuzzes => {
          // Check for duplicates
          const exists = prevBuzzes.some(b => b.id === newBuzz.id);
          if (exists) {
            return prevBuzzes;
          }
          const updatedBuzzes = [newBuzz, ...prevBuzzes];
          // Save to AsyncStorage
          AsyncStorage.setItem('buzzes', JSON.stringify(updatedBuzzes));
          return updatedBuzzes;
        });
      
      Alert.alert(
        'Network Error',
        'Your buzz was saved locally but could not be synced to the server. Other users may not see it. Please check your connection and try again.',
        [{text: 'OK'}]
      );
    }
  };

  const likeBuzz = async (buzzId: string) => {
    const updatedBuzzes = buzzes.map(buzz => {
      if (buzz.id === buzzId) {
        return {
          ...buzz,
          isLiked: !buzz.isLiked,
          likes: buzz.isLiked ? buzz.likes - 1 : buzz.likes + 1,
        };
      }
      return buzz;
    });
    
    setBuzzes(updatedBuzzes);
    
    try {
      await AsyncStorage.setItem('buzzes', JSON.stringify(updatedBuzzes));
    } catch (error) {
      console.log('Error updating buzz:', error);
    }
  };

  const shareBuzz = async (buzzId: string) => {
    const updatedBuzzes = buzzes.map(buzz => {
      if (buzz.id === buzzId) {
        return {
          ...buzz,
          shares: buzz.shares + 1,
        };
      }
      return buzz;
    });
    
    setBuzzes(updatedBuzzes);
    
    try {
      await AsyncStorage.setItem('buzzes', JSON.stringify(updatedBuzzes));
    } catch (error) {
      console.log('Error updating buzz:', error);
    }
  };

  const updateUserInterests = async (newInterests: Interest[]) => {
    if (user) {
      const updatedUser = {...user, interests: newInterests};
      setUserState(updatedUser);
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.log('Error updating user interests:', error);
      }
    }
  };

  const getBuzzesByInterests = (userInterests: Interest[]): Buzz[] => {
    if (userInterests.length === 0) return buzzes;
    
    const userInterestIds = userInterests.map(interest => interest.id);
    return buzzes.filter(buzz => 
      buzz.interests && buzz.interests.some(interest => userInterestIds.includes(interest.id))
    );
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getBuzzesByLocation = (userLocation: {latitude: number; longitude: number}, radius: number): Buzz[] => {
    return buzzes.filter(buzz => {
      if (!buzz.location) return false;
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        buzz.location.latitude,
        buzz.location.longitude
      );
      return distance <= radius;
    });
  };

  const getBuzzesByLocationAndInterests = (
    userLocation: {latitude: number; longitude: number}, 
    userInterests: Interest[], 
    radius: number
  ): Buzz[] => {
    const userInterestIds = userInterests.map(interest => interest.id);
    
    return buzzes.filter(buzz => {
      // Check if buzz has location and is within radius
      const hasLocation = buzz.location && 
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          buzz.location.latitude,
          buzz.location.longitude
        ) <= radius;
      
      // Check if buzz matches interests
      const matchesInterests = userInterests.length === 0 || 
        (buzz.interests && buzz.interests.some(interest => userInterestIds.includes(interest.id)));
      
      return hasLocation && matchesInterests;
    });
  };

  const updateLocationSettings = (settings: {enabled: boolean; priority: 'location' | 'interests' | 'mixed'; radius: number}) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      locationSettings: settings
    };
    
    setUser(updatedUser);
    
    // Save to AsyncStorage
    try {
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Error saving location settings:', error);
    }
  };

  const subscribeToChannel = async (channelId: string) => {
    if (!user) return;
    
    if (!user.subscribedChannels.includes(channelId)) {
      const updatedUser = {
        ...user,
        subscribedChannels: [...user.subscribedChannels, channelId],
        following: user.following + 1,
      };
      setUserState(updatedUser);
      
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.log('Error subscribing to channel:', error);
      }
    }
  };

  const unsubscribeFromChannel = async (channelId: string) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      subscribedChannels: user.subscribedChannels.filter(id => id !== channelId),
      following: Math.max(0, user.following - 1),
    };
    setUserState(updatedUser);
    
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Error unsubscribing from channel:', error);
    }
  };

  const blockUser = async (userId: string) => {
    if (!user) return;
    
    if (!user.blockedUsers.includes(userId)) {
      // Remove from subscribed channels if subscribed
      const updatedSubscriptions = user.subscribedChannels.filter(id => id !== userId);
      
      const updatedUser = {
        ...user,
        blockedUsers: [...user.blockedUsers, userId],
        subscribedChannels: updatedSubscriptions,
        following: Math.max(0, user.following - (user.subscribedChannels.includes(userId) ? 1 : 0)),
      };
      setUserState(updatedUser);
      
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.log('Error blocking user:', error);
      }
    }
  };

  const unblockUser = async (userId: string) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      blockedUsers: user.blockedUsers.filter(id => id !== userId),
    };
    setUserState(updatedUser);
    
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Error unblocking user:', error);
    }
  };

  const isBlocked = (userId: string): boolean => {
    return (user?.blockedUsers?.includes(userId)) || false;
  };

  const isSubscribed = (channelId: string): boolean => {
    return (user?.subscribedChannels?.includes(channelId)) || false;
  };

  // Ensure context value is always defined, even if some values are null/empty
  // Use useMemo to prevent recreating the object on every render
  const contextValue: UserContextType = React.useMemo(() => ({
    user,
    buzzes,
    interests,
    setUser,
    addBuzz,
    likeBuzz,
    shareBuzz,
    updateUserInterests,
    getBuzzesByInterests,
    getBuzzesByLocation,
    getBuzzesByLocationAndInterests,
    updateLocationSettings,
    subscribeToChannel,
    unsubscribeFromChannel,
    blockUser,
    unblockUser,
    isBlocked,
    isSubscribed,
  }), [user, buzzes, interests]);

  // Always provide context value, even during initialization
  // This ensures useUser hook can be called without errors
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
