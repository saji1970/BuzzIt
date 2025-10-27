import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import {useNavigation} from '@react-navigation/native';

import {useTheme} from '../context/ThemeContext';
import {useAuth} from '../context/AuthContext';
import {testNetworkConnection, testExternalConnection} from '../utils/NetworkTest';

const LoginScreen: React.FC = () => {
  const {theme} = useTheme();
  const {login, isLoading} = useAuth();
  const navigation = useNavigation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    const result = await login(username.trim(), password);
    
    if (result.success) {
      Alert.alert('Success', 'Welcome back! 🎉');
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <Text style={styles.headerSubtitle}>Sign in to continue buzzing</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Username */}
        <Animatable.View animation="fadeInUp" delay={100}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Username</Text>
          <View style={[styles.inputContainer, {backgroundColor: theme.colors.surface}]}>
            <Icon name="person" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Enter your username"
              placeholderTextColor={theme.colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </Animatable.View>

        {/* Password */}
        <Animatable.View animation="fadeInUp" delay={200}>
          <Text style={[styles.label, {color: theme.colors.text}]}>Password</Text>
          <View style={[styles.inputContainer, {backgroundColor: theme.colors.surface}]}>
            <Icon name="lock" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}>
              <Icon 
                name={showPassword ? "visibility-off" : "visibility"} 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Login Button */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <TouchableOpacity
            style={[styles.loginButton, {opacity: isLoading ? 0.7 : 1}]}
            onPress={handleLogin}
            disabled={isLoading}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.loginButtonGradient}>
              {isLoading ? (
                <Text style={styles.loginButtonText}>Signing In...</Text>
              ) : (
                <>
                  <Icon name="login" size={24} color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* Network Test Button */}
        <Animatable.View animation="fadeInUp" delay={350}>
          <TouchableOpacity
            style={[styles.testButton, {backgroundColor: theme.colors.surface}]}
            onPress={async () => {
              const localTest = await testNetworkConnection();
              const externalTest = await testExternalConnection();
              Alert.alert(
                'Network Test Results',
                `Local API: ${localTest.success ? `✅ Working (${localTest.url})` : `❌ Failed (${localTest.error})`}\nExternal API: ${externalTest ? '✅ Working' : '❌ Failed'}`
              );
            }}>
            <Text style={[styles.testButtonText, {color: theme.colors.text}]}>
              Test Network Connection
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Register Link */}
        <Animatable.View animation="fadeInUp" delay={400}>
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, {color: theme.colors.textSecondary}]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreateProfile' as never)}>
              <Text style={[styles.registerLink, {color: theme.colors.primary}]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  eyeButton: {
    padding: 5,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 30,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
