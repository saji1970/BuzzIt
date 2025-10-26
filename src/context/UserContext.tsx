import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  interests: Interest[];
  followers: number;
  following: number;
  buzzCount: number;
  createdAt: Date;
  subscribedChannels: string[]; // Array of user IDs
  blockedUsers: string[]; // Array of user IDs
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
  addBuzz: (buzz: Omit<Buzz, 'id' | 'createdAt'>) => void;
  likeBuzz: (buzzId: string) => void;
  shareBuzz: (buzzId: string) => void;
  updateUserInterests: (interests: Interest[]) => void;
  getBuzzesByInterests: (userInterests: Interest[]) => Buzz[];
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
];

export const UserProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [buzzes, setBuzzes] = useState<Buzz[]>([]);
  const [interests] = useState<Interest[]>(defaultInterests);

  useEffect(() => {
    // Clear storage first for testing
    checkAndInitializeData().then(() => {
      loadUser();
      loadBuzzes();
    });
  }, []);

  const checkAndInitializeData = async () => {
    try {
      // Clear all data for testing
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('buzzes');
      
      // No default data - user must create profile first
      // This allows us to test the profile creation flow properly
    } catch (error) {
      console.log('Error initializing data:', error);
    }
  };

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
      const savedBuzzes = await AsyncStorage.getItem('buzzes');
      if (savedBuzzes) {
        const buzzesData = JSON.parse(savedBuzzes);
        // Convert createdAt strings back to Date objects
        const buzzesWithDates = buzzesData.map((buzz: any) => ({
          ...buzz,
          createdAt: buzz.createdAt ? new Date(buzz.createdAt) : new Date(),
        }));
        setBuzzes(buzzesWithDates);
      }
    } catch (error) {
      console.log('Error loading buzzes:', error);
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

  const addBuzz = async (buzzData: Omit<Buzz, 'id' | 'createdAt'>) => {
    const newBuzz: Buzz = {
      ...buzzData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const updatedBuzzes = [newBuzz, ...buzzes];
    setBuzzes(updatedBuzzes);
    
    try {
      await AsyncStorage.setItem('buzzes', JSON.stringify(updatedBuzzes));
    } catch (error) {
      console.log('Error saving buzz:', error);
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
      buzz.interests.some(interest => userInterestIds.includes(interest.id))
    );
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

  return (
    <UserContext.Provider
      value={{
        user,
        buzzes,
        interests,
        setUser,
        addBuzz,
        likeBuzz,
        shareBuzz,
        updateUserInterests,
        getBuzzesByInterests,
        subscribeToChannel,
        unsubscribeFromChannel,
        blockUser,
        unblockUser,
        isBlocked,
        isSubscribed,
      }}>
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
