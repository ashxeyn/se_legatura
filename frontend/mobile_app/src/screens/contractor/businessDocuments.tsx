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
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Business Documents interface for contractor step 4
export interface BusinessDocuments {
    picabNumber: string;
    picabCategory: string;
    picabExpirationDate: string;
    businessPermitNumber: string;
    businessPermitCity: string;
    businessPermitExpiration: string;
    tinBusinessRegNumber: string;
    dtiSecRegistrationPhoto: string;
}

interface BusinessDocumentsScreenProps {
    onBackPress: () => void;
    onNext: (documentsInfo: BusinessDocuments) => void;
    companyInfo: any;
    accountInfo: any;
    formData: any;
    initialData?: Partial<BusinessDocuments>;
}

const PICAB_CATEGORIES = [
    'AAAA',
    'AAA',
    'AA',
    'A',
    'B',
    'C',
    'D',
    'Trade/E',
];

// Custom Date Picker Component
interface CustomDatePickerProps {
    currentDate: Date;
    onDateChange: (year: number, month: number, day: number) => void;
    minimumDate?: Date;
}

function CustomDatePicker({ currentDate, onDateChange, minimumDate }: CustomDatePickerProps) {
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

    const years = getYears();
    const months = getMonths();
    const days = getDays(selectedYear, selectedMonth);

    const minYear = minimumDate ? minimumDate.getFullYear() : new Date().getFullYear();
    const minMonth = minimumDate ? minimumDate.getMonth() + 1 : new Date().getMonth() + 1;
    const minDay = minimumDate ? minimumDate.getDate() : new Date().getDate();

    useEffect(() => {
        // Ensure selected date is not before minimum date
        if (selectedYear < minYear || 
            (selectedYear === minYear && selectedMonth < minMonth) ||
            (selectedYear === minYear && selectedMonth === minMonth && selectedDay < minDay)) {
            setSelectedYear(minYear);
            setSelectedMonth(minMonth);
            setSelectedDay(minDay);
        }
    }, []);

    useEffect(() => {
        // Update days when year or month changes
        const maxDays = getDays(selectedYear, selectedMonth).length;
        if (selectedDay > maxDays) {
            setSelectedDay(maxDays);
        }
    }, [selectedYear, selectedMonth]);

    const handleConfirm = () => {
        onDateChange(selectedYear, selectedMonth, selectedDay);
    };

    return (
        <View style={styles.customDatePickerContainer}>
            <View style={styles.datePickerRow}>
                <View style={styles.datePickerColumn}>
                    <Text style={styles.datePickerLabel}>Year</Text>
                    <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                        {years.map((year) => (
                            <TouchableOpacity
                                key={year}
                                style={[
                                    styles.datePickerItem,
                                    selectedYear === year && styles.datePickerItemSelected
                                ]}
                                onPress={() => setSelectedYear(year)}
                            >
                                <Text style={[
                                    styles.datePickerItemText,
                                    selectedYear === year && styles.datePickerItemTextSelected
                                ]}>
                                    {year}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.datePickerColumn}>
                    <Text style={styles.datePickerLabel}>Month</Text>
                    <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                        {months.map((month) => (
                            <TouchableOpacity
                                key={month.value}
                                style={[
                                    styles.datePickerItem,
                                    selectedMonth === month.value && styles.datePickerItemSelected
                                ]}
                                onPress={() => setSelectedMonth(month.value)}
                            >
                                <Text style={[
                                    styles.datePickerItemText,
                                    selectedMonth === month.value && styles.datePickerItemTextSelected
                                ]}>
                                    {month.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.datePickerColumn}>
                    <Text style={styles.datePickerLabel}>Day</Text>
                    <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                        {getDays(selectedYear, selectedMonth).map((day) => {
                            const isDisabled = selectedYear === minYear && 
                                             selectedMonth === minMonth && 
                                             day < minDay;
                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.datePickerItem,
                                        selectedDay === day && styles.datePickerItemSelected,
                                        isDisabled && styles.datePickerItemDisabled
                                    ]}
                                    onPress={() => !isDisabled && setSelectedDay(day)}
                                    disabled={isDisabled}
                                >
                                    <Text style={[
                                        styles.datePickerItemText,
                                        selectedDay === day && styles.datePickerItemTextSelected,
                                        isDisabled && styles.datePickerItemTextDisabled
                                    ]}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
            <TouchableOpacity style={styles.datePickerConfirmButton} onPress={handleConfirm}>
                <Text style={styles.datePickerConfirmText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
}

// Helper functions for date picker
function getYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 20; i++) {
        years.push(i);
    }
    return years;
}

function getMonths(): Array<{ value: number; label: string }> {
    return [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];
}

function getDays(year: number, month: number): number[] {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    return days;
}

export default function BusinessDocumentsScreen({ onBackPress, onNext, companyInfo, accountInfo, formData, initialData }: BusinessDocumentsScreenProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [picabNumber, setPicabNumber] = useState(initialData?.picabNumber || '');
    const [picabCategory, setPicabCategory] = useState(initialData?.picabCategory || '');
    const [picabExpirationDate, setPicabExpirationDate] = useState(initialData?.picabExpirationDate || '');
    const [businessPermitNumber, setBusinessPermitNumber] = useState(initialData?.businessPermitNumber || '');
    const [businessPermitCity, setBusinessPermitCity] = useState(initialData?.businessPermitCity || '');
    const [businessPermitExpiration, setBusinessPermitExpiration] = useState(initialData?.businessPermitExpiration || '');
    const [tinBusinessRegNumber, setTinBusinessRegNumber] = useState(initialData?.tinBusinessRegNumber || '');
    const [dtiSecRegistrationPhoto, setDtiSecRegistrationPhoto] = useState(initialData?.dtiSecRegistrationPhoto || '');

    // UI states
    const [showPicabCategoryModal, setShowPicabCategoryModal] = useState(false);
    const [showPicabDatePicker, setShowPicabDatePicker] = useState(false);
    const [showPermitDatePicker, setShowPermitDatePicker] = useState(false);
    
    // Date objects for pickers
    const [picabDate, setPicabDate] = useState(() => {
        if (initialData?.picabExpirationDate) {
            return new Date(initialData.picabExpirationDate);
        }
        return new Date();
    });
    const [permitDate, setPermitDate] = useState(() => {
        if (initialData?.businessPermitExpiration) {
            return new Date(initialData.businessPermitExpiration);
        }
        return new Date();
    });

    // Update form fields when initialData changes (when navigating back)
    useEffect(() => {
        if (initialData) {
            setPicabNumber(initialData.picabNumber || '');
            setPicabCategory(initialData.picabCategory || '');
            setPicabExpirationDate(initialData.picabExpirationDate || '');
            setBusinessPermitNumber(initialData.businessPermitNumber || '');
            setBusinessPermitCity(initialData.businessPermitCity || '');
            setBusinessPermitExpiration(initialData.businessPermitExpiration || '');
            setTinBusinessRegNumber(initialData.tinBusinessRegNumber || '');
            setDtiSecRegistrationPhoto(initialData.dtiSecRegistrationPhoto || '');
            
            // Update date objects
            if (initialData.picabExpirationDate) {
                setPicabDate(new Date(initialData.picabExpirationDate));
            }
            if (initialData.businessPermitExpiration) {
                setPermitDate(new Date(initialData.businessPermitExpiration));
            }
        }
    }, [initialData]);
    
    // Format date to YYYY-MM-DD string (for backend)
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Format date for display (e.g., "January 15, 2025")
    const formatDateForDisplay = (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        } catch (error) {
            return dateString; // Return as-is if parsing fails
        }
    };
    
    // Handle PICAB date picker - custom implementation
    const handlePicabDateChange = (year: number, month: number, day: number) => {
        const newDate = new Date(year, month - 1, day);
        setPicabDate(newDate);
        setPicabExpirationDate(formatDate(newDate));
        setShowPicabDatePicker(false);
    };
    
    // Handle Business Permit date picker - custom implementation
    const handlePermitDateChange = (year: number, month: number, day: number) => {
        const newDate = new Date(year, month - 1, day);
        setPermitDate(newDate);
        setBusinessPermitExpiration(formatDate(newDate));
        setShowPermitDatePicker(false);
    };

    const handleImagePicker = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions to upload documents.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setDtiSecRegistrationPhoto(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleNext = async () => {
        // Validation
        if (!picabNumber.trim()) {
            Alert.alert('Error', 'Please enter PICAB number');
            return;
        }
        if (!picabCategory) {
            Alert.alert('Error', 'Please select PICAB category');
            return;
        }
        if (!picabExpirationDate.trim()) {
            Alert.alert('Error', 'Please enter PICAB expiration date');
            return;
        }
        if (!businessPermitNumber.trim()) {
            Alert.alert('Error', 'Please enter business permit number');
            return;
        }
        if (!businessPermitCity.trim()) {
            Alert.alert('Error', 'Please enter business permit city');
            return;
        }
        if (!businessPermitExpiration.trim()) {
            Alert.alert('Error', 'Please enter business permit expiration date');
            return;
        }
        if (!tinBusinessRegNumber.trim()) {
            Alert.alert('Error', 'Please enter TIN/Business registration number');
            return;
        }
        if (!dtiSecRegistrationPhoto) {
            Alert.alert('Error', 'Please upload DTI/SEC registration photo');
            return;
        }

        setIsLoading(true);

        const documentsInfo: BusinessDocuments = {
            picabNumber: picabNumber.trim(),
            picabCategory,
            picabExpirationDate: picabExpirationDate.trim(),
            businessPermitNumber: businessPermitNumber.trim(),
            businessPermitCity: businessPermitCity.trim(),
            businessPermitExpiration: businessPermitExpiration.trim(),
            tinBusinessRegNumber: tinBusinessRegNumber.trim(),
            dtiSecRegistrationPhoto,
        };

        try {
            await onNext(documentsInfo);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        return picabNumber.trim() !== '' &&
            picabCategory !== '' &&
            picabExpirationDate.trim() !== '' &&
            businessPermitNumber.trim() !== '' &&
            businessPermitCity.trim() !== '' &&
            businessPermitExpiration.trim() !== '' &&
            tinBusinessRegNumber.trim() !== '' &&
            dtiSecRegistrationPhoto !== '';
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
                        <Text style={[styles.progressText, styles.progressTextActive]}>Company Information</Text>
                    </View>
                    <View style={styles.progressStep}>
                        <View style={[styles.progressBar, styles.progressBarActive]} />
                        <Text style={[styles.progressText, styles.progressTextActive]}>Account Setup</Text>
                    </View>
                    <View style={styles.progressStep}>
                        <View style={[styles.progressBar, styles.progressBarActive]} />
                        <Text style={[styles.progressText, styles.progressTextActive]}>Business Documents</Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    {/* PICAB Certification Section */}
                    <Text style={styles.sectionTitle}>PICAB Certification</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={picabNumber}
                            onChangeText={setPicabNumber}
                            placeholder="PICAB Number *"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.dropdownContainer} onPress={() => setShowPicabCategoryModal(true)}>
                            <View style={styles.dropdownInputWrapper}>
                                <Text style={[styles.dropdownInputText, !picabCategory && styles.placeholderText]}>
                                    {picabCategory || 'PICAB Category *'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={styles.dropdownContainer}
                            onPress={() => setShowPicabDatePicker(true)}
                        >
                            <View style={styles.dropdownInputWrapper}>
                                <Text style={[styles.dropdownInputText, !picabExpirationDate && styles.placeholderText]}>
                                    {picabExpirationDate ? formatDateForDisplay(picabExpirationDate) : 'PICAB Expiration Date *'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Business Permit Section */}
                    <Text style={styles.sectionTitle}>Business Permit</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={businessPermitNumber}
                            onChangeText={setBusinessPermitNumber}
                            placeholder="Business Permit Number *"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={businessPermitCity}
                            onChangeText={setBusinessPermitCity}
                            placeholder="Business Permit City *"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={styles.dropdownContainer}
                            onPress={() => setShowPermitDatePicker(true)}
                        >
                            <View style={styles.dropdownInputWrapper}>
                                <Text style={[styles.dropdownInputText, !businessPermitExpiration && styles.placeholderText]}>
                                    {businessPermitExpiration ? formatDateForDisplay(businessPermitExpiration) : 'Business Permit Expiration *'}
                                </Text>
                                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666666" style={styles.dropdownIcon} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Business Registration Section */}
                    <Text style={styles.sectionTitle}>Business Registration</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={tinBusinessRegNumber}
                            onChangeText={setTinBusinessRegNumber}
                            placeholder="TIN/Business Registration Number *"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>DTI/SEC Registration Photo *</Text>
                        <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
                            <View style={styles.uploadButtonContent}>
                                <MaterialIcons name="cloud-upload" size={24} color="#EC7E00" />
                                <Text style={styles.uploadButtonText}>
                                    {dtiSecRegistrationPhoto ? 'Change Photo' : 'Upload Photo'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        {dtiSecRegistrationPhoto && (
                            <View style={styles.imagePreview}>
                                <Image source={{ uri: dtiSecRegistrationPhoto }} style={styles.previewImage} />
                                <Text style={styles.imagePreviewText}>DTI/SEC Registration Document</Text>
                            </View>
                        )}
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

            {/* PICAB Category Selector Modal */}
            <Modal
                visible={showPicabCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPicabCategoryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select PICAB Category</Text>
                            <TouchableOpacity
                                onPress={() => setShowPicabCategoryModal(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#333333" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={PICAB_CATEGORIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setPicabCategory(item);
                                        setShowPicabCategoryModal(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>

            {/* PICAB Expiration Date Picker */}
            <Modal
                visible={showPicabDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPicabDatePicker(false)}
            >
                <View style={styles.datePickerModalOverlay}>
                    <View style={styles.datePickerModalContainer}>
                        <View style={styles.datePickerModalHeader}>
                            <Text style={styles.datePickerModalTitle}>Select PICAB Expiration Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowPicabDatePicker(false)}
                                style={styles.datePickerModalCloseButton}
                            >
                                <Text style={styles.datePickerModalCloseText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <CustomDatePicker
                            currentDate={picabDate}
                            onDateChange={handlePicabDateChange}
                            minimumDate={new Date()}
                        />
                    </View>
                </View>
            </Modal>

            {/* Business Permit Expiration Date Picker */}
            <Modal
                visible={showPermitDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPermitDatePicker(false)}
            >
                <View style={styles.datePickerModalOverlay}>
                    <View style={styles.datePickerModalContainer}>
                        <View style={styles.datePickerModalHeader}>
                            <Text style={styles.datePickerModalTitle}>Select Business Permit Expiration Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowPermitDatePicker(false)}
                                style={styles.datePickerModalCloseButton}
                            >
                                <Text style={styles.datePickerModalCloseText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <CustomDatePicker
                            currentDate={permitDate}
                            onDateChange={handlePermitDateChange}
                            minimumDate={new Date()}
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
    uploadButton: {
        borderWidth: 2,
        borderColor: '#EC7E00',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 20,
        backgroundColor: '#FFF8F0',
    },
    uploadButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    uploadButtonText: {
        color: '#EC7E00',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreview: {
        marginTop: 15,
        alignItems: 'center',
    },
    previewImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    imagePreviewText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
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
    datePickerModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    datePickerModalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    datePickerModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    datePickerModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    datePickerModalCloseButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    datePickerModalCloseText: {
        fontSize: 16,
        color: '#EC7E00',
        fontWeight: '600',
    },
    datePickerIOS: {
        height: 200,
    },
    customDatePickerContainer: {
        padding: 20,
    },
    datePickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    datePickerColumn: {
        flex: 1,
        marginHorizontal: 5,
    },
    datePickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 10,
        textAlign: 'center',
    },
    datePickerScroll: {
        maxHeight: 200,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    datePickerItem: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    datePickerItemSelected: {
        backgroundColor: '#EC7E00',
    },
    datePickerItemDisabled: {
        opacity: 0.3,
    },
    datePickerItemText: {
        fontSize: 16,
        color: '#333333',
    },
    datePickerItemTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    datePickerItemTextDisabled: {
        color: '#999999',
    },
    datePickerConfirmButton: {
        backgroundColor: '#EC7E00',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    datePickerConfirmText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});