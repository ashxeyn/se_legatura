// @ts-nocheck
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  Animated,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ProfilePictureScreenProps {
  onBackPress: () => void;
  onComplete: (profileData: ProfileData) => void;
  onSkip: () => void;
}

interface ProfileData {
  profileImageUri?: string;
}

const { width } = Dimensions.get('window');

export default function ProfilePictureScreen({
  onBackPress,
  onComplete,
  onSkip
}: ProfilePictureScreenProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestPermissions = useCallback(async () => {
    const [cameraStatus, libraryStatus] = await Promise.all([
      ImagePicker.requestCameraPermissionsAsync(),
      ImagePicker.requestMediaLibraryPermissionsAsync(),
    ]);

    if (cameraStatus.status !== 'granted' || libraryStatus.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to set your profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, []);

  const selectImage = useCallback(async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to add your profile picture',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
          style: 'default'
        },
        {
          text: 'Choose from Library',
          onPress: () => openGallery(),
          style: 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  }, []);

  const openCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);

        // Success animation
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [scaleAnim]);

  const openGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);

        // Success animation
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [scaleAnim]);


  const handleContinue = useCallback(() => {
    const profileData: ProfileData = {
      profileImageUri: profileImage || undefined,
    };
    onComplete(profileData);
  }, [profileImage, onComplete]);

  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can always complete your profile later in the settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: onSkip
        }
      ]
    );
  }, [onSkip]);


  return (
    <SafeAreaView style={styles.container}>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Add a profile picture and your date of birth to personalize your account
            </Text>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profileContainer}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <View style={styles.profileCircleContainer}>
              <Animated.View
                style={[
                  styles.profileCircle,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.placeholderProfile}>
                    <MaterialIcons name="person" size={80} color="#3B82F6" />
                  </View>
                )}

                {/* Edit Button */}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={selectImage}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={profileImage ? "edit" : "add-a-photo"}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </Animated.View>

              <Text style={styles.imageHint}>
                {profileImage ? 'Tap the edit button to change' : 'Tap the camera icon to add a photo'}
              </Text>
            </View>
          </View>


          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${profileImage ? 100 : 0}%`
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {profileImage ? 'Profile picture added' : 'Add a profile picture (optional)'}
            </Text>
          </View>
        </Animated.View>

      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            profileImage && styles.continueButtonActive
          ]}
          onPress={handleContinue}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            profileImage && styles.continueButtonTextActive
          ]}>
            Continue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 12,
    marginLeft: -12,
    borderRadius: 12,
  },
  content: {
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  profileContainer: {
    marginBottom: 40,
  },
  profileCircleContainer: {
    alignItems: 'center',
  },
  profileCircle: {
    position: 'relative',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderProfile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  imageHint: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  dateContainer: {
    marginBottom: 40,
  },
  dateButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  dateButtonFilled: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dateTextFilled: {
    color: '#1F2937',
  },
  ageText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  continueButtonActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});