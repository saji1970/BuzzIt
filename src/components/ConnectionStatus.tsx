import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

const ConnectionStatus: React.FC = () => {
  const { theme } = useTheme();
  
  // Use hook normally - errors are handled inside the hook
  const { isConnected, connectionType, isLoading } = useConnectionStatus();

  const getStatusInfo = () => {
    try {
      if (isLoading) {
        return {
          icon: 'sync',
          text: 'Checking connection...',
          color: theme.colors.textSecondary,
          bgColor: theme.colors.surface,
        };
      }

      if (!isConnected) {
        return {
          icon: 'wifi-off',
          text: 'No connection',
          color: theme.colors.error,
          bgColor: theme.colors.error + '20',
        };
      }

      if (connectionType === 'railway') {
        return {
          icon: 'cloud',
          text: 'Railway API',
          color: theme.colors.primary,
          bgColor: theme.colors.primary + '20',
        };
      }

      if (connectionType === 'local') {
        return {
          icon: 'computer',
          text: 'Local API (Dev)',
          color: theme.colors.warning || '#FF9800',
          bgColor: (theme.colors.warning || '#FF9800') + '20',
        };
      }

      return {
        icon: 'wifi-off',
        text: 'Unknown',
        color: theme.colors.textSecondary,
        bgColor: theme.colors.surface,
      };
    } catch (error) {
      console.error('Error getting status info:', error);
      return {
        icon: 'wifi-off',
        text: 'Unknown',
        color: theme.colors.textSecondary,
        bgColor: theme.colors.surface,
      };
    }
  };

  try {
    const statusInfo = getStatusInfo();

    return (
      <View style={[styles.container, { backgroundColor: statusInfo.bgColor }]}>
        <View style={styles.content}>
          <Icon 
            name={statusInfo.icon} 
            size={16} 
            color={statusInfo.color}
            style={styles.icon}
          />
          <Text style={[styles.text, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>
    );
  } catch (error) {
    console.error('ConnectionStatus render error:', error);
    // Return null instead of crashing
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConnectionStatus;
