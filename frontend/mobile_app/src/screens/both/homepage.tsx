// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Contractor {
  contractor_id: number;
  company_name: string;
  company_description?: string;
  location?: string;
  rating?: number;
  reviews_count?: number;
  distance?: string;
  contractor_type?: string;
  logo_url?: string;
  image_url?: string;
}

interface HomepageProps {
  userType?: 'property_owner' | 'contractor';
}

export default function HomepageScreen({ userType = 'property_owner' }: HomepageProps) {
  const [popularContractors, setPopularContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Mock data for now - will be replaced with API call
  useEffect(() => {
    // TODO: Fetch popular contractors from backend
    const mockContractors: Contractor[] = [
      {
        contractor_id: 1,
        company_name: 'GTH Builders and Developers',
        location: 'Zamboanga City',
        rating: 5.0,
        reviews_count: 128,
        distance: '3.5 km/50min',
        contractor_type: 'General Contractor',
        image_url: 'https://via.placeholder.com/400x200',
      },
      {
        contractor_id: 2,
        company_name: 'Cabanting Architects',
        location: 'Zamboanga City',
        rating: 5.0,
        reviews_count: 128,
        distance: '2.5 km/40min',
        contractor_type: 'General Contractor',
        image_url: 'https://via.placeholder.com/400x200',
      },
    ];
    setPopularContractors(mockContractors);
  }, []);

  const renderContractorCard = ({ item }: { item: Contractor }) => (
    <TouchableOpacity style={styles.contractorCard}>
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: item.image_url || 'https://via.placeholder.com/400x200' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardLogoContainer}>
          <View style={styles.cardLogo}>
            <Text style={styles.cardLogoText}>
              {item.company_name.split(' ').map(w => w[0]).join('').substring(0, 3)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardCompanyName}>{item.company_name}</Text>
        <Text style={styles.cardCompanyNameSmall}>{item.company_name}</Text>
        
        <View style={styles.cardInfoRow}>
          <MaterialIcons name="location-on" size={16} color="#666666" />
          <Text style={styles.cardLocation}>{item.location}</Text>
        </View>
        
        <View style={styles.cardRatingRow}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '5.0'}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons key={star} name="star" size={14} color="#EC7E00" />
              ))}
            </View>
          </View>
          <Text style={styles.reviewsText}>({item.reviews_count || 0} Reviews)</Text>
        </View>
        
        <View style={styles.cardInfoRow}>
          <MaterialIcons name="access-time" size={16} color="#666666" />
          <Text style={styles.cardDistance}>{item.distance || 'N/A'}</Text>
        </View>
        
        <View style={styles.cardTypeRow}>
          <MaterialIcons name="business" size={16} color="#EC7E00" />
          <Text style={styles.cardType}>{item.contractor_type || 'Contractor'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>LEGATURA</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="search" size={24} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="notifications" size={24} color="#333333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile and Project Input */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.projectInput}>
            <Text style={styles.projectInputText}>Post your project</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Contractors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Contractors</Text>
          {popularContractors.map((contractor) => (
            <View key={contractor.contractor_id}>
              {renderContractorCard({ item: contractor })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
        >
          <MaterialIcons 
            name="home" 
            size={24} 
            color={activeTab === 'home' ? '#EC7E00' : '#666666'} 
          />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <MaterialIcons 
            name="dashboard" 
            size={24} 
            color={activeTab === 'dashboard' ? '#EC7E00' : '#666666'} 
          />
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('messages')}
        >
          <MaterialIcons 
            name="message" 
            size={24} 
            color={activeTab === 'messages' ? '#EC7E00' : '#666666'} 
          />
          <Text style={[styles.navText, activeTab === 'messages' && styles.navTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <MaterialIcons 
            name="person" 
            size={24} 
            color={activeTab === 'profile' ? '#EC7E00' : '#666666'} 
          />
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>
            Profile
          </Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EC7E00',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5E5',
  },
  projectInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  projectInputText: {
    fontSize: 16,
    color: '#999999',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  contractorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: '#E5E5E5',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardLogoContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cardLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EC7E00',
  },
  cardLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardCompanyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardCompanyNameSmall: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666666',
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewsText: {
    fontSize: 12,
    color: '#666666',
  },
  cardDistance: {
    fontSize: 14,
    color: '#666666',
  },
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  cardType: {
    fontSize: 14,
    color: '#EC7E00',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#EC7E00',
    fontWeight: '600',
  },
});
