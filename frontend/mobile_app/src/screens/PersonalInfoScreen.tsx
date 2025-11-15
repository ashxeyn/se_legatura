import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { OCCUPATIONS } from '../data/occupations';

interface PersonalInfoScreenProps {
  onBackPress: () => void;
  onNext: (personalInfo: PersonalInfo) => void;
  initialData?: PersonalInfo | null;
}

export interface PersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  occupation: string;
  dateOfBirth: string;
  contactNumber: string;
}

export default function PersonalInfoScreen({ onBackPress, onNext, initialData }: PersonalInfoScreenProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [middleName, setMiddleName] = useState(initialData?.middleName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [occupation, setOccupation] = useState(initialData?.occupation || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || '');
  const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || '');

  // Date picker states
  const [selectedDate, setSelectedDate] = useState(() => {
    if (initialData?.dateOfBirth) {
      return new Date(initialData.dateOfBirth);
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Occupation selector states
  const [showOccupationModal, setShowOccupationModal] = useState(false);
  const [occupationSearch, setOccupationSearch] = useState('');
  const [filteredOccupations, setFilteredOccupations] = useState(OCCUPATIONS);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android

    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      setDateOfBirth(formattedDate);
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleOccupationSearch = (text: string) => {
    setOccupationSearch(text);
    if (text.trim() === '') {
      setFilteredOccupations(OCCUPATIONS);
    } else {
      const filtered = OCCUPATIONS.filter(occ =>
        occ.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredOccupations(filtered);
    }
  };

  const selectOccupation = (selectedOccupation: string) => {
    setOccupation(selectedOccupation);
    setOccupationSearch('');
    setFilteredOccupations(OCCUPATIONS);
    setShowOccupationModal(false);
  };

  const openOccupationModal = () => {
    setOccupationSearch('');
    setFilteredOccupations(OCCUPATIONS);
    setShowOccupationModal(true);
  };

  const isFormValid = () => {
    return firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      occupation.trim() !== '' &&
      dateOfBirth.trim() !== '' &&
      contactNumber.trim() !== '';
  };

  const handleNext = () => {
    if (!isFormValid()) {
      return;
    }

    const personalInfo: PersonalInfo = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      occupation: occupation.trim(),
      dateOfBirth: dateOfBirth.trim(),
      contactNumber: contactNumber.trim(),
    };

    onNext(personalInfo);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logos/legatura-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <Text style={[styles.progressText, styles.progressTextActive]}>Personal Information</Text>
          </View>
          <View style={styles.progressStep}>
            <View style={styles.progressBar} />
            <Text style={styles.progressText}>Account Setup</Text>
          </View>
          <View style={styles.progressStep}>
            <View style={styles.progressBar} />
            <Text style={styles.progressText}>Verification</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={middleName}
              onChangeText={setMiddleName}
              placeholder="Middle name (optional)"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dropdownContainer} onPress={openOccupationModal}>
              <View style={styles.dropdownInputWrapper}>
                <Text style={[styles.dropdownInputText, !occupation && styles.placeholderText]}>
                  {occupation || 'Occupation'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dateContainer} onPress={openDatePicker}>
              <View style={styles.dateInputWrapper}>
                <Text style={[styles.dateInputText, !dateOfBirth && styles.placeholderText]}>
                  {dateOfBirth || 'Date of birth'}
                </Text>
                <MaterialIcons name="event" size={24} color="#666666" style={styles.calendarIcon} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder="Contact no."
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !isFormValid() && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isFormValid()}
        >
          <Text style={[
            styles.nextButtonText,
            !isFormValid() && styles.nextButtonTextDisabled
          ]}>
            Next
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()} // Can't select future dates
          minimumDate={new Date(1930, 0, 1)} // Reasonable minimum date
        />
      )}

      {/* Occupation Selector Modal */}
      <Modal
        visible={showOccupationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOccupationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Occupation</Text>
              <TouchableOpacity
                onPress={() => setShowOccupationModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              value={occupationSearch}
              onChangeText={handleOccupationSearch}
              placeholder="Search occupations..."
              placeholderTextColor="#999"
              autoFocus
            />

            <FlatList
              data={filteredOccupations}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.occupationItem}
                  onPress={() => selectOccupation(item)}
                >
                  <Text style={styles.occupationText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.occupationList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 120,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    width: '100%',
    marginBottom: 8,
  },
  progressBarActive: {
    backgroundColor: '#EC7E00',
  },
  progressText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  progressTextActive: {
    color: '#333333',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
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
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
  },
  dropdownInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  dropdownInputText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  dateContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  calendarIcon: {
    marginLeft: 10,
  },
  placeholderText: {
    color: '#999999',
  },
  nextButton: {
    backgroundColor: '#EC7E00',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#EC7E00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    color: '#333333',
  },
  occupationList: {
    maxHeight: 400,
  },
  occupationItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  occupationText: {
    fontSize: 16,
    color: '#333333',
  },
});
