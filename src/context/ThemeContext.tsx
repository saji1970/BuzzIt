import React, {createContext, useContext, useState, useEffect} from 'react';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeFont {
  fontFamily: string;
  fontWeight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
  letterSpacing?: number;
}

export interface ThemeTypography {
  heading: ThemeFont;
  body: ThemeFont;
  tag: ThemeFont;
}

export interface ThemeIconography {
  style: 'default' | 'sketch' | 'glass' | 'neumorphic';
  strokeWidth?: number;
  filled?: boolean;
  effects?: {
    shadow?: boolean;
    gloss?: boolean;
    extruded?: boolean;
  };
}

export interface ThemeGradients {
  background: string[];
  header: string[];
  accent?: string[];
}

export interface ThemeLayout {
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
    full: number;
  };
  elevation: {
    soft: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: {width: number; height: number};
      elevation: number;
    };
    raised: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: {width: number; height: number};
      elevation: number;
    };
  };
}

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
  gradients?: ThemeGradients;
  layout?: ThemeLayout;
  dark: boolean;
  typography?: ThemeTypography;
  iconography?: ThemeIconography;
}

const selectFont = (options: {ios?: string; android?: string; default?: string}, fallback: string): string => {
  return Platform.select(options) || fallback;
};

const themes: {[key: string]: Theme} = {
  default: {
    name: 'Buzzit Modern',
    colors: {
      primary: '#2F80FF',
      secondary: '#6BD6FF',
      accent: '#1AC0FF',
      background: '#EEF6FF',
      surface: '#FFFFFF',
      text: '#0F172A',
      textSecondary: '#6B7280',
      border: '#DCE8FD',
      success: '#2DD4BF',
      warning: '#FBBF24',
      error: '#EF4444',
    },
    gradients: {
      background: ['#DFF0FF', '#FFFFFF'],
      header: ['#4EA8FF', '#7BD7FF'],
      accent: ['#2F80FF', '#56CCF2'],
    },
    layout: {
      spacing: {
        xxs: 2,
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
      },
      radii: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        pill: 999,
        full: 9999,
      },
      elevation: {
        soft: {
          shadowColor: 'rgba(47, 128, 255, 0.12)',
          shadowOpacity: 0.8,
          shadowRadius: 12,
          shadowOffset: {width: 0, height: 6},
          elevation: 6,
        },
        raised: {
          shadowColor: 'rgba(26, 111, 255, 0.18)',
          shadowOpacity: 0.9,
          shadowRadius: 18,
          shadowOffset: {width: 0, height: 10},
          elevation: 10,
        },
      },
    },
    dark: false,
    typography: {
      heading: {
        fontFamily: selectFont({ios: 'SFProDisplay-Bold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '700',
        letterSpacing: 0.2,
      },
      body: {
        fontFamily: selectFont({ios: 'SFProText-Regular', android: 'sans-serif', default: 'System'}, 'System'),
        fontWeight: '400',
        letterSpacing: 0.1,
      },
      tag: {
        fontFamily: selectFont({ios: 'SFProText-Semibold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '600',
        letterSpacing: 0.6,
      },
    },
    iconography: {
      style: 'default',
      strokeWidth: 1.8,
      effects: {
        shadow: true,
      },
    },
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
    typography: {
      heading: {
        fontFamily: selectFont({ios: 'Avenir-Heavy', android: 'sans-serif-condensed', default: 'System'}, 'System'),
        fontWeight: '700',
        letterSpacing: 0.6,
      },
      body: {
        fontFamily: selectFont({ios: 'Avenir-Book', android: 'sans-serif', default: 'System'}, 'System'),
        fontWeight: '400',
      },
      tag: {
        fontFamily: selectFont({ios: 'Avenir-Medium', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '500',
      },
    },
    iconography: {
      style: 'default',
      strokeWidth: 2,
    },
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
    typography: {
      heading: {
        fontFamily: selectFont({ios: 'Georgia-Bold', android: 'serif', default: 'System'}, 'System'),
        fontWeight: '700',
        letterSpacing: 0.4,
      },
      body: {
        fontFamily: selectFont({ios: 'Georgia', android: 'serif', default: 'System'}, 'System'),
        fontWeight: '400',
      },
      tag: {
        fontFamily: selectFont({ios: 'HelveticaNeue-Medium', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '500',
      },
    },
    iconography: {
      style: 'default',
      strokeWidth: 2,
    },
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
    typography: {
      heading: {
        fontFamily: selectFont({ios: 'HelveticaNeue-Bold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '700',
        letterSpacing: 0.3,
      },
      body: {
        fontFamily: selectFont({ios: 'HelveticaNeue', android: 'sans-serif', default: 'System'}, 'System'),
        fontWeight: '400',
      },
      tag: {
        fontFamily: selectFont({ios: 'HelveticaNeue-Medium', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '500',
      },
    },
    iconography: {
      style: 'default',
      strokeWidth: 2,
    },
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
    typography: {
      heading: {
        fontFamily: selectFont({ios: 'GillSans-Bold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '700',
        letterSpacing: 0.2,
      },
      body: {
        fontFamily: selectFont({ios: 'GillSans', android: 'sans-serif', default: 'System'}, 'System'),
        fontWeight: '400',
      },
      tag: {
        fontFamily: selectFont({ios: 'GillSans-SemiBold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '500',
      },
    },
    iconography: {
      style: 'default',
      strokeWidth: 2,
    },
  },
  sketch: {
    name: 'Sketchbook',
    colors: {
      primary: '#4A403A',
      secondary: '#8C6A4F',
      accent: '#C1A67A',
      background: '#F4F1EA',
      surface: '#FFFDF7',
      text: '#2F2A28',
      textSecondary: '#6B5F58',
      border: '#D8CDC1',
      success: '#6A8A5B',
      warning: '#C97F3C',
      error: '#A65D5D',
    },
    dark: false,
    typography: {
      heading: {
        fontFamily: selectFont({ios: 'MarkerFelt-Wide', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: 'bold',
        letterSpacing: 0.8,
      },
      body: {
        fontFamily: selectFont({ios: 'Noteworthy-Light', android: 'sans-serif', default: 'System'}, 'System'),
        fontWeight: '400',
        letterSpacing: 0.2,
      },
      tag: {
        fontFamily: selectFont({ios: 'ChalkboardSE-Bold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '600',
        letterSpacing: 0.6,
      },
    },
    iconography: {
      style: 'sketch',
      strokeWidth: 2.5,
      effects: {
        shadow: false,
      },
    },
  },
  glass: {
    name: 'Glassmorphism',
    colors: {
      primary: 'rgba(255, 255, 255, 0.65)',
      secondary: 'rgba(255, 255, 255, 0.35)',
      accent: '#80D0FF',
      background: '#0F172A',
      surface: 'rgba(255, 255, 255, 0.18)',
      text: '#F8FAFF',
      textSecondary: '#C7D2FE',
      border: 'rgba(255, 255, 255, 0.25)',
      success: '#4ADE80',
      warning: '#FACC15',
      error: '#F87171',
    },
    dark: true,
    typography: {
      heading: {
        fontFamily: selectFont({ios: 'SFUIDisplay-Bold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '700',
        letterSpacing: 0.4,
      },
      body: {
        fontFamily: selectFont({ios: 'SFUIText-Regular', android: 'sans-serif', default: 'System'}, 'System'),
        fontWeight: '400',
        letterSpacing: 0.1,
      },
      tag: {
        fontFamily: selectFont({ios: 'SFUIText-Semibold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '600',
        letterSpacing: 0.5,
      },
    },
    iconography: {
      style: 'glass',
      strokeWidth: 1.6,
      effects: {
        gloss: true,
        shadow: false,
      },
    },
  },
  neumorphic: {
    name: 'Neumorphic',
    colors: {
      primary: '#E0E5EC',
      secondary: '#B8C2CC',
      accent: '#8FA0B3',
      background: '#E0E5EC',
      surface: '#E8EEF5',
      text: '#4A5568',
      textSecondary: '#6B7280',
      border: '#CAD4DF',
      success: '#6FCF97',
      warning: '#F2C94C',
      error: '#E57373',
    },
    dark: false,
    typography: {
      heading: {
        fontFamily: selectFont({ios: 'SFUIDisplay-Bold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '700',
        letterSpacing: 0.2,
      },
      body: {
        fontFamily: selectFont({ios: 'SFUIText-Regular', android: 'sans-serif', default: 'System'}, 'System'),
        fontWeight: '400',
      },
      tag: {
        fontFamily: selectFont({ios: 'SFUIText-Semibold', android: 'sans-serif-medium', default: 'System'}, 'System'),
        fontWeight: '600',
        letterSpacing: 0.3,
      },
    },
    iconography: {
      style: 'neumorphic',
      strokeWidth: 1.8,
      effects: {
        shadow: true,
        extruded: true,
      },
    },
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
