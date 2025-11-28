import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Modal,
    FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth_service } from '../../services/auth_service';

// Company Info interface for contractor step 1
export interface CompanyInfo {
    companyName: string;
    companyPhone: string;
    yearsOfExperience: string;
    contractorTypeId: string;
    contractorTypeOtherText: string;
    servicesOffered: string;
    businessAddressStreet: string;
    businessAddressProvince: string;
    businessAddressCity: string;
    businessAddressBarangay: string;
    businessAddressPostal: string;
    companyWebsite: string;
    companySocialMedia: string;
}

interface CompanyInfoScreenProps {
    onBackPress: () => void;
    onNext: (companyInfo: CompanyInfo) => void;
    formData: any;
    initialData?: Partial<CompanyInfo>;
}

export default function CompanyInfoScreen({ onBackPress, onNext, formData, initialData }: CompanyInfoScreenProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [companyName, setCompanyName] = useState(initialData?.companyName || '');
    const [companyPhone, setCompanyPhone] = useState(initialData?.companyPhone || '');
    const [yearsOfExperience, setYearsOfExperience] = useState(initialData?.yearsOfExperience || '');
    const [contractorTypeId, setContractorTypeId] = useState(initialData?.contractorTypeId || '');
    const [contractorTypeOtherText, setContractorTypeOtherText] = useState(initialData?.contractorTypeOtherText || '');
    const [servicesOffered, setServicesOffered] = useState(initialData?.servicesOffered || '');
    const [businessAddressStreet, setBusinessAddressStreet] = useState(initialData?.businessAddressStreet || '');
    const [businessAddressProvince, setBusinessAddressProvince] = useState(initialData?.businessAddressProvince || '');
    const [businessAddressCity, setBusinessAddressCity] = useState(initialData?.businessAddressCity || '');
    const [businessAddressBarangay, setBusinessAddressBarangay] = useState(initialData?.businessAddressBarangay || '');
    const [businessAddressPostal, setBusinessAddressPostal] = useState(initialData?.businessAddressPostal || '');
    const [companyWebsite, setCompanyWebsite] = useState(initialData?.companyWebsite || '');
    const [companySocialMedia, setCompanySocialMedia] = useState(initialData?.companySocialMedia || '');

    // Update form fields when initialData changes (when navigating back)
    useEffect(() => {
        if (initialData) {
            setCompanyName(initialData.companyName || '');
            setCompanyPhone(initialData.companyPhone || '');
            setYearsOfExperience(initialData.yearsOfExperience || '');
            setContractorTypeId(initialData.contractorTypeId || '');
            setContractorTypeOtherText(initialData.contractorTypeOtherText || '');
            setServicesOffered(initialData.servicesOffered || '');
            setBusinessAddressStreet(initialData.businessAddressStreet || '');
            setBusinessAddressProvince(initialData.businessAddressProvince || '');
            setBusinessAddressCity(initialData.businessAddressCity || '');
            setBusinessAddressBarangay(initialData.businessAddressBarangay || '');
            setBusinessAddressPostal(initialData.businessAddressPostal || '');
            setCompanyWebsite(initialData.companyWebsite || '');
            setCompanySocialMedia(initialData.companySocialMedia || '');
        }
    }, [initialData]);

    // UI states
    const [showContractorTypeModal, setShowContractorTypeModal] = useState(false);
    const [showProvinceModal, setShowProvinceModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const [showBarangayModal, setShowBarangayModal] = useState(false);

    // Address data
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [barangays, setBarangays] = useState<any[]>([]);

    // Load address data
    useEffect(() => {
        loadProvinces();
    }, []);

    const loadProvinces = async () => {
        try {
            const response = await auth_service.get_provinces();
            if (response.success && response.data) {
                setProvinces(response.data);
            }
        } catch (error) {
            console.error('Failed to load provinces:', error);
        }
    };

    const loadCities = async (provinceCode: string) => {
        try {
            const response = await auth_service.get_cities_by_province(provinceCode);
            if (response.success && response.data) {
                setCities(response.data);
                setBarangays([]);
                setBusinessAddressCity('');
                setBusinessAddressBarangay('');
            }
        } catch (error) {
            console.error('Failed to load cities:', error);
        }
    };

    const loadBarangays = async (cityCode: string) => {
        try {
            const response = await auth_service.get_barangays_by_city(cityCode);
            if (response.success && response.data) {
                setBarangays(response.data);
                setBusinessAddressBarangay('');
            }
        } catch (error) {
            console.error('Failed to load barangays:', error);
        }
    };

    // Load cities when province changes
    useEffect(() => {
        if (businessAddressProvince) {
            loadCities(businessAddressProvince);
        } else {
            setCities([]);
            setBusinessAddressCity('');
            setBarangays([]);
            setBusinessAddressBarangay('');
        }
    }, [businessAddressProvince]);

    // Load barangays when city changes
    useEffect(() => {
        if (businessAddressCity) {
            loadBarangays(businessAddressCity);
        } else {
            setBarangays([]);
            setBusinessAddressBarangay('');
        }
    }, [businessAddressCity]);

    const handleNext = async () => {
        // Validation
        if (!companyName.trim()) {
            Alert.alert('Error', 'Please enter company name');
            return;
        }
        if (!companyPhone.trim()) {
            Alert.alert('Error', 'Please enter company phone');
            return;
        }
        if (!yearsOfExperience.trim()) {
            Alert.alert('Error', 'Please enter years of experience');
            return;
        }
        if (!contractorTypeId) {
            Alert.alert('Error', 'Please select contractor type');
            return;
        }
        if (contractorTypeId === '9' && !contractorTypeOtherText.trim()) {
            Alert.alert('Error', 'Please specify other contractor type');
            return;
        }
        if (!servicesOffered.trim()) {
            Alert.alert('Error', 'Please enter services offered');
            return;
        }
        if (!businessAddressStreet.trim()) {
            Alert.alert('Error', 'Please enter business address');
            return;
        }
        if (!businessAddressProvince) {
            Alert.alert('Error', 'Please select province');
            return;
        }
        if (!businessAddressCity) {
            Alert.alert('Error', 'Please select city');
            return;
        }
        if (!businessAddressBarangay) {
            Alert.alert('Error', 'Please select barangay');
            return;
        }
        if (!businessAddressPostal.trim()) {
            Alert.alert('Error', 'Please enter postal code');
            return;
        }

        setIsLoading(true);

        const companyInfo: CompanyInfo = {
            companyName: companyName.trim(),
            companyPhone: companyPhone.trim(),
            yearsOfExperience: yearsOfExperience.trim(),
            contractorTypeId,
            contractorTypeOtherText: contractorTypeOtherText.trim(),
            servicesOffered: servicesOffered.trim(),
            businessAddressStreet: businessAddressStreet.trim(),
            businessAddressProvince,
            businessAddressCity,
            businessAddressBarangay,
            businessAddressPostal: businessAddressPostal.trim(),
            companyWebsite: companyWebsite.trim(),
            companySocialMedia: companySocialMedia.trim(),
        };

        try {
            await onNext(companyInfo);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        return companyName.trim() !== '' &&
            companyPhone.trim() !== '' &&
            yearsOfExperience.trim() !== '' &&
            contractorTypeId !== '' &&
            (contractorTypeId !== '9' || contractorTypeOtherText.trim() !== '') &&
            servicesOffered.trim() !== '' &&
            businessAddressStreet.trim() !== '' &&
            businessAddressProvince !== '' &&
            businessAddressCity !== '' &&
            businessAddressBarangay !== '' &&
            businessAddressPostal.trim() !== '';
    };

    const getContractorTypeName = () => {
        const contractorTypes: { [key: string]: string } = {
            '1': 'General Contractor',
            '2': 'Electrical Contractor',
            '3': 'Pool Contractor',
            '4': 'Mechanical Contractor',
            '5': 'Civil Works Contractor',
            '6': 'Architectural Contractor',
            '7': 'Interior Fit-out Contractor',
            '8': 'Landscaping Contractor',
            '9': 'Others'
        };
        return contractorTypes[contractorTypeId] || '';
    };

    // Access contractor types from nested data structure
    // formData structure from userTypeSelection: { data: { contractor_types: [...], ... } }
    // So we need to access formData.data.contractor_types
    const [contractorTypesList, setContractorTypesList] = useState<any[]>(formData?.data?.contractor_types || []);

    // Load contractor types if not available in formData
    useEffect(() => {
        const loadContractorTypes = async () => {
            // First try formData.data.contractor_types
            if (formData?.data?.contractor_types && Array.isArray(formData.data.contractor_types) && formData.data.contractor_types.length > 0) {
                setContractorTypesList(formData.data.contractor_types);
                return;
            }

            // Fallback: Load from API
            try {
                console.log('Loading contractor types from API...');
                const response = await auth_service.get_signup_form_data();
                console.log('Contractor types API response:', response);

                if (response.success) {
                    // Handle nested data structure: response.data.data.contractor_types
                    const types = response.data?.data?.contractor_types;
                    if (Array.isArray(types) && types.length > 0) {
                        console.log('Setting contractor types:', types);
                        setContractorTypesList(types);
                    } else {
                        console.error('Contractor types not found in expected format:', response);
                    }
                }
            } catch (error) {
                console.error('Failed to load contractor types:', error);
            }
        };

        loadContractorTypes();
    }, [formData]);

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
                        <Text style={[styles.progressText, styles.progressTextActive]}>Company Information</Text>
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
                    {/* Company Information Section */}
                    <Text style={styles.sectionTitle}>Company Information</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={companyName}
                            onChangeText={setCompanyName}
                            placeholder="Company Name *"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={companyPhone}
                            onChangeText={setCompanyPhone}
                            placeholder="Company Phone * (e.g., 09171234567)"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            maxLength={11}
                        />
                        <Text style={styles.fieldHint}>11 digits starting with 09</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={yearsOfExperience}
                            onChangeText={setYearsOfExperience}
                            placeholder="Years of Experience *"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.dropdownContainer} onPress={() => setShowContractorTypeModal(true)}>
                            <View style={styles.dropdownInputWrapper}>
                                <Text style={[styles.dropdownInputText, !contractorTypeId && styles.placeholderText]}>
                                    {getContractorTypeName() || 'Contractor Type *'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {contractorTypeId === '9' && (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={contractorTypeOtherText}
                                onChangeText={setContractorTypeOtherText}
                                placeholder="Specify Other Contractor Type *"
                                placeholderTextColor="#999"
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={servicesOffered}
                            onChangeText={setServicesOffered}
                            placeholder="Services Offered *"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Business Address Section */}
                    <Text style={styles.sectionTitle}>Business Address</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={businessAddressStreet}
                            onChangeText={setBusinessAddressStreet}
                            placeholder="Street/Building No. * (e.g., 456 Oak Avenue)"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.dropdownContainer} onPress={() => setShowProvinceModal(true)}>
                            <View style={styles.dropdownInputWrapper}>
                                <Text style={[styles.dropdownInputText, !businessAddressProvince && styles.placeholderText]}>
                                    {provinces.find(p => p.code === businessAddressProvince)?.name || 'Province *'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={[styles.dropdownContainer, !businessAddressProvince && styles.dropdownDisabled]}
                            onPress={() => businessAddressProvince && setShowCityModal(true)}
                            disabled={!businessAddressProvince}
                        >
                            <View style={styles.dropdownInputWrapper}>
                                <Text style={[styles.dropdownInputText, !businessAddressCity && styles.placeholderText]}>
                                    {cities.find(c => c.code === businessAddressCity)?.name || (businessAddressProvince ? 'City/Municipality *' : 'Select Province First')}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={[styles.dropdownContainer, !businessAddressCity && styles.dropdownDisabled]}
                            onPress={() => businessAddressCity && setShowBarangayModal(true)}
                            disabled={!businessAddressCity}
                        >
                            <View style={styles.dropdownInputWrapper}>
                                <Text style={[styles.dropdownInputText, !businessAddressBarangay && styles.placeholderText]}>
                                    {barangays.find(b => b.code === businessAddressBarangay)?.name || (businessAddressCity ? 'Barangay *' : 'Select City First')}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={businessAddressPostal}
                            onChangeText={setBusinessAddressPostal}
                            placeholder="Postal Code * (e.g., 1000)"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Optional Information Section */}
                    <Text style={styles.sectionTitle}>Optional Information</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={companyWebsite}
                            onChangeText={setCompanyWebsite}
                            placeholder="Company Website (e.g., https://www.example.com)"
                            placeholderTextColor="#999"
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={companySocialMedia}
                            onChangeText={setCompanySocialMedia}
                            placeholder="Social Media (Facebook, Instagram, etc.)"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.nextButton,
                            (!isFormValid() || isLoading) && styles.nextButtonDisabled
                        ]}
                        onPress={handleNext}
                        disabled={!isFormValid() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={[
                                styles.nextButtonText,
                                (!isFormValid() || isLoading) && styles.nextButtonTextDisabled
                            ]}>
                                Next
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Contractor Type Selector Modal */}
            <Modal
                visible={showContractorTypeModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowContractorTypeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Contractor Type</Text>
                            <TouchableOpacity
                                onPress={() => setShowContractorTypeModal(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#333333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={[...contractorTypesList].sort((a, b) => {
                                if (a.type_name?.toLowerCase() === 'others') return 1;
                                if (b.type_name?.toLowerCase() === 'others') return -1;
                                return (a.type_name || '').localeCompare(b.type_name || '');
                            })}
                            keyExtractor={(item) => item.type_id?.toString() || ''}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setContractorTypeId(item.type_id?.toString() || '');
                                        setContractorTypeOtherText('');
                                        setShowContractorTypeModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.type_name || ''}</Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>

            {/* Province Selector Modal */}
            <Modal
                visible={showProvinceModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProvinceModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Province</Text>
                            <TouchableOpacity
                                onPress={() => setShowProvinceModal(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#333333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={provinces}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setBusinessAddressProvince(item.code);
                                        setBusinessAddressCity('');
                                        setBusinessAddressBarangay('');
                                        setShowProvinceModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>

            {/* City Selector Modal */}
            <Modal
                visible={showCityModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCityModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select City/Municipality</Text>
                            <TouchableOpacity
                                onPress={() => setShowCityModal(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#333333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={cities}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setBusinessAddressCity(item.code);
                                        setBusinessAddressBarangay('');
                                        setShowCityModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>

            {/* Barangay Selector Modal */}
            <Modal
                visible={showBarangayModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBarangayModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Barangay</Text>
                            <TouchableOpacity
                                onPress={() => setShowBarangayModal(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#333333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={barangays}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setBusinessAddressBarangay(item.code);
                                        setShowBarangayModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 20,
        marginTop: 10,
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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
    placeholderText: {
        color: '#999999',
    },
    fieldHint: {
        fontSize: 12,
        color: '#666666',
        marginTop: 5,
        marginLeft: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 5,
        paddingBottom: 20,
        gap: 16,
    },
    backButton: {
        backgroundColor: '#E8E8E8',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    backButtonText: {
        fontSize: 18,
        color: '#333333',
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#EC7E00',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        flex: 1,
        marginLeft: 8,
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
    dropdownDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: '#DDDDDD',
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
    modalItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333333',
    },
});