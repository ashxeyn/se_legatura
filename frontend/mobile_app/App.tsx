import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { api, getApiUrl } from './src/config/api';
import LoadingScreen from './src/screens/LoadingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthChoiceScreen from './src/screens/AuthChoiceScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserTypeSelectionScreen from './src/screens/UserTypeSelectionScreen';
import PersonalInfoScreen, { PersonalInfo } from './src/screens/PersonalInfoScreen';
import AccountSetupScreen, { AccountInfo } from './src/screens/AccountSetupScreen';
import VerificationScreen, { VerificationInfo } from './src/screens/VerificationScreen';

type AppState = 'loading' | 'onboarding' | 'auth-choice' | 'login' | 'register' | 'user-type-selection' | 'personal-info' | 'account-setup' | 'verification' | 'home';

export default function App() {
    const [appState, setAppState] = useState<AppState>('loading');
    const [onboardingStep, setOnboardingStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState('Not tested');
    const [user, setUser] = useState(null);
    const [selectedUserType, setSelectedUserType] = useState<'property_owner' | 'contractor' | null>(null);
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
    const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
    const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);

    const testApiConnection = async () => {
        setIsLoading(true);
        try {
            console.log('Testing API connection to:', getApiUrl('/api/test'));

            // Add timeout to prevent hanging
            const response = await axios.get(getApiUrl('/api/test'), {
                timeout: 10000, // 10 second timeout
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('API Response:', response.data);
            setApiStatus('✅ Connected');
            Alert.alert(
                'API Test Success!',
                `Message: ${response.data.message}\nTime: ${new Date(response.data.timestamp).toLocaleTimeString()}`,
                [{ text: 'Great!' }]
            );
        } catch (error: any) {
            console.log('API Error:', error.code, error.message);
            setApiStatus('❌ Failed');

            let errorMessage = 'Unknown error';
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout - Server took too long to respond';
            } else if (error.code === 'ENOTFOUND') {
                errorMessage = 'Cannot find server - Check IP address';
            } else if (error.code === 'ECONNREFUSED') {
                errorMessage = 'Connection refused - Server not running or firewall blocking';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert(
                'API Test Failed',
                `Error: ${errorMessage}\n\nURL: ${getApiUrl('/api/test')}\n\nTroubleshooting:\n1. Both devices on same WiFi?\n2. Windows Firewall blocking?\n3. Laravel server running?`,
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        setAppState('login');
    };

    const handleRegister = () => {
        setAppState('user-type-selection');
    };

    const handleBackToAuthChoice = () => {
        clearRegistrationData();
        setAppState('auth-choice');
    };

    const handleUserTypeSelection = (userType: 'property_owner' | 'contractor') => {
        setSelectedUserType(userType);
        if (userType === 'property_owner') {
            setAppState('personal-info');
        } else {
            setAppState('register'); // Contractors use the simple registration
        }
    };

    const clearRegistrationData = () => {
        setPersonalInfo(null);
        setAccountInfo(null);
        setVerificationInfo(null);
        setSelectedUserType(null);
    };

    const handleBackToUserTypeSelection = () => {
        setAppState('user-type-selection');
    };

    const handlePersonalInfoNext = (personalData: PersonalInfo) => {
        setPersonalInfo(personalData);
        setAppState('account-setup');
    };

    const handleBackToPersonalInfo = () => {
        setAppState('personal-info');
    };

    const handleAccountSetupNext = (accountData: AccountInfo) => {
        setAccountInfo(accountData);
        setAppState('verification');
    };

    const handleBackToAccountSetup = () => {
        setAppState('account-setup');
    };

    const handleBackToVerification = () => {
        setAppState('verification');
    };

    const handleVerificationComplete = async (verificationData: VerificationInfo) => {
        setVerificationInfo(verificationData);

        // Here we would combine all the data and send it to the server
        const completeRegistrationData = {
            userType: selectedUserType,
            personalInfo,
            accountInfo,
            verificationInfo: verificationData
        };

        console.log('Complete registration data:', completeRegistrationData);

        // For now, just show success and go to home
        Alert.alert('Registration Complete!', 'Your account has been created successfully.', [
            {
                text: 'OK', onPress: () => {
                    clearRegistrationData();
                    setAppState('home');
                }
            }
        ]);
    }; const handleLoginSuccess = (userData: any) => {
        setUser(userData);
        setAppState('home');
    };

    const handleRegisterSuccess = (userData: any) => {
        setUser(userData);
        setAppState('home');
    };

    const handleLoadingComplete = () => {
        setAppState('onboarding');
    };

    const handleOnboardingNext = () => {
        if (onboardingStep < 2) {
            setOnboardingStep(onboardingStep + 1);
        } else {
            setAppState('auth-choice');
        }
    };

    const handleGetStarted = () => {
        setAppState('auth-choice');
    };

    // Render different screens based on appState
    if (appState === 'loading') {
        return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
    }

    if (appState === 'onboarding') {
        return (
            <OnboardingScreen
                currentScreen={onboardingStep}
                onNext={handleOnboardingNext}
                onGetStarted={handleGetStarted}
            />
        );
    }

    if (appState === 'auth-choice') {
        return (
            <AuthChoiceScreen
                onLogin={handleLogin}
                onRegister={handleRegister}
                onTestAPI={testApiConnection}
            />
        );
    }

    if (appState === 'login') {
        return (
            <LoginScreen
                onBackPress={handleBackToAuthChoice}
                onLoginSuccess={handleLoginSuccess}
                onSignUpPress={handleRegister}
            />
        );
    }

    if (appState === 'user-type-selection') {
        return (
            <UserTypeSelectionScreen
                onBackPress={handleBackToAuthChoice}
                onContinue={handleUserTypeSelection}
            />
        );
    }

    if (appState === 'register') {
        return (
            <RegisterScreen
                onBackPress={handleBackToUserTypeSelection}
                onRegisterSuccess={handleRegisterSuccess}
                userType={selectedUserType}
            />
        );
    }

    if (appState === 'personal-info') {
        return (
            <PersonalInfoScreen
                onBackPress={handleBackToUserTypeSelection}
                onNext={handlePersonalInfoNext}
                initialData={personalInfo}
            />
        );
    }

    if (appState === 'account-setup') {
        return (
            <AccountSetupScreen
                onBackPress={handleBackToPersonalInfo}
                onNext={handleAccountSetupNext}
                personalInfo={personalInfo!}
                initialData={accountInfo}
            />
        );
    }

    if (appState === 'verification') {
        return (
            <VerificationScreen
                onBackPress={handleBackToAccountSetup}
                onComplete={handleVerificationComplete}
                personalInfo={personalInfo!}
                accountInfo={accountInfo!}
                initialData={verificationInfo}
            />
        );
    }    // Home screen

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.header}>
                <Text style={styles.title}>Legatura Mobile</Text>
                <Text style={styles.subtitle}>Connected to Laravel Backend</Text>
                <Text style={styles.statusText}>API Status: {apiStatus}</Text>
                {user && (
                    <Text style={styles.welcomeText}>Welcome, {user.name || user.email}!</Text>
                )}
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={testApiConnection}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Testing...' : 'Test API Connection'}
                    </Text>
                </TouchableOpacity>

                {!user ? (
                    <TouchableOpacity
                        style={[styles.button, styles.logoutButton]}
                        onPress={() => setAppState('auth-choice')}
                    >
                        <Text style={styles.buttonText}>Back to Login</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.logoutButton]}
                        onPress={() => {
                            setUser(null);
                            setAppState('auth-choice');
                            Alert.alert('Logged out', 'You have been logged out successfully');
                        }}
                    >
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Development Mode</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 30,
        backgroundColor: '#EC7E00',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#e0e7ff',
    },
    statusText: {
        fontSize: 14,
        color: '#c7d2fe',
        marginTop: 5,
        fontWeight: '500',
    },
    welcomeText: {
        fontSize: 14,
        color: '#fde68a',
        marginTop: 5,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#EC7E00',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 8,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.7,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    footerText: {
        fontSize: 14,
        color: '#6b7280',
    },
});
