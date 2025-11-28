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
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PropertyOwnerPersonalInfo as PersonalInfo } from './personalInfo';
import { AccountInfo } from './accountSetup';
import { VALID_ID_TYPES } from '../../data/validIdTypes';

interface VerificationScreenProps {
  onBackPress: () => void;
  onComplete: (verificationInfo: VerificationInfo) => void;
  personalInfo: PersonalInfo;
  accountInfo: AccountInfo;
  initialData?: VerificationInfo | null;
}

export interface VerificationInfo {
  idType: string;
  idFrontImage?: string;
  idBackImage?: string;
  policeClearanceImage?: string;
}

export default function VerificationScreen({ onBackPress, onComplete, personalInfo, accountInfo, initialData }: VerificationScreenProps) {
  const [idType, setIdType] = useState(initialData?.idType || '');
  const [idFrontImage, setIdFrontImage] = useState<string | null>(initialData?.idFrontImage || null);
  const [idBackImage, setIdBackImage] = useState<string | null>(initialData?.idBackImage || null);
  const [policeClearanceImage, setPoliceClearanceImage] = useState<string | null>(initialData?.policeClearanceImage || null);

  // ID Type selector states
  const [showIdTypeModal, setShowIdTypeModal] = useState(false);
  const [idTypeSearch, setIdTypeSearch] = useState('');
  const [filteredIdTypes, setFilteredIdTypes] = useState(VALID_ID_TYPES);

  const handleIdTypeSearch = (text: string) => {
    setIdTypeSearch(text);
    if (text.trim() === '') {
      setFilteredIdTypes(VALID_ID_TYPES);
    } else {
      const filtered = VALID_ID_TYPES.filter(type =>
        type.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredIdTypes(filtered);
    }
  };

  const selectIdType = (selectedIdType: string) => {
    setIdType(selectedIdType);
    setIdTypeSearch('');
    setFilteredIdTypes(VALID_ID_TYPES);
    setShowIdTypeModal(false);
  };

  const openIdTypeModal = () => {
    setIdTypeSearch('');
    setFilteredIdTypes(VALID_ID_TYPES);
    setShowIdTypeModal(true);
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions to upload images.');
      return false;
    }
    return true;
  };

  const pickImage = async (imageType: 'front' | 'back' | 'police') => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera(imageType) },
        { text: 'Gallery', onPress: () => openGallery(imageType) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async (imageType: 'front' | 'back' | 'police') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageByType(imageType, result.assets[0].uri);
    }
  };

  const openGallery = async (imageType: 'front' | 'back' | 'police') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageByType(imageType, result.assets[0].uri);
    }
  };

  const setImageByType = (imageType: 'front' | 'back' | 'police', uri: string) => {
    switch (imageType) {
      case 'front':
        setIdFrontImage(uri);
        break;
      case 'back':
        setIdBackImage(uri);
        break;
      case 'police':
        setPoliceClearanceImage(uri);
        break;
    }
  };

  const isFormValid = () => {
    return idType.trim() !== '' && idFrontImage && idBackImage && policeClearanceImage;
  };

  const handleComplete = () => {
    if (!idType.trim()) {
      Alert.alert('Error', 'Please select a valid ID type');
      return;
    }

    if (!idFrontImage || !idBackImage) {
      Alert.alert('Error', 'Please upload both front and back images of your ID');
      return;
    }

    if (!policeClearanceImage) {
      Alert.alert('Error', 'Please upload your Police Clearance image');
      return;
    }

    const verificationInfo: VerificationInfo = {
      idType: idType.trim(),
      idFrontImage,
      idBackImage,
      policeClearanceImage,
    };

    onComplete(verificationInfo);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logos/legatura-logo.png')}
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
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <Text style={[styles.progressText, styles.progressTextActive]}>Account Setup</Text>
          </View>
          <View style={styles.progressStep}>
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <Text style={[styles.progressText, styles.progressTextActive]}>Role Verification</Text>
          </View>
          <View style={styles.progressStep}>
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <Text style={[styles.progressText, styles.progressTextActive]}>Verification</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.dropdownContainer} onPress={openIdTypeModal}>
              <View style={styles.dropdownInputWrapper}>
                <Text style={[styles.dropdownInputText, !idType && styles.placeholderText]}>
                  {idType || 'Type of Valid ID'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionSeparator}>
            <Text style={styles.sectionTitle}>Valid ID Images</Text>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>Valid ID - Front Side</Text>
            <TouchableOpacity
              style={styles.uploadContainer}
              onPress={() => pickImage('front')}
            >
              {idFrontImage ? (
                <Image source={{ uri: idFrontImage }} style={styles.uploadedImage} />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={48} color="#CCCCCC" />
                  <Text style={styles.uploadText}>Upload front image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>Valid ID - Back Side</Text>
            <TouchableOpacity
              style={styles.uploadContainer}
              onPress={() => pickImage('back')}
            >
              {idBackImage ? (
                <Image source={{ uri: idBackImage }} style={styles.uploadedImage} />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={48} color="#CCCCCC" />
                  <Text style={styles.uploadText}>Upload back image</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.sectionSeparator}>
            <Text style={styles.sectionTitle}>Police Clearance</Text>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>Police Clearance Image</Text>
            <TouchableOpacity
              style={styles.uploadContainer}
              onPress={() => pickImage('police')}
            >
              {policeClearanceImage ? (
                <Image source={{ uri: policeClearanceImage }} style={styles.uploadedImage} />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={48} color="#CCCCCC" />
                  <Text style={styles.uploadText}>Upload image or file</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.validationTextContainer}>
            <Text style={styles.validationText}>
              All files should be valid and not expired. We'll verify these documents before approving your profile.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !isFormValid() && styles.nextButtonDisabled
            ]}
            onPress={handleComplete}
            disabled={!isFormValid()}
          >
            <Text style={[
              styles.nextButtonText,
              !isFormValid() && styles.nextButtonTextDisabled
            ]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By submitting you agree to our Terms & Privacy. We'll contact you after verification.
          </Text>
        </View>
      </ScrollView>

      {/* ID Type Selector Modal */}
      <Modal
        visible={showIdTypeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowIdTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select ID Type</Text>
              <TouchableOpacity
                onPress={() => setShowIdTypeModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              value={idTypeSearch}
              onChangeText={handleIdTypeSearch}
              placeholder="Search ID types..."
              placeholderTextColor="#999"
              autoFocus
            />

            <FlatList
              data={filteredIdTypes}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.idTypeItem}
                  onPress={() => selectIdType(item)}
                >
                  <Text style={styles.idTypeText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.idTypeList}
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
  dropdownInput: {
    paddingRight: 50,
  },
  dropdownIcon: {
    marginLeft: 10,
  },
  placeholderText: {
    color: '#999999',
  },
  uploadSection: {
    marginBottom: 4,
  },
  uploadLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  uploadContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EC7E00',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 40,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666666',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
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
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
  termsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  termsText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  validationTextContainer: {
    marginTop: 15,
    paddingHorizontal: 5,
  },
  validationText: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  sectionSeparator: {
    marginVertical: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
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
  idTypeList: {
    maxHeight: 400,
  },
  idTypeItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  idTypeText: {
    fontSize: 16,
    color: '#333333',
  },
});
