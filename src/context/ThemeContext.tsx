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
    name: 'Instagram',
    colors: {
      primary: '#E4405F', // Instagram pink
      secondary: '#8E44AD', // Purple gradient
      accent: '#F58529', // Orange accent
      background: '#FAFAFA', // Instagram gray
      surface: '#FFFFFF',
      text: '#262626',
      textSecondary: '#8E8E8E',
      border: '#DBDBDB',
      success: '#4ECDC4',
      warning: '#F58529',
      error: '#E4405F',
    },
    dark: false,
  },
  neon: {
    name: 'Electric',
    colors: {
      primary: '#FF0080', // Hot pink
      secondary: '#00FFFF', // Cyan
      accent: '#FFFF00', // Yellow
      background: '#0A0A0A',
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
      primary: '#FF6B35', // Vibrant orange
      secondary: '#F7931E', // Golden
      accent: '#FFE66D', // Bright yellow
      background: '#FFF8F0',
      surface: '#FFFFFF',
      text: '#2D3436',
      textSecondary: '#636E72',
      border: '#FFC49B',
      success: '#2ECC71',
      warning: '#F7931E',
      error: '#E74C3C',
    },
    dark: false,
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#667EEA', // Bright blue
      secondary: '#764BA2', // Purple
      accent: '#48CAE4', // Sky blue
      background: '#F0F8FF',
      surface: '#FFFFFF',
      text: '#2D3436',
      textSecondary: '#636E72',
      border: '#A8DAF0',
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#E74C3C',
    },
    dark: false,
  },
  forest: {
    name: 'Vibrant',
    colors: {
      primary: '#00D2D3', // Teal
      secondary: '#00B894', // Green
      accent: '#6C5CE7', // Purple
      background: '#F0FFF4',
      surface: '#FFFFFF',
      text: '#2D3436',
      textSecondary: '#636E72',
      border: '#A8E6CF',
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#E74C3C',
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
