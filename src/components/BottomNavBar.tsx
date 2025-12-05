import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}

interface BottomNavBarProps {
  items: NavItem[];
  activeItemId: string;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({items, activeItemId}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          paddingBottom: Math.max(insets.bottom, 8),
          shadowColor: theme.colors.text,
        },
      ]}>
      {items.map(item => {
        const isActive = item.id === activeItemId;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={item.onPress}
            activeOpacity={0.7}>
            {/* Icon Container */}
            <View
              style={[
                styles.iconContainer,
                isActive && {backgroundColor: theme.colors.primary},
              ]}>
              <Icon
                name={item.icon}
                size={24}
                color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
              />
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.text : theme.colors.textSecondary,
                  fontWeight: isActive ? '700' : '400',
                },
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});

export default BottomNavBar;
