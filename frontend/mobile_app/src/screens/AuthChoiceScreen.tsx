import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';

interface AuthChoiceScreenProps {
    onLogin: () => void;
    onRegister: () => void;
    onTestAPI?: () => void;
}

export default function AuthChoiceScreen({ onLogin, onRegister, onTestAPI }: AuthChoiceScreenProps) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.topSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/logos/legatura-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>Welcome to Legatura</Text>
                        <Text style={styles.welcomeSubtitle}>
                            Connect with Skilled Professionals and Trusted Experts for{'\n'}
                            Efficient and Successful Project Delivery.
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.createAccountButton} onPress={onRegister}>
                        <Text style={styles.createAccountButtonText}>Create an Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
                        <Text style={styles.loginButtonText}>Log in</Text>
                    </TouchableOpacity>

                    {onTestAPI && (
                        <TouchableOpacity style={styles.testButton} onPress={onTestAPI}>
                            <Text style={styles.testButtonText}>Test API Connection</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
        justifyContent: 'space-between',
        paddingBottom: 60,
    },
    topSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 500,
        height: 180,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 20,
    },
    welcomeSubtitle: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 20,

    },
    buttonContainer: {
        gap: 15,
    },
    createAccountButton: {
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
    createAccountButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#EC7E00',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#EC7E00',
        fontSize: 18,
        fontWeight: '600',
    },
    testButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    testButtonText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '500',
    },
});
