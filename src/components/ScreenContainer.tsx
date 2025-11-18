import React from 'react';
import {SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useTheme} from '../context/ThemeContext';

interface ScreenContainerProps {
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  onScrollDownPress?: () => void;
  rightAction?: React.ReactNode;
  headerChildren?: React.ReactNode;
  children: React.ReactNode;
  contentStyle?: ViewStyle;
  floatingHeader?: boolean;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  title,
  subtitle,
  onBackPress,
  onScrollDownPress,
  rightAction,
  headerChildren,
  children,
  contentStyle = {},
  floatingHeader = true,
}) => {
  const {theme} = useTheme();
  const layout = theme.layout;

  const gradientBackground = theme.gradients?.background || [theme.colors.background, theme.colors.background];
  const headerGradient = theme.gradients?.header || gradientBackground;

  return (
    <LinearGradient colors={gradientBackground} style={styles.flexOne}>
      <SafeAreaView style={styles.safeArea}>
        {floatingHeader ? (
          <LinearGradient colors={headerGradient} style={[styles.header, {borderRadius: layout?.radii?.xl || 24}]}> 
            <View style={styles.headerContent}>
              {onBackPress ? (
                <View style={styles.leadingActions}>
                  <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Icon name="arrow-back" size={22} color="#fff" />
                  </TouchableOpacity>
                  {onScrollDownPress ? (
                    <TouchableOpacity
                      onPress={onScrollDownPress}
                      style={styles.scrollDownButton}
                    >
                      <Icon name="south" size={22} color="#2F7BFF" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                <View style={styles.backButtonPlaceholder} />
              )}

              <View style={styles.headerTextContainer}>
                {title ? (
                  <Text style={[styles.headerTitle, {color: '#fff', fontFamily: theme.typography?.heading.fontFamily}]}> 
                    {title}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text style={[styles.headerSubtitle, {color: 'rgba(255,255,255,0.85)'}]}>{subtitle}</Text>
                ) : null}
                {headerChildren ? (
                  <View style={styles.headerExtras}>{headerChildren}</View>
                ) : null}
              </View>

              <View style={styles.rightSlot}>{rightAction}</View>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.spacer} />
        )}

        <View
          style={[
            styles.contentContainer,
            {paddingHorizontal: layout?.spacing?.xl || 24},
            contentStyle,
          ]}>
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: 'rgba(47,128,255,0.3)',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  leadingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  headerTextContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  headerExtras: {
    marginTop: 12,
  },
  rightSlot: {
    minWidth: 38,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollDownButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,123,255,0.15)',
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
  spacer: {
    height: 24,
  },
});

export default ScreenContainer;
