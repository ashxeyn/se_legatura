// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

interface LoadingScreenProps {
    onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
    const [progress] = useState(new Animated.Value(0));
    const [logoOpacity] = useState(new Animated.Value(0));

    useEffect(() => {
        // Start logo fade in animation
        Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Start progress bar animation
        Animated.timing(progress, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: false,
        }).start(() => {
            // Loading complete, move to next screen
            setTimeout(onLoadingComplete, 500);
        });
    }, []);

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
                <Image
                    source={require('../../assets/images/logos/legatura-logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </Animated.View>

            <View style={styles.loadingContainer}>
                <View style={styles.progressBarBackground}>
                    <Animated.View
                        style={[styles.progressBar, { width: progressWidth }]}
                    />
                </View>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFE',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 100,
    },
    logoImage: {
        width: 350,
        height: 105,
        marginBottom: 20,
    },
    loadingContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBarBackground: {
        width: '80%',
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#EC7E00',
        borderRadius: 2,
    },
    loadingText: {
        color: '#6b7280',
        fontSize: 14,
        marginTop: 20,
        fontWeight: '300',
    },
});
