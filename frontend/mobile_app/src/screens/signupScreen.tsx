// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SignupScreenProps {
  on_back: () => void;
  on_contractor_signup: () => void;
  on_property_owner_signup: () => void;
}

export default function SignupScreen({ on_back, on_contractor_signup, on_property_owner_signup }: SignupScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll_content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={on_back} style={styles.back_button}>
            <Text style={styles.back_text}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logo_container}>
          <Image
            source={require('../../assets/images/logos/legatura-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <View style={styles.title_container}>
          <Text style={styles.title}>Join Legatura</Text>
          <Text style={styles.subtitle}>Choose your account type to get started</Text>
        </View>

        {/* Account Type Cards */}
        <View style={styles.cards_container}>
          {/* Contractor Card */}
          <TouchableOpacity
            style={styles.account_card}
            onPress={on_contractor_signup}
          >
            <View style={styles.card_content}>
              <View style={styles.card_icon_container}>
                <Text style={styles.card_icon}>🔨</Text>
              </View>
              <View style={styles.card_text_container}>
                <Text style={styles.card_title}>I'm a Contractor</Text>
                <Text style={styles.card_description}>
                  Offer your services, find projects, and grow your business
                </Text>
              </View>
              <View style={styles.card_arrow}>
                <Text style={styles.arrow_text}>→</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Property Owner Card */}
          <TouchableOpacity
            style={styles.account_card}
            onPress={on_property_owner_signup}
          >
            <View style={styles.card_content}>
              <View style={styles.card_icon_container}>
                <Text style={styles.card_icon}>🏠</Text>
              </View>
              <View style={styles.card_text_container}>
                <Text style={styles.card_title}>I'm a Property Owner</Text>
                <Text style={styles.card_description}>
                  Find trusted contractors for your construction projects
                </Text>
              </View>
              <View style={styles.card_arrow}>
                <Text style={styles.arrow_text}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefits_container}>
          <Text style={styles.benefits_title}>What you get with Legatura:</Text>
          <View style={styles.benefit_item}>
            <Text style={styles.benefit_icon}>✓</Text>
            <Text style={styles.benefit_text}>Verified professionals and projects</Text>
          </View>
          <View style={styles.benefit_item}>
            <Text style={styles.benefit_icon}>✓</Text>
            <Text style={styles.benefit_text}>Secure payment processing</Text>
          </View>
          <View style={styles.benefit_item}>
            <Text style={styles.benefit_icon}>✓</Text>
            <Text style={styles.benefit_text}>24/7 customer support</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footer_text}>
            Already have an account?
            <Text style={styles.link_text}> Login here</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  scroll_content: {
    flexGrow: 1,
    paddingHorizontal: 30,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  back_button: {
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  back_text: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  back_text: {
    fontSize: 16,
    color: '#EC7E00',
    fontWeight: '500',
  },
  logo_container: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 60,
  },
  title_container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  cards_container: {
    marginBottom: 40,
  },
  account_card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  card_content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  card_icon_container: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF7ED',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  card_icon: {
    fontSize: 24,
  },
  card_text_container: {
    flex: 1,
  },
  card_title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  card_description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  card_arrow: {
    width: 30,
    alignItems: 'center',
  },
  arrow_text: {
    fontSize: 20,
    color: '#EC7E00',
    fontWeight: 'bold',
  },
  benefits_container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
  },
  benefits_title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefit_item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefit_icon: {
    fontSize: 16,
    color: '#22C55E',
    fontWeight: 'bold',
    marginRight: 12,
    width: 20,
  },
  benefit_text: {
    fontSize: 16,
    color: '#555555',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footer_text: {
    fontSize: 16,
    color: '#666666',
  },
  link_text: {
    color: '#EC7E00',
    fontWeight: '600',
  },
});