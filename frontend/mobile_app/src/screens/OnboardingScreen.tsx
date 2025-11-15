import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
    currentScreen: number;
    onNext: () => void;
    onGetStarted: () => void;
}

const onboardingData = [
    {
        title: "Post projects, compare bids, and choose",
        subtitle: "the best option with ease.",
        image: require('../../assets/images/pictures/slide1.png'),
    },
    {
        title: "Monitor progress with real-time updates",
        subtitle: "from site to home.",
        image: require('../../assets/images/pictures/slide2.png'),
    },
    {
        title: "With Legatura, Celebrate success with",
        subtitle: "completed projects delivered on time",
        image: require('../../assets/images/pictures/slide3.png'),
    },
];

export default function OnboardingScreen({
    currentScreen,
    onNext,
    onGetStarted
}: OnboardingScreenProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const isLastScreen = activeSlide === onboardingData.length - 1;

    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setActiveSlide(slideIndex);
    };

    const goToSlide = (index: number) => {
        setActiveSlide(index);
        scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    };

    const handleNext = () => {
        if (activeSlide < onboardingData.length - 1) {
            goToSlide(activeSlide + 1);
        } else {
            onGetStarted();
        }
    };

    const renderStyledText = (text: string, highlightWords: string[]) => {
        let styledText = text;
        highlightWords.forEach(word => {
            styledText = styledText.replace(
                word,
                `<ORANGE>${word}</ORANGE>`
            );
        });

        const parts = styledText.split(/(<ORANGE>.*?<\/ORANGE>)/);

        return (
            <Text style={styles.text}>
                {parts.map((part, index) => {
                    if (part.startsWith('<ORANGE>') && part.endsWith('</ORANGE>')) {
                        const orangeText = part.replace(/<\/?ORANGE>/g, '');
                        return (
                            <Text key={index} style={styles.orangeText}>
                                {orangeText}
                            </Text>
                        );
                    }
                    return part;
                })}
            </Text>
        );
    }; return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/logos/legatura-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {onboardingData.map((item, index) => (
                    <View key={index} style={styles.slide}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={item.image}
                                style={styles.slideImage}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.textContainer}>
                            {index === 0 && renderStyledText("Post projects, compare bids, and choose the best option with ease.", ["best option"])}
                            {index === 1 && renderStyledText("Monitor progress with real-time updates from site to home.", ["real-time updates"])}
                            {index === 2 && renderStyledText("With Legatura, Celebrate success with completed projects delivered on time", ["Legatura"])}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.bottomContainer}>
                <View style={styles.pagination}>
                    {onboardingData.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === activeSlide ? styles.activeDot : styles.inactiveDot
                            ]}
                            onPress={() => goToSlide(index)}
                        />
                    ))}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleNext}
                    >
                        <Text style={styles.buttonText}>
                            {isLastScreen ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>

                    {!isLastScreen && (
                        <TouchableOpacity style={styles.skipButton} onPress={onGetStarted}>
                            <Text style={styles.skipText}>Skip</Text>
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
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
    },
    logo: {
        width: 120,
        height: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexDirection: 'row',
    },
    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: SCREEN_WIDTH,
    },
    slideImage: {
        width: 430,
        height: 430,
        resizeMode: 'contain',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 30,
        marginBottom: 40,
    },
    text: {
        fontSize: 16,
        fontWeight: '300',
        color: 'black',
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: 'System',
    },
    orangeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EC7E00',
    },
    bottomContainer: {
        paddingHorizontal: 30,
        paddingBottom: 30,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#EC7E00',
        width: 30,
    },
    inactiveDot: {
        backgroundColor: '#d1d5db',
    },
    footer: {
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#EC7E00',
        paddingVertical: 16,
        paddingHorizontal: 60,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    skipButton: {
        paddingVertical: 10,
    },
    skipText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '500',
    },
});
