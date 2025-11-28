import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoadingScreen from './src/screens/loadingScreen';
import OnboardingScreen from './src/screens/onboardingScreen';
import AuthChoiceScreen from './src/screens/authChoice';
import LoginScreen from './src/screens/loginScreen';
import SignupScreen from './src/screens/signupScreen';
import UserTypeSelectionScreen from './src/screens/userTypeSelection';
// Property Owner Flow
import PersonalInfoScreen from './src/screens/owner/personalInfo';
import AccountSetupScreen from './src/screens/owner/accountSetup';
import POVerificationScreen from './src/screens/owner/poRoleVerification';
// Contractor Flow
import ContractorCompanyInfoScreen from './src/screens/contractor/companyInfo';
import ContractorAccountSetupScreen from './src/screens/contractor/accountSetup';
import ContractorBusinessDocumentsScreen from './src/screens/contractor/businessDocuments';
// Shared Screens
import EmailVerificationScreen from './src/screens/both/emailVerification';
import ProfilePictureScreen from './src/screens/both/profilePic';
import HomepageScreen from './src/screens/both/homepage';
import { auth_service } from './src/services/auth_service';
import { Alert } from 'react-native';

type AppState = 'loading' | 'onboarding' | 'auth_choice' | 'login' | 'signup' | 'user_type_selection' |
    // Contractor Flow  
    'contractor_company_info' | 'contractor_account_setup' | 'contractor_email_verification' | 'contractor_business_documents' | 'contractor_profile_picture' |
    // Property Owner Flow
    'po_personal_info' | 'po_account_setup' | 'po_email_verification' | 'po_role_verification' | 'po_profile_picture' |
    'main';

export default function App() {
    const [app_state, set_app_state] = useState<AppState>('loading');
    
    // Hide status bar globally whenever app state changes
    useEffect(() => {
        StatusBar.setHidden(true, 'fade');
    }, [app_state]);
    const [onboarding_step, set_onboarding_step] = useState(0);
    const [selected_user_type, set_selected_user_type] = useState<'contractor' | 'property_owner' | null>(null);

    // Form data from backend
    const [form_data, set_form_data] = useState<any>(null);

    // Logged in user data
    const [user_data, set_user_data] = useState<any>(null);

    // Property Owner signup data
    const [po_personal_info, set_po_personal_info] = useState<any>(null);
    const [po_account_setup, set_po_account_setup] = useState<any>(null);
    const [po_verification_info, set_po_verification_info] = useState<any>(null);

    // Contractor signup data
    const [contractor_company_info, set_contractor_company_info] = useState<any>(null);
    const [contractor_account_info, set_contractor_account_info] = useState<any>(null);
    const [contractor_documents_info, set_contractor_documents_info] = useState<any>(null);

    const handle_loading_complete = () => {
        set_app_state('onboarding');
    };

    const handle_onboarding_next = () => {
        if (onboarding_step < 2) {
            set_onboarding_step(onboarding_step + 1);
        } else {
            handle_get_started();
        }
    };

    const handle_get_started = () => {
        set_app_state('auth_choice');
    };

    const handle_login = () => {
        set_app_state('login');
    };

    const handle_register = () => {
        set_app_state('user_type_selection');
    };

    const handle_back_to_auth_choice = () => {
        set_app_state('auth_choice');
    };

    const handle_user_type_selected = (user_type: 'contractor' | 'property_owner', formData: any) => {
        set_selected_user_type(user_type);
        set_form_data(formData); // Store form data for subsequent screens

        if (user_type === 'contractor') {
            set_app_state('contractor_company_info'); // Start Contractor flow
        } else {
            set_app_state('po_personal_info'); // Start Property Owner flow
        }
    };

    const handle_back_to_user_type_selection = () => {
        set_app_state('user_type_selection');
    };

    // Property Owner Flow Handlers
    const handle_po_personal_info_next = async (personalInfo: any) => {
        try {
            // Send personal info to backend (Step 1)
            const response = await auth_service.property_owner_step1(personalInfo);
            
            if (response.success) {
                set_po_personal_info(personalInfo);
                set_app_state('po_account_setup');
            } else {
                Alert.alert('Error', response.message || 'Failed to save personal information. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
        }
    };

    const handle_po_account_setup_next = async (accountSetup: any) => {
        try {
            // Send account setup to backend (Step 2) - this triggers OTP email
            const response = await auth_service.property_owner_step2(accountSetup);
            
            if (response.success) {
                set_po_account_setup(accountSetup);
                set_app_state('po_email_verification');
                Alert.alert('Success', 'OTP has been sent to your email. Please check your inbox.');
            } else {
                Alert.alert('Error', response.message || 'Failed to create account. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
        }
    };

    const handle_po_email_verification_success = () => {
        set_app_state('po_role_verification');
    };

    const handle_po_role_verification_next = () => {
        set_app_state('po_profile_picture');
    };

    const handle_po_profile_picture_complete = () => {
        set_app_state('main'); // Complete signup
    };

    const handle_login_success = (userData?: any) => {
        // Store user data from login response
        if (userData) {
            set_user_data(userData);
            // Set user type based on user data
            if (userData.user_type === 'contractor') {
                set_selected_user_type('contractor');
            } else if (userData.user_type === 'property_owner' || userData.user_type === 'both') {
                set_selected_user_type('property_owner');
            }
        }
        set_app_state('main');
    };

    const handle_logout = () => {
        // Clear all user data and state
        set_user_data(null);
        set_selected_user_type(null);
        set_form_data(null);
        set_po_personal_info(null);
        set_po_account_setup(null);
        set_po_verification_info(null);
        set_contractor_company_info(null);
        set_contractor_account_info(null);
        set_contractor_documents_info(null);
        
        // Navigate to auth choice screen
        set_app_state('auth_choice');
    };

    if (app_state === 'loading') {
        return (
            <SafeAreaProvider>
                <LoadingScreen onLoadingComplete={handle_loading_complete} />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'onboarding') {
        return (
            <SafeAreaProvider>
                <OnboardingScreen
                    current_screen={onboarding_step}
                    on_next={handle_onboarding_next}
                    on_get_started={handle_get_started}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'auth_choice') {
        return (
            <SafeAreaProvider>
                <AuthChoiceScreen
                    on_login={handle_login}
                    on_register={handle_register}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'login') {
        return (
            <SafeAreaProvider>
                <LoginScreen
                    on_back={handle_back_to_auth_choice}
                    on_login_success={handle_login_success}
                    on_signup={handle_register}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'user_type_selection') {
        return (
            <SafeAreaProvider>
                <UserTypeSelectionScreen
                    onBackPress={handle_back_to_auth_choice}
                    onContinue={handle_user_type_selected}
                />
            </SafeAreaProvider>
        );
    }


    // Property Owner Multi-Step Flow
    if (app_state === 'po_personal_info') {
        return (
            <SafeAreaProvider>
                <PersonalInfoScreen
                    onBackPress={handle_back_to_user_type_selection}
                    onNext={handle_po_personal_info_next}
                    formData={form_data}
                    initialData={po_personal_info}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'po_account_setup') {
        return (
            <SafeAreaProvider>
                <AccountSetupScreen
                    onBackPress={() => set_app_state('po_personal_info')}
                    onNext={handle_po_account_setup_next}
                    personalInfo={po_personal_info}
                    initialData={po_account_setup}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'po_email_verification') {
        return (
            <SafeAreaProvider>
                <EmailVerificationScreen
                    email={po_account_setup?.email || ''}
                    onBackPress={() => set_app_state('po_account_setup')}
                    onComplete={async (verificationCode: string) => {
                        try {
                            const response = await auth_service.property_owner_verify_otp(verificationCode);
                            if (response.success) {
                                set_app_state('po_role_verification');
                            } else {
                                Alert.alert('Error', response.message || 'Invalid OTP. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                    onResendOtp={async () => {
                        try {
                            const response = await auth_service.property_owner_step2(po_account_setup);
                            if (response.success) {
                                Alert.alert('Success', 'New OTP has been sent to your email.');
                            } else {
                                Alert.alert('Error', response.message || 'Failed to resend OTP. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'po_role_verification') {
        return (
            <SafeAreaProvider>
                <POVerificationScreen
                    personalInfo={po_personal_info}
                    accountInfo={po_account_setup}
                    onBackPress={() => set_app_state('po_email_verification')}
                    onComplete={async (verificationInfo: any) => {
                        try {
                            const response = await auth_service.property_owner_step4(verificationInfo);
                            if (response.success) {
                                set_po_verification_info(verificationInfo);
                                set_app_state('po_profile_picture');
                            } else {
                                Alert.alert('Error', response.message || 'Failed to save verification information. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'po_profile_picture') {
        return (
            <SafeAreaProvider>
                <ProfilePictureScreen
                    onBackPress={() => set_app_state('po_role_verification')}
                    onComplete={async (profileInfo: any) => {
                        try {
                            console.log('🔥 App.tsx - Profile picture complete, calling final step');
                            // Complete registration with profile picture
                            const response = await auth_service.property_owner_final(profileInfo);
                            
                            console.log('🔥 App.tsx - Final step response:', response);
                            
                            if (response.success) {
                                Alert.alert('Success', 'Registration completed successfully!', [
                                    { text: 'OK', onPress: () => set_app_state('main') }
                                ]);
                            } else {
                                const errorMsg = response.message || `Failed to complete registration. Status: ${response.status}`;
                                console.error('🔥 App.tsx - Registration failed:', errorMsg);
                                Alert.alert('Error', errorMsg);
                            }
                        } catch (error) {
                            console.error('🔥 App.tsx - Exception caught:', error);
                            const errorMsg = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
                            Alert.alert('Error', errorMsg);
                        }
                    }}
                    onSkip={async () => {
                        try {
                            // Complete registration without profile picture
                            const response = await auth_service.property_owner_final({});
                            
                            if (response.success) {
                                Alert.alert('Success', 'Registration completed successfully!', [
                                    { text: 'OK', onPress: () => set_app_state('main') }
                                ]);
                            } else {
                                Alert.alert('Error', response.message || 'Failed to complete registration. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'main') {
        return (
            <SafeAreaProvider>
                <StatusBar hidden={true} />
                <HomepageScreen 
                    userType={selected_user_type || 'property_owner'} 
                    userData={user_data}
                    onLogout={handle_logout}
                />
            </SafeAreaProvider>
        );
    }

    // Contractor Registration Flow
    if (app_state === 'contractor_company_info') {
        return (
            <SafeAreaProvider>
                <ContractorCompanyInfoScreen
                    onBackPress={() => set_app_state('user_type_selection')}
                    onNext={async (companyInfo: any) => {
                        try {
                            const response = await auth_service.contractor_step1(companyInfo);
                            
                            if (response.success) {
                                set_contractor_company_info(companyInfo);
                                set_app_state('contractor_account_setup');
                            } else {
                                Alert.alert('Error', response.message || 'Failed to save company information. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                    formData={form_data}
                    initialData={contractor_company_info}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'contractor_account_setup') {
        return (
            <SafeAreaProvider>
                <ContractorAccountSetupScreen
                    onBackPress={() => set_app_state('contractor_company_info')}
                    onNext={async (accountInfo: any) => {
                        try {
                            const response = await auth_service.contractor_step2(accountInfo);
                            
                            if (response.success) {
                                set_contractor_account_info(accountInfo);
                                set_app_state('contractor_email_verification');
                                Alert.alert('Success', 'OTP has been sent to your email. Please check your inbox.');
                            } else {
                                Alert.alert('Error', response.message || 'Failed to create account. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                    companyInfo={contractor_company_info}
                    initialData={contractor_account_info}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'contractor_email_verification') {
        return (
            <SafeAreaProvider>
                <EmailVerificationScreen
                    email={contractor_account_info?.companyEmail || ''}
                    onBackPress={() => set_app_state('contractor_account_setup')}
                    onComplete={async (verificationCode: string) => {
                        try {
                            const response = await auth_service.contractor_verify_otp(verificationCode);
                            if (response.success) {
                                set_app_state('contractor_business_documents');
                            } else {
                                Alert.alert('Error', response.message || 'Invalid OTP. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                    onResendOtp={async () => {
                        try {
                            const response = await auth_service.contractor_step2(contractor_account_info);
                            if (response.success) {
                                Alert.alert('Success', 'New OTP has been sent to your email.');
                            } else {
                                Alert.alert('Error', response.message || 'Failed to resend OTP. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'contractor_business_documents') {
        return (
            <SafeAreaProvider>
                <ContractorBusinessDocumentsScreen
                    onBackPress={() => set_app_state('contractor_email_verification')}
                    onNext={async (documentsInfo: any) => {
                        try {
                            const response = await auth_service.contractor_step4(documentsInfo);
                            if (response.success) {
                                set_contractor_documents_info(documentsInfo);
                                set_app_state('contractor_profile_picture');
                            } else {
                                Alert.alert('Error', response.message || 'Failed to save business documents. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                    companyInfo={contractor_company_info}
                    accountInfo={contractor_account_info}
                    formData={form_data}
                    initialData={contractor_documents_info}
                />
            </SafeAreaProvider>
        );
    }

    if (app_state === 'contractor_profile_picture') {
        return (
            <SafeAreaProvider>
                <ProfilePictureScreen
                    onBackPress={() => set_app_state('contractor_business_documents')}
                    onComplete={async (profileInfo: any) => {
                        try {
                            const response = await auth_service.contractor_final(profileInfo);
                            
                            if (response.success) {
                                Alert.alert('Success', 'Registration completed successfully!', [
                                    { text: 'OK', onPress: () => set_app_state('main') }
                                ]);
                            } else {
                                Alert.alert('Error', response.message || 'Failed to complete registration. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                    onSkip={async () => {
                        try {
                            const response = await auth_service.contractor_final({});
                            
                            if (response.success) {
                                Alert.alert('Success', 'Registration completed successfully!', [
                                    { text: 'OK', onPress: () => set_app_state('main') }
                                ]);
                            } else {
                                Alert.alert('Error', response.message || 'Failed to complete registration. Please try again.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error. Please check your connection and try again.');
                        }
                    }}
                />
            </SafeAreaProvider>
        );
    }

    // Main app fallback
    return (
        <SafeAreaProvider>
            {/* Main app content will go here */}
        </SafeAreaProvider>
    );
}
