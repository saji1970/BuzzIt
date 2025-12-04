import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

import {useTheme} from '../context/ThemeContext';
import {useUser} from '../context/UserContext';
import {useAuth} from '../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import ScreenContainer from '../components/ScreenContainer';

const SettingsScreen: React.FC = () => {
  const {theme, setTheme, availableThemes} = useTheme();
  const {user, setUser} = useUser();
  const {logout} = useAuth();
  const navigation = useNavigation();
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout from AuthContext to clear auth state
              await logout();
              // Clear user from UserContext
            setUser(null);
              // Navigate to login screen and reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{name: 'Login' as never}],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your buzzes and profile data. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            setUser(null);
            Alert.alert('Success', 'All data cleared successfully!');
          },
        },
      ]
    );
  };

  const renderThemeOption = (themeName: string, index: number) => {
    const isSelected = theme.name === themeName;
    const themeColors = {
      default: ['#FF6B6B', '#4ECDC4'],
      neon: ['#FF0080', '#00FF80'],
      sunset: ['#FF8C42', '#FF6B9D'],
      ocean: ['#0984E3', '#00CEC9'],
      forest: ['#00B894', '#55A3FF'],
    };

    return (
      <Animatable.View
        key={themeName}
        animation="fadeInUp"
        delay={index * 100}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={() => setTheme(themeName)}>
          <LinearGradient
            colors={themeColors[themeName as keyof typeof themeColors] || ['#FF6B6B', '#4ECDC4']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.themePreview}>
            <Text style={styles.themeEmoji}>
              {themeName === 'default' && '🎨'}
              {themeName === 'neon' && '⚡'}
              {themeName === 'sunset' && '🌅'}
              {themeName === 'ocean' && '🌊'}
              {themeName === 'forest' && '🌲'}
            </Text>
          </LinearGradient>
          <View style={styles.themeInfo}>
            <Text style={[styles.themeName, {color: theme.colors.text}]}>
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </Text>
            <Text style={[styles.themeDescription, {color: theme.colors.textSecondary}]}>
              {themeName === 'default' && 'Classic vibrant colors'}
              {themeName === 'neon' && 'Electric neon vibes'}
              {themeName === 'sunset' && 'Warm sunset tones'}
              {themeName === 'ocean' && 'Cool ocean blues'}
              {themeName === 'forest' && 'Natural green tones'}
            </Text>
          </View>
          {isSelected && (
            <Icon name="check-circle" size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    index: number = 0,
    showArrow: boolean = true
  ) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}>
      <TouchableOpacity
        style={[styles.settingItem, {backgroundColor: theme.colors.surface}]}
        onPress={onPress}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, {backgroundColor: theme.colors.primary}]}>
            <Icon name={icon} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, {color: theme.colors.text}]}>
              {title}
            </Text>
            <Text style={[styles.settingSubtitle, {color: theme.colors.textSecondary}]}>
              {subtitle}
            </Text>
          </View>
        </View>
        {showArrow && (
          <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
        )}
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <ScreenContainer
      title="Settings"
      subtitle="Customize your experience"
      onBackPress={() => navigation.goBack()}
      onScrollDownPress={() => scrollViewRef.current?.scrollToEnd({animated: true})}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Selection */}
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Choose Your Theme
          </Text>
          <Text style={[styles.sectionSubtitle, {color: theme.colors.textSecondary}]}>
            Pick a theme that matches your vibe
          </Text>
          {availableThemes.map((themeName, index) =>
            renderThemeOption(themeName, index)
          )}
        </Animatable.View>

        {/* Account Settings */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Account
          </Text>
          {renderSettingItem(
            'person',
            'Edit Profile',
            'Update your profile information',
            () => {
              // Navigate to Profile tab
              navigation.navigate('Profile' as never);
            },
            0,
            true
          )}
          {renderSettingItem(
            'security',
            'Privacy & Social',
            'Manage privacy settings and social media connections',
            () => {
              navigation.navigate('PrivacySettings' as never);
            },
            1,
            true
          )}
        </Animatable.View>

        {/* Danger Zone */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.error}]}>
            Danger Zone
          </Text>
          {renderSettingItem(
            'exit-to-app',
            'Logout',
            'Sign out of your account',
            handleLogout,
            0,
            false
          )}
          {renderSettingItem(
            'delete-outline',
            'Clear All Data',
            'Delete all your data permanently',
            handleClearData,
            1,
            false
          )}
        </Animatable.View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 20,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 10,
  },
  themePreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  themeEmoji: {
    fontSize: 24,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },
});

export default SettingsScreen;
