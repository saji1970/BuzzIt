import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import ApiService from '../services/APIService';

interface FeatureContextType {
  features: Record<string, boolean>;
  isLoading: boolean;
  checkFeatureAccess: (feature: string) => Promise<boolean>;
  refreshFeatures: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
};

export const FeatureProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getFeatures();
      
      if (response.success && response.data) {
        setFeatures(response.data.features);
      } else {
        console.error('Failed to load features:', response.error);
        // Set default features if API fails
        setFeatures({
          userRegistration: true,
          userLogin: true,
          mobileVerification: false,
          buzzCreation: true,
          buzzLikes: true,
          buzzComments: true,
          buzzShares: true,
          buzzMedia: true,
          channelCreation: true,
          channelSubscription: true,
          radioCreation: true,
          radioSubscription: true,
          userFollowing: true,
          userBlocking: true,
          socialMediaSharing: true,
          userProfiles: true,
        });
      }
    } catch (error) {
      console.error('Error loading features:', error);
      // Set default features on error
      setFeatures({
        userRegistration: true,
        userLogin: true,
        mobileVerification: false,
        buzzCreation: true,
        buzzLikes: true,
        buzzComments: true,
        buzzShares: true,
        buzzMedia: true,
        channelCreation: true,
        channelSubscription: true,
        radioCreation: true,
        radioSubscription: true,
        userFollowing: true,
        userBlocking: true,
        socialMediaSharing: true,
        userProfiles: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkFeatureAccess = async (feature: string): Promise<boolean> => {
    try {
      const response = await ApiService.checkFeatureAccess(feature);
      return response.success ? response.data.hasAccess : false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return features[feature] || false;
    }
  };

  const refreshFeatures = async () => {
    await loadFeatures();
  };

  const value: FeatureContextType = {
    features,
    isLoading,
    checkFeatureAccess,
    refreshFeatures,
  };

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
};
