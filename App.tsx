import React, {useEffect, useRef} from 'react';
import {NavigationContainer, DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar, View, Text, StyleSheet, Platform, Linking, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SocialMediaService, {SocialPlatform} from './src/services/SocialMediaService';

import {ThemeProvider, Theme, ThemeLayout} from './src/context/ThemeContext';
import {UserProvider} from './src/context/UserContext';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {FeatureProvider} from './src/context/FeatureContext';
import HomeScreen from './src/screens/HomeScreen';
import MyBuzzScreen from './src/screens/MyBuzzScreen';
import CreateBuzzScreen from './src/screens/CreateBuzzScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import CreateProfileScreen from './src/screens/CreateProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import GoBuzzLiveScreen from './src/screens/GoBuzzLiveScreen';
import StreamViewerScreen from './src/screens/StreamViewerScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import BuzzerProfileScreen from './src/screens/BuzzerProfileScreen';
import ChannelsScreen from './src/screens/ChannelsScreen';
import {useTheme} from './src/context/ThemeContext';
import {createStackNavigator} from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const {theme} = useTheme();
  const {isAdmin} = useAuth();

  const layout = theme.layout;

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          let iconName: string;

          switch (route.name) {
            case 'MyBuzz':
              iconName = 'article';
              break;
            case 'Home':
              iconName = 'home';
              break;
            case 'Channels':
              iconName = 'live-tv';
              break;
            case 'Create':
              iconName = 'add-circle-outline';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'Admin':
              iconName = 'admin-panel-settings';
              break;
            default:
              iconName = 'home';
          }

          const baseStyle = [
            styles.tabIconWrapper,
            focused && {backgroundColor: theme.colors.primary + '1A'},
          ];

          return (
            <View style={baseStyle}>
              <Icon
                name={iconName}
                size={focused ? 22 : 20}
                color={focused ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
        },
        tabBarStyle: getTabBarStyle(theme),
        tabBarItemStyle: {
          paddingVertical: 6,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.96)',
              'rgba(255,255,255,0.88)',
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFillObject}
          />
        ),
        tabBarHideOnKeyboard: true,
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyBuzz" component={MyBuzzScreen} />
      <Tab.Screen name="Channels" component={ChannelsScreen} />
      <Tab.Screen name="Create" component={CreateBuzzScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminDashboardScreen} />}
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const {theme} = useTheme();
  const {isAuthenticated, isLoading} = useAuth();
  const navigationRef = useRef<any>(null);
  const linkingRef = useRef({
    prefixes: [
      'com.buzzit.app://',
      'https://buzzit-production.up.railway.app',
      'buzzit://',
    ],
    config: {
      screens: {
        MainTabs: {
          screens: {
            Settings: 'settings',
          },
        },
        PrivacySettings: 'settings/privacy',
        OAuthCallback: {
          path: 'oauth/callback/:platform',
          parse: {
            platform: (platform: string) => platform.toLowerCase(),
          },
        },
      },
    },
    async getInitialURL() {
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();
      if (url != null) {
        return url;
      }
    },
    subscribe(listener: (url: string) => void) {
      // Listen to incoming links from deep linking
      const onReceiveURL = ({url}: {url: string}) => {
        listener(url);
      };

      // Listen to URL events
      const subscription = Linking.addEventListener('url', onReceiveURL);

      return () => {
        subscription.remove();
      };
    },
  });

  // Handle deep links for OAuth callbacks
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      try {
        // Check if it's an OAuth callback
        if (url.includes('/oauth/callback') || url.includes('?code=') || url.includes('oauth')) {
          // Extract platform from URL
          let platform: SocialPlatform | null = null;
          const urlLower = url.toLowerCase();
          
          if (urlLower.includes('facebook')) {
            platform = 'facebook';
          } else if (urlLower.includes('instagram')) {
            platform = 'instagram';
          } else if (urlLower.includes('snapchat')) {
            platform = 'snapchat';
          }

          if (platform) {
            console.log(`[App] Handling OAuth callback for ${platform}`);
            const result = await SocialMediaService.handleOAuthCallback(platform, url);
            if (result.success) {
              Alert.alert(
                'Success',
                `Successfully connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`,
                [{text: 'OK'}]
              );
              // Navigate to Privacy Settings to show updated status
              if (navigationRef.current?.isReady()) {
                navigationRef.current.navigate('PrivacySettings');
              }
            } else {
              Alert.alert('Connection Failed', result.error || 'Failed to complete connection.');
            }
          } else {
            console.warn('[App] Could not determine platform from OAuth callback URL:', url);
          }
        }
      } catch (error: any) {
        console.error('[App] Error handling deep link:', error);
        Alert.alert('Error', 'Failed to process OAuth callback. Please try again.');
      }
    };

    // Handle initial URL
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          handleDeepLink(url);
        }
      })
      .catch(err => console.error('[App] Error getting initial URL:', err));

    // Listen for incoming URLs
    const subscription = Linking.addEventListener('url', ({url}) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const navTheme = React.useMemo(() => {
    return {
      ...NavigationDefaultTheme,
      colors: {
        ...NavigationDefaultTheme.colors,
        background: 'transparent',
        card: 'transparent',
        border: 'transparent',
        text: theme.colors.text,
        primary: theme.colors.primary,
      },
    };
  }, [theme]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={theme.gradients?.background || [theme.colors.background, theme.colors.background]}
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <StatusBar
          translucent
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
        />
        <Text style={{color: theme.colors.text, fontSize: 18}}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients?.background || [theme.colors.background, theme.colors.background]}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={appGradientStyle}>
      <StatusBar
        translucent
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />
      <NavigationContainer
        ref={navigationRef}
        theme={navTheme}
        linking={linkingRef.current}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="GoBuzzLive" component={GoBuzzLiveScreen} />
              <Stack.Screen name="StreamViewer" component={StreamViewerScreen} />
              <Stack.Screen name="BuzzerProfile" component={BuzzerProfileScreen} />
              <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </LinearGradient>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <FeatureProvider>
        <AuthProvider>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </AuthProvider>
      </FeatureProvider>
    </ThemeProvider>
  );
};

export default App;

const appGradientStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
}).container;

const getTabBarStyle = (theme: Theme) => {
  const layout = theme.layout;
  return {
    position: 'absolute' as const,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    paddingHorizontal: layout?.spacing?.lg || 18,
    height: Platform.OS === 'ios' ? 88 : 78,
    marginHorizontal: layout?.spacing?.xl || 24,
    marginBottom: layout?.spacing?.xl || 24,
    borderRadius: layout?.radii?.xl || 26,
    paddingVertical: layout?.spacing?.sm || 8,
    shadowColor: 'rgba(15,23,42,0.12)',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 22,
  };
};

const styles = StyleSheet.create({
  tabIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
