import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import {useTheme} from '../context/ThemeContext';
import {useUser} from '../context/UserContext';
import {useNavigation} from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import ApiService from '../services/APIService';

interface PrivacySettings {
  shareEmail: boolean;
  shareMobileNumber: boolean;
  shareLocation: boolean;
  shareBio: boolean;
  shareInterests: boolean;
}

interface ConnectedAccount {
  platform: string;
  username: string;
  profilePicture?: string;
  connectedAt: string;
}

const PrivacySettingsScreen: React.FC = () => {
  const {theme} = useTheme();
  const {user, setUser} = useUser();
  const navigation = useNavigation();
  const scrollViewRef = React.useRef<ScrollView>(null);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareEmail: false,
    shareMobileNumber: false,
    shareLocation: false,
    shareBio: true,
    shareInterests: true,
  });

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.privacySettings) {
      setPrivacySettings(user.privacySettings);
    }
    loadConnectedAccounts();
  }, [user]);

  const loadConnectedAccounts = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getConnectedSocialAccounts();
      if (response.success && response.accounts) {
        setConnectedAccounts(response.accounts);
      }
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyChange = async (key: keyof PrivacySettings, value: boolean) => {
    const updatedSettings = {...privacySettings, [key]: value};
    setPrivacySettings(updatedSettings);

    if (user) {
      setSaving(true);
      try {
        const response = await ApiService.updateUser(user.id, {
          privacySettings: updatedSettings,
        });

        if (response.success && response.data) {
          setUser({...user, privacySettings: updatedSettings});
        }
      } catch (error) {
        console.error('Error updating privacy settings:', error);
        // Log error but don't show alert
        setPrivacySettings(privacySettings);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleConnectSocialMedia = async (platform: string) => {
    try {
      const response = await ApiService.getSocialAuthUrl(platform);
      if (response.success && response.authUrl) {
        // Show info that OAuth is not fully implemented yet
        Alert.alert(
          `${platform.charAt(0).toUpperCase() + platform.slice(1)} Integration`,
          'Social media integration is being configured. This feature will be available soon!\n\nWhat you can do:\n• Share buzzes manually\n• Export content to share\n• Stay tuned for updates',
          [{text: 'Got it'}]
        );
        console.log(`${platform} auth URL:`, response.authUrl);
      } else {
        // Show user-friendly message instead of technical error
        Alert.alert(
          'Feature Not Available',
          `Social media integration for ${platform} is currently being set up and will be available soon!\n\nIn the meantime, you can still share your buzzes manually.`,
          [{text: 'OK'}]
        );
        console.error(`Failed to get ${platform} auth URL:`, response.error);
      }
    } catch (error) {
      // Show user-friendly error
      Alert.alert(
        'Coming Soon',
        `We're working on ${platform} integration! This feature will be available in a future update.`,
        [{text: 'OK'}]
      );
      console.error(`Error connecting to ${platform}:`, error);
    }
  };

  const handleDisconnectSocialMedia = async (platform: string) => {
    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect your ${platform} account?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.disconnectSocialAccount(platform);
              if (response.success) {
                setConnectedAccounts(connectedAccounts.filter(acc => acc.platform !== platform));
                // Success handled silently - no alert
              } else {
                // Log error but don't show alert
                console.error(`Failed to disconnect ${platform}:`, response.error);
              }
            } catch (error) {
              // Log error but don't show alert
              console.error(`Error disconnecting ${platform}:`, error);
            }
          },
        },
      ]
    );
  };

  const renderPrivacySwitch = (
    label: string,
    description: string,
    key: keyof PrivacySettings,
    index: number
  ) => (
    <Animatable.View
      key={key}
      animation="fadeInUp"
      delay={index * 100}
      style={[styles.settingItem, {backgroundColor: theme.colors.surface}]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, {color: theme.colors.text}]}>
          {label}
        </Text>
        <Text style={[styles.settingDescription, {color: theme.colors.textSecondary}]}>
          {description}
        </Text>
      </View>
      <Switch
        value={privacySettings[key]}
        onValueChange={value => handlePrivacyChange(key, value)}
        trackColor={{false: theme.colors.border, true: theme.colors.primary}}
        thumbColor="#FFFFFF"
      />
    </Animatable.View>
  );

  const renderSocialAccount = (platform: string, index: number) => {
    const connected = connectedAccounts.find(acc => acc.platform === platform);
    const platformIcons = {
      facebook: 'facebook',
      instagram: 'photo-camera',
      snapchat: 'camera',
    };

    return (
      <Animatable.View
        key={platform}
        animation="fadeInUp"
        delay={index * 100}
        style={[styles.socialAccountItem, {backgroundColor: theme.colors.surface}]}>
        <View style={styles.socialAccountLeft}>
          <View style={[styles.socialIcon, {backgroundColor: theme.colors.primary}]}>
            <Icon name={platformIcons[platform as keyof typeof platformIcons] || 'link'} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.socialAccountInfo}>
            <Text style={[styles.socialAccountName, {color: theme.colors.text}]}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Text>
            {connected ? (
              <Text style={[styles.socialAccountStatus, {color: theme.colors.primary}]}>
                Connected as @{connected.username}
              </Text>
            ) : (
              <Text style={[styles.socialAccountStatus, {color: theme.colors.textSecondary}]}>
                Not connected
              </Text>
            )}
          </View>
        </View>
        {connected ? (
          <TouchableOpacity
            style={[styles.disconnectButton, {borderColor: theme.colors.error}]}
            onPress={() => handleDisconnectSocialMedia(platform)}>
            <Text style={[styles.disconnectButtonText, {color: theme.colors.error}]}>
              Disconnect
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.connectButton, {backgroundColor: theme.colors.primary}]}
            onPress={() => handleConnectSocialMedia(platform)}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
      </Animatable.View>
    );
  };

  return (
    <ScreenContainer
      title="Privacy & Social"
      subtitle="Manage your privacy and connected accounts"
      onBackPress={() => navigation.goBack()}
      onScrollDownPress={() => scrollViewRef.current?.scrollToEnd({animated: true})}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Settings */}
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Privacy Settings
          </Text>
          <Text style={[styles.sectionSubtitle, {color: theme.colors.textSecondary}]}>
            Control what information is visible to other users
          </Text>
          {renderPrivacySwitch(
            'Share Email',
            'Allow other users to see your email address',
            'shareEmail',
            0
          )}
          {renderPrivacySwitch(
            'Share Mobile Number',
            'Allow other users to see your mobile number',
            'shareMobileNumber',
            1
          )}
          {renderPrivacySwitch(
            'Share Location',
            'Allow other users to see your city and country',
            'shareLocation',
            2
          )}
          {renderPrivacySwitch(
            'Share Bio',
            'Show your bio on your public profile',
            'shareBio',
            3
          )}
          {renderPrivacySwitch(
            'Share Interests',
            'Show your interests on your public profile',
            'shareInterests',
            4
          )}
        </Animatable.View>

        {/* Social Media Integration */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            Social Media Integration
          </Text>
          <Text style={[styles.sectionSubtitle, {color: theme.colors.textSecondary}]}>
            Connect your social media accounts to share your buzzes
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <>
              {renderSocialAccount('facebook', 0)}
              {renderSocialAccount('instagram', 1)}
              {renderSocialAccount('snapchat', 2)}
            </>
          )}
        </Animatable.View>

        {saving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.savingText, {color: theme.colors.textSecondary}]}>
              Saving...
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  settingContent: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  socialAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  socialAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  socialAccountInfo: {
    flex: 1,
  },
  socialAccountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  socialAccountStatus: {
    fontSize: 12,
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  savingText: {
    marginLeft: 10,
    fontSize: 14,
  },
});

export default PrivacySettingsScreen;
