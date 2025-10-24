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
    loadUser();
    loadBuzzes();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUserState(userData);
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
        setBuzzes(buzzesData);
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
