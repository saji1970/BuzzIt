import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {ThemeProvider} from './src/context/ThemeContext';
import {UserProvider} from './src/context/UserContext';
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
import {useTheme} from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();

const AppContent = () => {
  const {theme} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.primary}
      />
      <NavigationContainer>
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
                  iconName = 'play-circle';
                  break;
                case 'Radio':
                  iconName = 'radio';
                  break;
                case 'Profile':
                  iconName = 'person';
                  break;
                case 'Settings':
                  iconName = 'settings';
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
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <BuzzChannelProvider>
          <RadioChannelProvider>
            <AppContent />
          </RadioChannelProvider>
        </BuzzChannelProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
