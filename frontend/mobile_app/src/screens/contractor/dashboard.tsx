// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { View as SafeAreaView, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface Project {
  project_id: number;
  project_title: string;
  project_description: string;
  project_location: string;
  budget_range_min: number;
  budget_range_max: number;
  property_type: string;
  type_name: string;
  project_status: string;
  bidding_deadline?: string;
  owner_name: string;
  owner_profile_pic?: string;
  created_at: string;
}

interface Bid {
  bid_id: number;
  project_id: number;
  project_title: string;
  proposed_cost: number;
  estimated_timeline: string;
  bid_status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  submitted_at: string;
}

interface DashboardProps {
  userData?: {
    user_id?: number;
    username?: string;
    email?: string;
    profile_pic?: string;
    company_name?: string;
    contractor_type?: string;
    years_of_experience?: number;
  };
}

export default function ContractorDashboard({ userData }: DashboardProps) {
  const insets = useSafeAreaInsets();
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'bids'>('projects');
  const [error, setError] = useState<string | null>(null);
  
  // Get status bar height (top inset)
  const statusBarHeight = insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44);

  // Mock data for available projects
  const mockProjects: Project[] = [
    {
      project_id: 1,
      project_title: 'Commercial Building Construction',
      project_description: 'Looking for experienced contractor for a 3-story commercial building project',
      project_location: 'Cebu City, Cebu',
      budget_range_min: 5000000,
      budget_range_max: 8000000,
      property_type: 'Commercial',
      type_name: 'General Contractor',
      project_status: 'open',
      bidding_deadline: '2025-12-20',
      owner_name: 'Juan Dela Cruz',
      created_at: '2025-11-15',
    },
    {
      project_id: 2,
      project_title: 'Office Renovation',
      project_description: 'Complete renovation of 200sqm office space with modern interiors',
      project_location: 'Mandaue City, Cebu',
      budget_range_min: 800000,
      budget_range_max: 1200000,
      property_type: 'Commercial',
      type_name: 'Interior Designer',
      project_status: 'open',
      bidding_deadline: '2025-12-10',
      owner_name: 'Maria Santos',
      created_at: '2025-11-18',
    },
    {
      project_id: 3,
      project_title: 'Residential House - Architectural Design',
      project_description: 'Need architect for modern minimalist house design, 150sqm lot',
      project_location: 'Talisay City, Cebu',
      budget_range_min: 100000,
      budget_range_max: 200000,
      property_type: 'Residential',
      type_name: 'Architect',
      project_status: 'open',
      bidding_deadline: '2025-12-05',
      owner_name: 'Pedro Reyes',
      created_at: '2025-11-20',
    },
  ];

  // Mock data for bids
  const mockBids: Bid[] = [
    {
      bid_id: 1,
      project_id: 5,
      project_title: 'Warehouse Construction',
      proposed_cost: 4500000,
      estimated_timeline: '8 months',
      bid_status: 'pending',
      submitted_at: '2025-11-22',
    },
    {
      bid_id: 2,
      project_id: 6,
      project_title: 'Pool Installation',
      proposed_cost: 850000,
      estimated_timeline: '3 months',
      bid_status: 'accepted',
      submitted_at: '2025-11-10',
    },
    {
      bid_id: 3,
      project_id: 7,
      project_title: 'Fence Construction',
      proposed_cost: 120000,
      estimated_timeline: '2 weeks',
      bid_status: 'rejected',
      submitted_at: '2025-11-05',
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Connect to API - /api/contractor/available-projects and /api/contractor/bids
      // For now, use mock data
      setTimeout(() => {
        setAvailableProjects(mockProjects);
        setMyBids(mockBids);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load data');
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Calculate stats
  const stats = {
    availableProjects: availableProjects.length,
    submittedBids: myBids.filter(b => b.bid_status === 'pending').length,
    wonProjects: myBids.filter(b => b.bid_status === 'accepted').length,
    totalBids: myBids.length,
  };

  const formatBudget = (min: number, max: number) => {
    const formatNum = (n: number) => {
      if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `₱${(n / 1000).toFixed(0)}K`;
      return `₱${n}`;
    };
    return `${formatNum(min)} - ${formatNum(max)}`;
  };

  const formatCost = (cost: number) => {
    if (cost >= 1000000) return `₱${(cost / 1000000).toFixed(2)}M`;
    if (cost >= 1000) return `₱${(cost / 1000).toFixed(0)}K`;
    return `₱${cost}`;
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F39C12';
      case 'accepted': return '#42B883';
      case 'rejected': return '#E74C3C';
      case 'withdrawn': return '#999999';
      default: return '#666666';
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderStatCard = (icon: string, value: number, label: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <MaterialIcons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderProjectCard = (project: Project) => {
    const daysRemaining = project.bidding_deadline ? getDaysRemaining(project.bidding_deadline) : null;
    
    return (
      <TouchableOpacity key={project.project_id} style={styles.projectCard} activeOpacity={0.7}>
        <View style={styles.projectHeader}>
          <View style={styles.ownerInfo}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerInitials}>
                {project.owner_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </Text>
            </View>
            <View>
              <Text style={styles.ownerName}>{project.owner_name}</Text>
              <Text style={styles.postDate}>Posted {project.created_at}</Text>
            </View>
          </View>
          {daysRemaining !== null && (
            <View style={[styles.deadlineBadge, daysRemaining <= 3 && styles.deadlineUrgent]}>
              <MaterialIcons name="access-time" size={14} color={daysRemaining <= 3 ? '#E74C3C' : '#F39C12'} />
              <Text style={[styles.deadlineText, daysRemaining <= 3 && styles.deadlineTextUrgent]}>
                {daysRemaining > 0 ? `${daysRemaining}d left` : 'Due today'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.projectTitle}>{project.project_title}</Text>
        <View style={styles.projectTypeBadge}>
          <MaterialIcons name="business" size={14} color="#1877F2" />
          <Text style={styles.projectTypeText}>{project.type_name}</Text>
        </View>
        
        <Text style={styles.projectDescription} numberOfLines={2}>
          {project.project_description}
        </Text>

        <View style={styles.projectDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color="#666666" />
            <Text style={styles.detailText}>{project.project_location}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="account-balance-wallet" size={16} color="#666666" />
            <Text style={styles.detailText}>{formatBudget(project.budget_range_min, project.budget_range_max)}</Text>
          </View>
        </View>

        <View style={styles.projectFooter}>
          <TouchableOpacity style={styles.bidButton}>
            <MaterialIcons name="gavel" size={18} color="#FFFFFF" />
            <Text style={styles.bidButtonText}>Place Bid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBidCard = (bid: Bid) => (
    <TouchableOpacity key={bid.bid_id} style={styles.bidCard} activeOpacity={0.7}>
      <View style={styles.bidHeader}>
        <Text style={styles.bidProjectTitle} numberOfLines={1}>{bid.project_title}</Text>
        <View style={[styles.bidStatusBadge, { backgroundColor: `${getBidStatusColor(bid.bid_status)}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: getBidStatusColor(bid.bid_status) }]} />
          <Text style={[styles.bidStatusText, { color: getBidStatusColor(bid.bid_status) }]}>
            {bid.bid_status.charAt(0).toUpperCase() + bid.bid_status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bidDetails}>
        <View style={styles.bidDetailItem}>
          <Text style={styles.bidDetailLabel}>Proposed Cost</Text>
          <Text style={styles.bidDetailValue}>{formatCost(bid.proposed_cost)}</Text>
        </View>
        <View style={styles.bidDetailItem}>
          <Text style={styles.bidDetailLabel}>Timeline</Text>
          <Text style={styles.bidDetailValue}>{bid.estimated_timeline}</Text>
        </View>
        <View style={styles.bidDetailItem}>
          <Text style={styles.bidDetailLabel}>Submitted</Text>
          <Text style={styles.bidDetailValue}>{bid.submitted_at}</Text>
        </View>
      </View>

      {bid.bid_status === 'accepted' && (
        <TouchableOpacity style={styles.startProjectButton}>
          <MaterialIcons name="play-arrow" size={18} color="#FFFFFF" />
          <Text style={styles.startProjectText}>Start Project</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
        <StatusBar hidden={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1877F2" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
      <StatusBar hidden={true} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1877F2']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.companyName}>{userData?.company_name || 'Contractor'}</Text>
            {userData?.contractor_type && (
              <Text style={styles.contractorType}>{userData.contractor_type}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('work', stats.availableProjects, 'Available', '#1877F2')}
            {renderStatCard('gavel', stats.submittedBids, 'Pending Bids', '#F39C12')}
            {renderStatCard('emoji-events', stats.wonProjects, 'Won', '#42B883')}
            {renderStatCard('history', stats.totalBids, 'Total Bids', '#333333')}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#1877F215' }]}>
                <MaterialIcons name="search" size={28} color="#1877F2" />
              </View>
              <Text style={styles.quickActionText}>Browse Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F39C1215' }]}>
                <MaterialIcons name="list-alt" size={28} color="#F39C12" />
              </View>
              <Text style={styles.quickActionText}>My Bids</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#42B88315' }]}>
                <MaterialIcons name="assignment" size={28} color="#42B883" />
              </View>
              <Text style={styles.quickActionText}>Active Projects</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'projects' && styles.tabActive]}
            onPress={() => setActiveTab('projects')}
          >
            <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
              Available Projects
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bids' && styles.tabActive]}
            onPress={() => setActiveTab('bids')}
          >
            <Text style={[styles.tabText, activeTab === 'bids' && styles.tabTextActive]}>
              My Bids
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        <View style={styles.contentContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color="#E74C3C" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === 'projects' ? (
            availableProjects.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="work-off" size={64} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Projects Available</Text>
                <Text style={styles.emptyText}>Check back later for new project opportunities</Text>
              </View>
            ) : (
              availableProjects.map(project => renderProjectCard(project))
            )
          ) : (
            myBids.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="gavel" size={64} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Bids Yet</Text>
                <Text style={styles.emptyText}>Browse available projects and submit your first bid</Text>
                <TouchableOpacity style={styles.browseButton} onPress={() => setActiveTab('projects')}>
                  <Text style={styles.browseButtonText}>Browse Projects</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myBids.map(bid => renderBidCard(bid))
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#666666',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 2,
  },
  contractorType: {
    fontSize: 13,
    color: '#1877F2',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  tabTextActive: {
    color: '#1877F2',
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ownerInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  postDate: {
    fontSize: 12,
    color: '#999999',
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  deadlineUrgent: {
    backgroundColor: '#FFEBE5',
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F39C12',
  },
  deadlineTextUrgent: {
    color: '#E74C3C',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  projectTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  projectTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1877F2',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666666',
  },
  projectFooter: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  bidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1877F2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewDetailsButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  viewDetailsText: {
    color: '#1877F2',
    fontSize: 14,
    fontWeight: '500',
  },
  bidCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bidProjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 12,
  },
  bidStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bidStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bidDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bidDetailItem: {
    alignItems: 'center',
  },
  bidDetailLabel: {
    fontSize: 11,
    color: '#999999',
    marginBottom: 4,
  },
  bidDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  startProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#42B883',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 6,
  },
  startProjectText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#1877F2',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  browseButton: {
    backgroundColor: '#1877F2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

