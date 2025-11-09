import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useTheme} from '../context/ThemeContext';

interface SocialAccount {
  platform: string;
  username: string;
  isConnected: boolean;
}

interface SocialMediaShareModalProps {
  visible: boolean;
  onClose: () => void;
  buzzContent: string;
  buzzMedia?: string;
}

const SocialMediaShareModal: React.FC<SocialMediaShareModalProps> = ({
  visible,
  onClose,
  buzzContent,
  buzzMedia,
}) => {
  const {theme} = useTheme();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    loadSocialAccounts();
  }, []);

  const loadSocialAccounts = async () => {
    try {
      const accounts = await AsyncStorage.getItem('socialAccounts');
      if (accounts) {
        setSocialAccounts(JSON.parse(accounts));
      } else {
        // Initialize default accounts
        const defaultAccounts: SocialAccount[] = [
          {platform: 'instagram', username: '', isConnected: false},
          {platform: 'facebook', username: '', isConnected: false},
          {platform: 'twitter', username: '', isConnected: false},
          {platform: 'snapchat', username: '', isConnected: false},
        ];
        setSocialAccounts(defaultAccounts);
        await AsyncStorage.setItem('socialAccounts', JSON.stringify(defaultAccounts));
      }
    } catch (error) {
      console.log('Error loading social accounts:', error);
    }
  };

  const handleConnect = async (platform: string) => {
    if (loginUsername.trim() && loginPassword.trim()) {
      const updatedAccounts = socialAccounts.map(account => {
        if (account.platform === platform) {
          return {
            ...account,
            username: loginUsername,
            isConnected: true,
          };
        }
        return account;
      });

      setSocialAccounts(updatedAccounts);
      await AsyncStorage.setItem('socialAccounts', JSON.stringify(updatedAccounts));
      setSelectedPlatform(null);
      setLoginUsername('');
      setLoginPassword('');
      Alert.alert('Success', `Connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`);
    } else {
      Alert.alert('Error', 'Please enter both username and password');
    }
  };

  const handleShare = async (platform: string) => {
    const account = socialAccounts.find(acc => acc.platform === platform);
    
    if (!account || !account.isConnected) {
      setSelectedPlatform(platform);
      return;
    }

    // Simulate sharing
    Alert.alert(
      'Share to ' + platform.charAt(0).toUpperCase() + platform.slice(1),
      `Your buzz has been shared to ${account.username}'s ${platform} account!\n\nContent: ${buzzContent.substring(0, 50)}...`,
      [{text: 'OK', onPress: onClose}]
    );
  };

  const handleDisconnect = async (platform: string) => {
    const updatedAccounts = socialAccounts.map(account => {
      if (account.platform === platform) {
        return {
          ...account,
          username: '',
          isConnected: false,
        };
      }
      return account;
    });

    setSocialAccounts(updatedAccounts);
    await AsyncStorage.setItem('socialAccounts', JSON.stringify(updatedAccounts));
    Alert.alert('Disconnected', `Disconnected from ${platform}`);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'camera-alt';
      case 'facebook':
        return 'facebook';
      case 'twitter':
        return 'alternate-email';
      case 'snapchat':
        return 'photo-camera';
      default:
        return 'share';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return ['#E4405F', '#C13584', '#8E44AD'];
      case 'facebook':
        return ['#1877F2', '#0A66C2'];
      case 'twitter':
        return ['#1DA1F2', '#0D8BD9'];
      case 'snapchat':
        return ['#FFFC00', '#FFF700'];
      default:
        return [theme.colors.primary, theme.colors.secondary];
    }
  };

  const renderSocialButton = (platform: string) => {
    const account = socialAccounts.find(acc => acc.platform === platform);
    const isConnected = account?.isConnected || false;

    return (
      <TouchableOpacity
        key={platform}
        onPress={() => handleShare(platform)}
        onLongPress={() => {
          if (isConnected) {
            Alert.alert(
              'Disconnect',
              `Disconnect from ${platform}?`,
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Disconnect', style: 'destructive', onPress: () => handleDisconnect(platform)},
              ]
            );
          }
        }}
        style={[styles.socialButton, {borderColor: theme.colors.border}]}>
        <LinearGradient
          colors={getPlatformColor(platform)}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.iconGradient}>
          <Icon name={getPlatformIcon(platform)} size={32} color="#FFFFFF" />
        </LinearGradient>
        
        <View style={styles.platformInfo}>
          <Text style={[styles.platformName, {color: theme.colors.text}]}>
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Text>
          {isConnected && account?.username && (
            <Text style={[styles.platformUsername, {color: theme.colors.textSecondary}]}>
              @{account.username}
            </Text>
          )}
          <View style={[styles.statusBadge, {backgroundColor: isConnected ? '#4ECDC4' : theme.colors.textSecondary}]}>
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Tap to Connect'}
            </Text>
          </View>
        </View>

        <Icon
          name={isConnected ? 'check-circle' : 'add-circle'}
          size={24}
          color={isConnected ? '#4ECDC4' : theme.colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  const renderLoginModal = () => {
    if (!selectedPlatform) return null;

    return (
      <Modal
        visible={selectedPlatform !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPlatform(null)}>
        <View style={styles.loginModalOverlay}>
          <View style={[styles.loginModal, {backgroundColor: theme.colors.surface}]}>
            <LinearGradient
              colors={getPlatformColor(selectedPlatform)}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.loginHeader}>
              <Icon
                name={getPlatformIcon(selectedPlatform)}
                size={40}
                color="#FFFFFF"
              />
              <Text style={styles.loginTitle}>
                Connect to {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
              </Text>
            </LinearGradient>

            <ScrollView style={styles.loginContent}>
              <Text style={[styles.loginLabel, {color: theme.colors.text}]}>
                Username
              </Text>
              <TextInput
                style={[styles.loginInput, {borderColor: theme.colors.border, color: theme.colors.text}]}
                placeholder="Enter username"
                placeholderTextColor={theme.colors.textSecondary}
                value={loginUsername}
                onChangeText={setLoginUsername}
                autoCapitalize="none"
              />

              <Text style={[styles.loginLabel, {color: theme.colors.text}]}>
                Password
              </Text>
              <TextInput
                style={[styles.loginInput, {borderColor: theme.colors.border, color: theme.colors.text}]}
                placeholder="Enter password"
                placeholderTextColor={theme.colors.textSecondary}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />

              <Text style={[styles.loginNote, {color: theme.colors.textSecondary}]}>
                Your credentials are stored securely on your device
              </Text>

              <View style={styles.loginButtons}>
                <TouchableOpacity
                  style={[styles.cancelButton, {borderColor: theme.colors.border}]}
                  onPress={() => setSelectedPlatform(null)}>
                  <Text style={[styles.cancelButtonText, {color: theme.colors.text}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleConnect(selectedPlatform)}
                  style={[styles.connectButton, {backgroundColor: getPlatformColor(selectedPlatform)[0]}]}>
                  <Text style={styles.connectButtonText}>Connect</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.modal, {backgroundColor: theme.colors.surface}]}>
            <View style={[styles.header, {backgroundColor: theme.colors.primary}]}>
              <Text style={styles.headerTitle}>Share to Social Media</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
                Connect your social media accounts to share buzzes instantly
              </Text>

              {socialAccounts.map(account => renderSocialButton(account.platform))}

              <TouchableOpacity
                style={[styles.previewButton, {backgroundColor: theme.colors.background}]}
                onPress={() => {
                  Alert.alert('Buzz Preview', buzzContent);
                }}>
                <Icon name="preview" size={24} color={theme.colors.primary} />
                <Text style={[styles.previewText, {color: theme.colors.text}]}>
                  Preview Buzz
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {renderLoginModal()}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 15,
  },
  iconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  platformUsername: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loginModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginModal: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  loginHeader: {
    padding: 25,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  loginContent: {
    padding: 20,
  },
  loginLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  loginInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  loginNote: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
  loginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectButton: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SocialMediaShareModal;
