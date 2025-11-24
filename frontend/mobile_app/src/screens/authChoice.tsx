// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthChoiceScreenProps {
    on_login: () => void;
    on_register: () => void;
    on_test_api?: () => void;
}

export default function AuthChoiceScreen({ on_login, on_register, on_test_api }: AuthChoiceScreenProps) {
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

                <View style={styles.button_container}>
                    <TouchableOpacity style={styles.create_account_button} onPress={on_register}>
                        <Text style={styles.create_account_button_text}>Create an Account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.login_button} onPress={on_login}>
                        <Text style={styles.login_button_text}>Log in</Text>
                    </TouchableOpacity>

                    {on_test_api && (
                        <TouchableOpacity style={styles.test_button} onPress={on_test_api}>
                            <Text style={styles.test_button_text}>Test API Connection</Text>
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
    button_container: {
        gap: 15,
    },
    create_account_button: {
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
    create_account_button_text: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    login_button: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#EC7E00',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    login_button_text: {
        color: '#EC7E00',
        fontSize: 18,
        fontWeight: '600',
    },
    test_button: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    test_button_text: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '500',
    },
});
