import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserTypeSelectionScreenProps {
  onBackPress: () => void;
  onContinue: (userType: 'property_owner' | 'contractor') => void;
}

export default function UserTypeSelectionScreen({ onBackPress, onContinue }: UserTypeSelectionScreenProps) {
  const [selectedType, setSelectedType] = useState<'property_owner' | 'contractor' | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      onContinue(selectedType);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
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
            !selectedType && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
});
