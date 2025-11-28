// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth_service } from '../services/auth_service';

interface UserTypeSelectionScreenProps {
  onBackPress: () => void;
  onContinue: (userType: 'property_owner' | 'contractor', formData: any) => void;
}

export default function UserTypeSelectionScreen({ onBackPress, onContinue }: UserTypeSelectionScreenProps) {
  const [selectedType, setSelectedType] = useState<'property_owner' | 'contractor' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isLoadingFormData, setIsLoadingFormData] = useState(true);

  // Load form data when component mounts (same as Laravel web version)
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoadingFormData(true);
        const response = await auth_service.get_signup_form_data();

        if (response.success) {
          setFormData(response.data);
        } else {
          Alert.alert('Error', 'Failed to load form data. Please check your connection.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load form data. Please check your connection.');
      } finally {
        setIsLoadingFormData(false);
      }
    };

    loadFormData();
  }, []);

  const handleContinue = async () => {
    if (!selectedType || isLoading || !formData) return;

    try {
      setIsLoading(true);
      const response = await auth_service.select_role(selectedType);

      if (response.success) {
        // Pass both user type and pre-loaded form data to next screen
        onContinue(selectedType, formData);
      } else {
        Alert.alert('Error', response.message || 'Failed to select user type. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while fetching form data (like web version loading)
  if (isLoadingFormData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#EC7E00" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="chevron-back" size={28} color="#333333" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Who are you?</Text>
          <Text style={styles.subtitle}>
            Select whether you're a property owner or{'\n'}
            a contractor to continue.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'property_owner' && styles.optionCardSelected
            ]}
            onPress={() => setSelectedType('property_owner')}
          >
            <View style={[styles.iconContainer, styles.ownerIconContainer]}>
              <Image
                source={require('../../assets/images/icons/owner.png')}
                style={styles.optionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.optionTitle}>Property Owner</Text>
            <Text style={styles.optionDescription}>
              I want to post my construction project and receive contractor bids.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === 'contractor' && styles.optionCardSelected
            ]}
            onPress={() => setSelectedType('contractor')}
          >
            <View style={[styles.iconContainer, styles.contractorIconContainer]}>
              <Image
                source={require('../../assets/images/icons/contractor.png')}
                style={styles.optionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.optionTitle}>Contractor</Text>
            <Text style={styles.optionDescription}>
              I want to find projects and submit bids to property owners.
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedType || isLoading) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedType || isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Processing...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
    marginBottom: 40,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: '#EC7E00',
    backgroundColor: '#FFF8F0',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ownerIconContainer: {
    backgroundColor: '#E3F2FD',
  },
  contractorIconContainer: {
    backgroundColor: '#FFF3E0',
  },
  optionIcon: {
    width: 48,
    height: 48,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#EC7E00',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#EC7E00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});
