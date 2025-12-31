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
import SocialMediaService, {SocialAccount, SocialPlatform} from '../services/SocialMediaService';

interface PrivacySettings {
  shareEmail: boolean;
  shareMobileNumber: boolean;
  shareLocation: boolean;
  shareBio: boolean;
  shareInterests: boolean;
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

  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);

  useEffect(() => {
    if (user?.privacySettings) {
      setPrivacySettings(user.privacySettings);
    }
    loadConnectedAccounts();
  }, [user]);

  const loadConnectedAccounts = async () => {
    setLoading(true);
    try {
      const accounts = await SocialMediaService.getConnectedAccounts();
      setConnectedAccounts(accounts);
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

  const handleConnectSocialMedia = async (platform: SocialPlatform) => {
    setConnectingPlatform(platform);
    try {
      const result = await SocialMediaService.connectPlatform(
        platform,
        async (success, error) => {
          setConnectingPlatform(null);
          if (success) {
            // Reload accounts
            await loadConnectedAccounts();
            Alert.alert(
              'Success',
              `Successfully connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`,
              [{text: 'OK'}]
            );
          } else {
            Alert.alert(
              'Connection Failed',
              error || `Failed to connect to ${platform}. Please try again.`,
              [{text: 'OK'}]
            );
          }
        }
      );

      if (!result.success) {
        setConnectingPlatform(null);
        Alert.alert(
          'Connection Error',
          result.error || `Failed to start ${platform} connection. Please try again.`,
          [{text: 'OK'}]
        );
      } else {
        // Show instruction to complete OAuth in browser
        Alert.alert(
          'Complete Connection',
          `Please complete the ${platform.charAt(0).toUpperCase() + platform.slice(1)} authentication in your browser. You'll be redirected back to the app when done.`,
          [{text: 'OK'}]
        );
      }
    } catch (error: any) {
      setConnectingPlatform(null);
      console.error(`Error connecting to ${platform}:`, error);
      Alert.alert(
        'Error',
        `Failed to connect to ${platform}. ${error.message || 'Please try again.'}`,
        [{text: 'OK'}]
      );
    }
  };

  const handleDisconnectSocialMedia = async (platform: SocialPlatform) => {
    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect your ${platform.charAt(0).toUpperCase() + platform.slice(1)} account?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await SocialMediaService.disconnectPlatform(platform);
              if (result.success) {
                await loadConnectedAccounts();
                Alert.alert('Success', `Disconnected from ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`);
              } else {
                Alert.alert(
                  'Error',
                  result.error || `Failed to disconnect ${platform}. Please try again.`
                );
              }
            } catch (error: any) {
              console.error(`Error disconnecting ${platform}:`, error);
              Alert.alert('Error', `Failed to disconnect ${platform}. Please try again.`);
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

  const renderSocialAccount = (platform: SocialPlatform, index: number) => {
    const connected = connectedAccounts.find(acc => acc.platform === platform);
    const isConnecting = connectingPlatform === platform;
    const platformIcons = {
      facebook: 'facebook',
      instagram: 'photo-camera',
      snapchat: 'camera',
    };

    const getStatusText = () => {
      if (!connected) return 'Not connected';
      if (connected.status === 'expired') return 'Token expired - Reconnect needed';
      if (connected.status === 'error') return 'Connection error - Reconnect needed';
      return `Connected as @${connected.username}`;
    };

    const getStatusColor = () => {
      if (!connected) return theme.colors.textSecondary;
      if (connected.status === 'expired' || connected.status === 'error') return theme.colors.error;
      return theme.colors.primary;
    };

    return (
      <Animatable.View
        key={platform}
        animation="fadeInUp"
        delay={index * 100}
        style={[styles.socialAccountItem, {backgroundColor: theme.colors.surface}]}>
        <View style={styles.socialAccountLeft}>
          <View style={[styles.socialIcon, {backgroundColor: theme.colors.primary}]}>
            <Icon name={platformIcons[platform] || 'link'} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.socialAccountInfo}>
            <Text style={[styles.socialAccountName, {color: theme.colors.text}]}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Text>
            <Text style={[styles.socialAccountStatus, {color: getStatusColor()}]}>
              {isConnecting ? 'Connecting...' : getStatusText()}
            </Text>
          </View>
        </View>
        {connected && connected.isConnected && connected.status === 'connected' ? (
          <TouchableOpacity
            style={[styles.disconnectButton, {borderColor: theme.colors.error}]}
            onPress={() => handleDisconnectSocialMedia(platform)}
            disabled={isConnecting}>
            <Text style={[styles.disconnectButtonText, {color: theme.colors.error}]}>
              Disconnect
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.connectButton,
              {
                backgroundColor: isConnecting ? theme.colors.textSecondary : theme.colors.primary,
                opacity: isConnecting ? 0.6 : 1,
              },
            ]}
            onPress={() => handleConnectSocialMedia(platform)}
            disabled={isConnecting}>
            {isConnecting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.connectButtonText}>
                {connected?.status === 'expired' || connected?.status === 'error' ? 'Reconnect' : 'Connect'}
              </Text>
            )}
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
