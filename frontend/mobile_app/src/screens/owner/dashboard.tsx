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
  project_post_status: string;
  bidding_deadline?: string;
  created_at: string;
}

interface DashboardProps {
  userData?: {
    user_id?: number;
    username?: string;
    email?: string;
    profile_pic?: string;
  };
}

export default function PropertyOwnerDashboard({ userData }: DashboardProps) {
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get status bar height (top inset)
  const statusBarHeight = insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44);

  // Mock data for now - will connect to API later
  const mockProjects: Project[] = [
    {
      project_id: 1,
      project_title: 'Modern House Construction',
      project_description: 'Looking for a contractor to build a 2-story modern house',
      project_location: 'Cebu City, Cebu',
      budget_range_min: 2000000,
      budget_range_max: 3500000,
      property_type: 'Residential',
      type_name: 'General Contractor',
      project_status: 'open',
      project_post_status: 'approved',
      bidding_deadline: '2025-12-15',
      created_at: '2025-11-20',
    },
    {
      project_id: 2,
      project_title: 'Kitchen Renovation',
      project_description: 'Complete kitchen remodel with modern appliances',
      project_location: 'Mandaue City, Cebu',
      budget_range_min: 150000,
      budget_range_max: 300000,
      property_type: 'Residential',
      type_name: 'Interior Designer',
      project_status: 'bidding_closed',
      project_post_status: 'approved',
      bidding_deadline: '2025-11-10',
      created_at: '2025-11-01',
    },
    {
      project_id: 3,
      project_title: 'Garden Landscaping',
      project_description: 'Landscape design for front and backyard',
      project_location: 'Lapu-Lapu City, Cebu',
      budget_range_min: 80000,
      budget_range_max: 150000,
      property_type: 'Residential',
      type_name: 'Landscaper',
      project_status: 'open',
      project_post_status: 'under_review',
      created_at: '2025-11-25',
    },
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Connect to API - /api/owner/projects
      // For now, use mock data
      setTimeout(() => {
        setProjects(mockProjects);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load projects');
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  // Calculate stats
  const stats = {
    total: projects.length,
    pending: projects.filter(p => p.project_post_status === 'under_review').length,
    approved: projects.filter(p => p.project_post_status === 'approved' && p.project_status === 'open').length,
    inProgress: projects.filter(p => p.project_status === 'bidding_closed' || p.project_status === 'in_progress').length,
    completed: projects.filter(p => p.project_status === 'completed').length,
  };

  const formatBudget = (min: number, max: number) => {
    const formatNum = (n: number) => {
      if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `₱${(n / 1000).toFixed(0)}K`;
      return `₱${n}`;
    };
    return `${formatNum(min)} - ${formatNum(max)}`;
  };

  const getStatusColor = (status: string, postStatus: string) => {
    if (postStatus === 'under_review') return '#F39C12';
    if (status === 'open') return '#42B883';
    if (status === 'bidding_closed' || status === 'in_progress') return '#1877F2';
    if (status === 'completed') return '#27AE60';
    return '#999999';
  };

  const getStatusLabel = (status: string, postStatus: string) => {
    if (postStatus === 'under_review') return 'Under Review';
    if (status === 'open') return 'Open for Bidding';
    if (status === 'bidding_closed') return 'Bidding Closed';
    if (status === 'in_progress') return 'In Progress';
    if (status === 'completed') return 'Completed';
    return status;
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

  const renderProjectCard = (project: Project) => (
    <TouchableOpacity key={project.project_id} style={styles.projectCard} activeOpacity={0.7}>
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleRow}>
          <Text style={styles.projectTitle} numberOfLines={1}>{project.project_title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(project.project_status, project.project_post_status)}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.project_status, project.project_post_status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(project.project_status, project.project_post_status) }]}>
              {getStatusLabel(project.project_status, project.project_post_status)}
            </Text>
          </View>
        </View>
        <Text style={styles.projectType}>{project.type_name}</Text>
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
          <MaterialIcons name="attach-money" size={16} color="#666666" />
          <Text style={styles.detailText}>{formatBudget(project.budget_range_min, project.budget_range_max)}</Text>
        </View>
        {project.bidding_deadline && (
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={16} color="#666666" />
            <Text style={styles.detailText}>Deadline: {project.bidding_deadline}</Text>
          </View>
        )}
      </View>

      <View style={styles.projectFooter}>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
          <MaterialIcons name="chevron-right" size={20} color="#EC7E00" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: statusBarHeight }]}>
        <StatusBar hidden={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC7E00" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EC7E00']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.username || 'Property Owner'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333333" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('folder', stats.total, 'Total Projects', '#333333')}
            {renderStatCard('hourglass-empty', stats.pending, 'Pending', '#F39C12')}
            {renderStatCard('check-circle', stats.approved, 'Active', '#42B883')}
            {renderStatCard('trending-up', stats.inProgress, 'In Progress', '#1877F2')}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#EC7E0015' }]}>
                <MaterialIcons name="add" size={28} color="#EC7E00" />
              </View>
              <Text style={styles.quickActionText}>New Project</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#1877F215' }]}>
                <MaterialIcons name="search" size={28} color="#1877F2" />
              </View>
              <Text style={styles.quickActionText}>Find Contractors</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#42B88315' }]}>
                <MaterialIcons name="description" size={28} color="#42B883" />
              </View>
              <Text style={styles.quickActionText}>View Bids</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Projects */}
        <View style={styles.projectsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Projects</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color="#E74C3C" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : projects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="folder-open" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>No Projects Yet</Text>
              <Text style={styles.emptyText}>Create your first project to start finding contractors</Text>
              <TouchableOpacity style={styles.createButton}>
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            projects.map(project => renderProjectCard(project))
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#666666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 2,
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
  projectsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#EC7E00',
    fontWeight: '500',
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
    marginBottom: 12,
  },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
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
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  projectType: {
    fontSize: 13,
    color: '#EC7E00',
    fontWeight: '500',
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
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#EC7E00',
    fontWeight: '500',
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
    backgroundColor: '#EC7E00',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC7E00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

