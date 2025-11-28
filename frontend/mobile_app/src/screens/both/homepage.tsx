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
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { contractors_service, Contractor as ContractorType } from '../../services/contractors_service';

// Import profile screens
import PropertyOwnerProfile from '../owner/profile';
import ContractorProfile from '../contractor/profile';

// Import dashboard screens
import PropertyOwnerDashboard from '../owner/dashboard';
import ContractorDashboard from '../contractor/dashboard';

// Import messages screen
import MessagesScreen from './messages';

// Default cover photo
const defaultCoverPhoto = require('../../../assets/images/pictures/cp_default.jpg');

const { width } = Dimensions.get('window');

interface UserData {
  user_id?: number;
  username?: string;
  email?: string;
  profile_pic?: string;
  cover_photo?: string;
  user_type?: 'property_owner' | 'contractor' | 'both';
  // Contractor-specific fields
  company_name?: string;
  contractor_type?: string;
  years_of_experience?: number;
}

interface HomepageProps {
  userType?: 'property_owner' | 'contractor';
  userData?: UserData;
  onLogout?: () => void;
}

export default function HomepageScreen({ userType = 'property_owner', userData, onLogout }: HomepageProps) {
  const insets = useSafeAreaInsets();
  const [popularContractors, setPopularContractors] = useState<ContractorType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [error, setError] = useState<string | null>(null);
  
  // Get status bar height (top inset)
  const statusBarHeight = insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44);

  // Handle logout - calls the parent callback
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  /**
   * Fetch active contractors from the backend API
   * This replaces the mock data with real data from the database
   * Uses the contractors_service which calls the backend's getActiveContractors() method
   */
  useEffect(() => {
    const fetchContractors = async () => {
      // Only fetch contractors for property owners (contractors see projects instead)
      if (userType !== 'property_owner') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch contractors from backend API
        // The backend endpoint should return data from getActiveContractors() method
        const response = await contractors_service.get_active_contractors();

        // API response structure: { success: true, data: { success: true, data: [...contractors] } }
        // The actual contractors array is nested inside response.data.data
        const contractorsData = response.data?.data || response.data;
        
        if (response.success && contractorsData && Array.isArray(contractorsData)) {
          // Transform backend contractor data to frontend format
          const transformedContractors = contractors_service.transform_contractors(contractorsData);
          setPopularContractors(transformedContractors);
        } else {
          // Handle API error response
          const errorMessage = response.message || 'Failed to load contractors';
          setError(errorMessage);
          console.warn('Failed to load contractors:', errorMessage);
        }
      } catch (err) {
        // Handle network or unexpected errors
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Unexpected error fetching contractors:', err);
        
        Alert.alert(
          'Error',
          'Failed to load contractors. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractors();
  }, [userType]);

  /**
   * Generate initials from company name (matching backend logic)
   * Backend uses: strtoupper(substr($contractor->company_name, 0, 2))
   */
  const getCompanyInitials = (companyName: string): string => {
    return companyName.substring(0, 2).toUpperCase();
  };

  /**
   * Generate background color based on user_id or contractor_id (matching backend logic)
   * Backend uses: ($contractor->user_id ?? $contractor->contractor_id) % 8
   */
  const getColorForContractor = (contractorId: number, userId?: number): string => {
    const colors = ['#1877f2', '#42b883', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'];
    const index = (userId ?? contractorId) % 8;
    return colors[index];
  };

  /**
   * Render a single contractor card
   * Displays contractor information matching the backend dashboard.blade.php structure
   * This mirrors the exact display logic from lines 322-393 of dashboard.blade.php
   */
  const renderContractorCard = ({ item }: { item: ContractorType }) => {
    // Check if contractor has a cover photo
    const hasCoverPhoto = item.cover_photo && !item.cover_photo.includes('placeholder');
    const coverPhotoUri = hasCoverPhoto 
      ? `http://192.168.254.131:3000/storage/${item.cover_photo}`
      : null;
    
    return (
    <TouchableOpacity style={styles.contractorCard}>
      <View style={styles.cardImageContainer}>
        {/* Cover Photo - use default if no cover photo */}
        <Image
          source={coverPhotoUri ? { uri: coverPhotoUri } : defaultCoverPhoto}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardCompanyName}>{item.company_name}</Text>
        
        {/* Company Description */}
        {item.company_description && (
          <Text style={styles.cardCompanyDescription} numberOfLines={2}>
            {item.company_description}
          </Text>
        )}
        
        {/* Location */}
        {item.location && (
          <View style={styles.cardInfoRow}>
            <MaterialIcons name="location-on" size={16} color="#666666" />
            <Text style={styles.cardLocation}>{item.location}</Text>
          </View>
        )}
        
        {/* Rating and Reviews */}
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
        
        {/* Contractor Type and Experience - matching backend meta display */}
        <View style={styles.cardTypeRow}>
          <MaterialIcons name="business" size={16} color="#EC7E00" />
          <Text style={styles.cardType}>{item.contractor_type || 'Contractor'}</Text>
          {item.years_of_experience !== undefined && (
            <Text style={styles.cardExperience}>
              • {item.years_of_experience} {item.years_of_experience === 1 ? 'year' : 'years'} experience
            </Text>
          )}
        </View>
        
        {/* Services Offered - matching backend display */}
        {item.services_offered && (
          <View style={styles.cardInfoRow}>
            <MaterialIcons name="work" size={16} color="#666666" />
            <Text style={styles.cardServices}>
              <Text style={styles.cardServicesLabel}>Services: </Text>
              {item.services_offered}
            </Text>
          </View>
        )}
        
        {/* Completed Projects */}
        {item.completed_projects !== undefined && item.completed_projects > 0 && (
          <View style={styles.cardInfoRow}>
            <MaterialIcons name="check-circle" size={16} color="#42B883" />
            <Text style={styles.cardProjects}>
              {item.completed_projects} {item.completed_projects === 1 ? 'project' : 'projects'} completed
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
    );
  };

  // Render the home content (contractors feed for property owners)
  const renderHomeContent = () => (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* User Profile and Project Input */}
      <View style={styles.profileSection}>
        <Image
          source={{ 
            uri: userData?.profile_pic 
              ? `http://192.168.254.131:3000/storage/${userData.profile_pic}`
              : 'https://via.placeholder.com/60' 
          }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.projectInput}>
          <Text style={styles.projectInputText}>Post your project</Text>
        </TouchableOpacity>
      </View>

      {/* Popular Contractors Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Contractors</Text>
        
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EC7E00" />
            <Text style={styles.loadingText}>Loading contractors...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#E74C3C" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                // Retry fetching contractors
                setError(null);
                setIsLoading(true);
                contractors_service.get_active_contractors()
                  .then(response => {
                    const contractorsData = response.data?.data || response.data;
                    if (response.success && contractorsData && Array.isArray(contractorsData)) {
                      const transformedContractors = contractors_service.transform_contractors(contractorsData);
                      setPopularContractors(transformedContractors);
                    }
                  })
                  .finally(() => setIsLoading(false));
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && popularContractors.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="business" size={48} color="#999999" />
            <Text style={styles.emptyText}>No contractors available at the moment</Text>
          </View>
        )}

        {/* Contractors List */}
        {!isLoading && !error && popularContractors.length > 0 && (
          <>
            {popularContractors.map((contractor) => (
              <View key={contractor.contractor_id}>
                {renderContractorCard({ item: contractor })}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );

  // Render profile based on user type
  const renderProfileContent = () => {
    // For contractors, show the contractor profile
    if (userType === 'contractor') {
      return (
        <ContractorProfile 
          onLogout={handleLogout}
          userData={{
            username: userData?.username,
            email: userData?.email,
            profile_pic: userData?.profile_pic 
              ? `http://192.168.254.131:3000/storage/${userData.profile_pic}`
              : undefined,
            cover_photo: userData?.cover_photo
              ? `http://192.168.254.131:3000/storage/${userData.cover_photo}`
              : undefined,
            user_type: userData?.user_type,
            company_name: userData?.company_name,
            contractor_type: userData?.contractor_type,
            years_of_experience: userData?.years_of_experience,
          }}
        />
      );
    }
    
    // For property owners (and default), show property owner profile
    return (
      <PropertyOwnerProfile 
        onLogout={handleLogout}
        userData={{
          username: userData?.username,
          email: userData?.email,
          profile_pic: userData?.profile_pic 
            ? `http://192.168.254.131:3000/storage/${userData.profile_pic}`
            : undefined,
          cover_photo: userData?.cover_photo
            ? `http://192.168.254.131:3000/storage/${userData.cover_photo}`
            : undefined,
          user_type: userData?.user_type,
        }}
      />
    );
  };

  // Render dashboard based on user type
  const renderDashboardContent = () => {
    // For contractors, show the contractor dashboard
    if (userType === 'contractor') {
      return (
        <ContractorDashboard 
          userData={{
            user_id: userData?.user_id,
            username: userData?.username,
            email: userData?.email,
            profile_pic: userData?.profile_pic 
              ? `http://192.168.254.131:3000/storage/${userData.profile_pic}`
              : undefined,
            company_name: userData?.company_name,
            contractor_type: userData?.contractor_type,
            years_of_experience: userData?.years_of_experience,
          }}
        />
      );
    }
    
    // For property owners (and default), show property owner dashboard
    return (
      <PropertyOwnerDashboard 
        userData={{
          user_id: userData?.user_id,
          username: userData?.username,
          email: userData?.email,
          profile_pic: userData?.profile_pic 
            ? `http://192.168.254.131:3000/storage/${userData.profile_pic}`
            : undefined,
        }}
      />
    );
  };

  // Render messages screen
  const renderMessagesContent = () => (
    <MessagesScreen 
      userData={{
        user_id: userData?.user_id,
        username: userData?.username,
        email: userData?.email,
        profile_pic: userData?.profile_pic 
          ? `http://192.168.254.131:3000/storage/${userData.profile_pic}`
          : undefined,
        user_type: userData?.user_type,
      }}
    />
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'dashboard':
        return renderDashboardContent();
      case 'messages':
        return renderMessagesContent();
      case 'profile':
        return renderProfileContent();
      default:
        return renderHomeContent();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <StatusBar hidden={true} />
      {/* Header - only show on non-profile tabs */}
      {activeTab !== 'profile' && (
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
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>
        {renderContent()}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
        >
          <MaterialIcons 
            name="home" 
            size={26} 
            color={activeTab === 'home' ? '#EC7E00' : '#8E8E93'} 
          />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons 
            name={activeTab === 'dashboard' ? 'grid' : 'grid-outline'} 
            size={24} 
            color={activeTab === 'dashboard' ? '#EC7E00' : '#8E8E93'} 
          />
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('messages')}
        >
          <Ionicons 
            name={activeTab === 'messages' ? 'chatbubble' : 'chatbubble-outline'} 
            size={24} 
            color={activeTab === 'messages' ? '#EC7E00' : '#8E8E93'} 
          />
          <Text style={[styles.navText, activeTab === 'messages' && styles.navTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={24} 
            color={activeTab === 'profile' ? '#EC7E00' : '#8E8E93'} 
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
  mainContent: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 8,
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
  cardCompanyDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
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
  cardExperience: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  cardProjects: {
    fontSize: 14,
    color: '#42B883',
    fontWeight: '500',
  },
  cardServices: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
    flexWrap: 'wrap',
  },
  cardServicesLabel: {
    fontWeight: '600',
    color: '#333333',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#EC7E00',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#EC7E00',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
