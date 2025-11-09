import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useTheme} from '../context/ThemeContext';

export type BuzzitButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface BuzzitButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: BuzzitButtonVariant;
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const BuzzitButton: React.FC<BuzzitButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
}) => {
  const {theme} = useTheme();
  const layout = theme.layout;

  const content = (
    <View style={[styles.content, icon ? styles.contentWithIcon : null]}>
      {icon ? (
        <Icon
          name={icon}
          size={18}
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary}
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          {
            color:
              variant === 'primary'
                ? '#FFFFFF'
                : variant === 'secondary'
                ? theme.colors.text
                : theme.colors.primary,
          },
        ]}>
        {label}
      </Text>
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        disabled={disabled}
        style={[styles.buttonBase, style, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={theme.gradients?.accent || [theme.colors.primary, theme.colors.secondary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.gradient, {borderRadius: layout?.radii?.pill || 999}]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const backgroundColor =
    variant === 'secondary'
      ? 'rgba(255,255,255,0.85)'
      : variant === 'outline'
      ? 'transparent'
      : 'transparent';
  const borderColor =
    variant === 'outline' ? theme.colors.border : 'transparent';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.buttonBase,
        {
          backgroundColor,
          borderRadius: layout?.radii?.pill || 999,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor,
        },
        style,
        disabled && styles.disabled,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(47,128,255,0.35)',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  contentWithIcon: {
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  icon: {
    marginRight: 10,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default BuzzitButton;
