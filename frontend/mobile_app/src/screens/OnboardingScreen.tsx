// @ts-nocheck
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
    current_screen: number;
    on_next: () => void;
    on_get_started: () => void;
}

const onboarding_data = [
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
    current_screen,
    on_next,
    on_get_started
}: OnboardingScreenProps) {
    const [active_slide, set_active_slide] = useState(0);
    const scroll_view_ref = useRef<ScrollView>(null);

    const is_last_screen = active_slide === onboarding_data.length - 1;

    const handle_scroll = (event: any) => {
        const slide_index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        set_active_slide(slide_index);
    };

    const go_to_slide = (index: number) => {
        set_active_slide(index);
        scroll_view_ref.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    };

    const handle_next = () => {
        if (active_slide < onboarding_data.length - 1) {
            go_to_slide(active_slide + 1);
        } else {
            on_get_started();
        }
    };

    const render_styled_text = (text: string, highlight_words: string[]) => {
        let styled_text = text;
        highlight_words.forEach(word => {
            styled_text = styled_text.replace(
                word,
                `<ORANGE>${word}</ORANGE>`
            );
        });

        const parts = styled_text.split(/(<ORANGE>.*?<\/ORANGE>)/);

        return (
            <Text style={styles.text}>
                {parts.map((part, index) => {
                    if (part.startsWith('<ORANGE>') && part.endsWith('</ORANGE>')) {
                        const orange_text = part.replace(/<\/?ORANGE>/g, '');
                        return (
                            <Text key={index} style={styles.orange_text}>
                                {orange_text}
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
                ref={scroll_view_ref}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handle_scroll}
                style={styles.scroll_view}
                contentContainerStyle={styles.scroll_content}
            >
                {onboarding_data.map((item, index) => (
                    <View key={index} style={styles.slide}>
                        <View style={styles.image_container}>
                            <Image
                                source={item.image}
                                style={styles.slide_image}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.text_container}>
                            {index === 0 && render_styled_text("Post projects, compare bids, and choose the best option with ease.", ["best option"])}
                            {index === 1 && render_styled_text("Monitor progress with real-time updates from site to home.", ["real-time updates"])}
                            {index === 2 && render_styled_text("With Legatura, Celebrate success with completed projects delivered on time", ["Legatura"])}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.bottom_container}>
                <View style={styles.pagination}>
                    {onboarding_data.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.pagination_dot,
                                index === active_slide ? styles.active_dot : styles.inactive_dot
                            ]}
                            onPress={() => go_to_slide(index)}
                        />
                    ))}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handle_next}
                    >
                        <Text style={styles.button_text}>
                            {is_last_screen ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>

                    {!is_last_screen && (
                        <TouchableOpacity style={styles.skip_button} onPress={on_get_started}>
                            <Text style={styles.skip_text}>Skip</Text>
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
    scroll_view: {
        flex: 1,
    },
    scroll_content: {
        flexDirection: 'row',
    },
    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    image_container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: SCREEN_WIDTH,
    },
    slide_image: {
        width: 430,
        height: 430,
        resizeMode: 'contain',
    },
    text_container: {
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
    orange_text: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EC7E00',
    },
    bottom_container: {
        paddingHorizontal: 30,
        paddingBottom: 30,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    pagination_dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    active_dot: {
        backgroundColor: '#EC7E00',
        width: 30,
    },
    inactive_dot: {
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
    button_text: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    skip_button: {
        paddingVertical: 10,
    },
    skip_text: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '500',
    },
});
