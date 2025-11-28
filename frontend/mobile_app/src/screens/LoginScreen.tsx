// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth_service, login_data } from '../services/auth_service';

interface LoginScreenProps {
  on_back: () => void;
  on_login_success: (userData?: any) => void;
  on_signup: () => void;
}

export default function LoginScreen({ on_back, on_login_success, on_signup }: LoginScreenProps) {
  const [username, set_username] = useState('');
  const [password, set_password] = useState('');
  const [is_loading, set_is_loading] = useState(false);

  const handle_login = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    set_is_loading(true);

    try {
      const login_credentials: login_data = {
        username: username.trim(),
        password: password.trim(),
      };

      console.log('Attempting login with:', login_credentials);
      const response = await auth_service.login(login_credentials);

      console.log('Login response:', response);

      if (response.success) {
        // Extract user data from response
        const userData = response.data?.user || response.data;
        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => on_login_success(userData) }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll_content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={on_back} style={styles.back_button}>
            <Ionicons name="chevron-back" size={28} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logo_container}>
          <Image
            source={require('../../assets/images/logos/legatura-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.title_container}>
          <Text style={styles.title}>Login to Legatura</Text>
          <Text style={styles.subtitle}>Welcome back! Please enter your details.</Text>
        </View>

        {/* Form */}
        <View style={styles.form_container}>
          <View style={styles.input_container}>
            <Text style={styles.label}>Username or Email *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={set_username}
              placeholder="Enter your username or email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!is_loading}
            />
          </View>

          <View style={styles.input_container}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={set_password}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!is_loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.login_button, is_loading && styles.button_disabled]}
            onPress={handle_login}
            disabled={is_loading}
          >
            <Text style={styles.login_button_text}>
              {is_loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footer_text}>
            Don't have an account?{' '}
            <Text style={styles.link_text} onPress={on_signup}>Sign up here</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  scroll_content: {
    flexGrow: 1,
    paddingHorizontal: 30,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back_button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo_container: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 60,
  },
  title_container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  form_container: {
    marginBottom: 40,
  },
  input_container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
  },
  login_button: {
    backgroundColor: '#EC7E00',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#EC7E00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  login_button_text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  button_disabled: {
    opacity: 0.6,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footer_text: {
    fontSize: 16,
    color: '#666666',
  },
  link_text: {
    color: '#EC7E00',
    fontWeight: '600',
  },
});