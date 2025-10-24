import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  dark: boolean;
}

const themes: {[key: string]: Theme} = {
  default: {
    name: 'Default',
    colors: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#45B7D1',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#E1E8ED',
      success: '#2ECC71',
      warning: '#F39C12',
      error: '#E74C3C',
    },
    dark: false,
  },
  neon: {
    name: 'Neon',
    colors: {
      primary: '#FF0080',
      secondary: '#00FF80',
      accent: '#8000FF',
      background: '#000000',
      surface: '#1A1A1A',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#333333',
      success: '#00FF00',
      warning: '#FFFF00',
      error: '#FF0000',
    },
    dark: true,
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#FF8C42',
      secondary: '#FF6B9D',
      accent: '#C44569',
      background: '#FFF5F5',
      surface: '#FFE8E8',
      text: '#2D3436',
      textSecondary: '#636E72',
      border: '#FDCB6E',
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#E17055',
    },
    dark: false,
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#0984E3',
      secondary: '#00CEC9',
      accent: '#6C5CE7',
      background: '#F0F8FF',
      surface: '#E3F2FD',
      text: '#2D3436',
      textSecondary: '#636E72',
      border: '#74B9FF',
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#E17055',
    },
    dark: false,
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: '#00B894',
      secondary: '#55A3FF',
      accent: '#FDCB6E',
      background: '#F0FFF4',
      surface: '#E8F5E8',
      text: '#2D3436',
      textSecondary: '#636E72',
      border: '#A8E6CF',
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#E17055',
    },
    dark: false,
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [theme, setThemeState] = useState<Theme>(themes.default);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
        setThemeState(themes[savedTheme]);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const setTheme = async (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      setThemeState(themes[themeName]);
      try {
        await AsyncStorage.setItem('selectedTheme', themeName);
      } catch (error) {
        console.log('Error saving theme:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        availableThemes: Object.keys(themes),
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
