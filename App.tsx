import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import {ThemeProvider} from './src/context/ThemeContext';
import {UserProvider} from './src/context/UserContext';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {FeatureProvider} from './src/context/FeatureContext';
import {BuzzChannelProvider} from './src/context/BuzzChannelContext';
import {RadioChannelProvider} from './src/context/RadioChannelContext';
import HomeScreen from './src/screens/HomeScreen';
import CreateBuzzScreen from './src/screens/CreateBuzzScreen';
import BuzzChannelScreen from './src/screens/BuzzChannelScreen';
import CreateChannelContentScreen from './src/screens/CreateChannelContentScreen';
import RadioChannelScreen from './src/screens/RadioChannelScreen';
import CreateRadioChannelScreen from './src/screens/CreateRadioChannelScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import CreateProfileScreen from './src/screens/CreateProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import {useTheme} from './src/context/ThemeContext';
import {useAuth} from './src/context/AuthContext';
import {createStackNavigator} from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const {theme} = useTheme();
  const {isAdmin} = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Create':
              iconName = 'add-circle';
              break;
            case 'Channel':
              iconName = 'video-library';
              break;
            case 'Radio':
              iconName = 'library-music';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            case 'Admin':
              iconName = 'admin-panel-settings';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create" component={CreateBuzzScreen} />
      <Tab.Screen name="Channel" component={BuzzChannelScreen} />
      <Tab.Screen name="Radio" component={RadioChannelScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminDashboardScreen} />}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const {theme} = useTheme();
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return null; // You could add a loading screen here
  }

  return (
    <>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.primary}
      />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isAuthenticated ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <FeatureProvider>
        <AuthProvider>
          <UserProvider>
            <BuzzChannelProvider>
              <RadioChannelProvider>
                <AppContent />
              </RadioChannelProvider>
            </BuzzChannelProvider>
          </UserProvider>
        </AuthProvider>
      </FeatureProvider>
    </ThemeProvider>
  );
};

export default App;
