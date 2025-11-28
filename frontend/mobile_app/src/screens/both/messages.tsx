// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  is_own: boolean;
}

interface Conversation {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  user_type: 'property_owner' | 'contractor';
  project_title?: string;
}

interface MessagesScreenProps {
  userData?: {
    user_id?: number;
    username?: string;
    email?: string;
    profile_pic?: string;
    user_type?: string;
  };
}

export default function MessagesScreen({ userData }: MessagesScreenProps) {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Get status bar height (top inset)
  const statusBarHeight = insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44);

  // Mock conversations data
  const mockConversations: Conversation[] = [
    {
      id: 1,
      user_id: 2,
      user_name: 'ABC Construction Co.',
      user_avatar: undefined,
      last_message: 'Thank you for considering our bid. We can start next week.',
      last_message_time: '2 hours ago',
      unread_count: 2,
      user_type: 'contractor',
      project_title: 'Modern House Construction',
    },
    {
      id: 2,
      user_id: 3,
      user_name: 'Juan Dela Cruz',
      user_avatar: undefined,
      last_message: 'When can we schedule a site visit?',
      last_message_time: '1 day ago',
      unread_count: 0,
      user_type: 'property_owner',
      project_title: 'Kitchen Renovation',
    },
    {
      id: 3,
      user_id: 4,
      user_name: 'XYZ Builders',
      user_avatar: undefined,
      last_message: 'We have completed the initial assessment.',
      last_message_time: '3 days ago',
      unread_count: 1,
      user_type: 'contractor',
      project_title: 'Garden Landscaping',
    },
  ];

  // Mock messages for selected conversation
  const mockMessages: Message[] = [
    {
      id: 1,
      sender_id: 2,
      sender_name: 'ABC Construction Co.',
      message: 'Hello! Thank you for considering our bid for your Modern House Construction project.',
      timestamp: '2025-11-20 10:30 AM',
      is_read: true,
      is_own: false,
    },
    {
      id: 2,
      sender_id: userData?.user_id || 1,
      sender_name: userData?.username || 'You',
      message: 'Hi! I received your proposal. Can you tell me more about your timeline?',
      timestamp: '2025-11-20 11:15 AM',
      is_read: true,
      is_own: true,
    },
    {
      id: 3,
      sender_id: 2,
      sender_name: 'ABC Construction Co.',
      message: 'Thank you for considering our bid. We can start next week.',
      timestamp: '2 hours ago',
      is_read: false,
      is_own: false,
    },
  ];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      // TODO: Connect to API - /api/messages/conversations
      // For now, use mock data
      setTimeout(() => {
        setConversations(mockConversations);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      // TODO: Connect to API - /api/messages/{conversationId}
      // For now, use mock data
      setMessages(mockMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      // TODO: Connect to API - POST /api/messages/send
      const newMessage: Message = {
        id: messages.length + 1,
        sender_id: userData?.user_id || 1,
        sender_name: userData?.username || 'You',
        message: messageText,
        timestamp: 'Just now',
        is_read: false,
        is_own: true,
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
      setSending(false);
    } catch (err) {
      setSending(false);
      console.error('Error sending message:', err);
    }
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  };

  const formatTime = (timeString: string) => {
    // If it's a relative time like "2 hours ago", return as is
    if (timeString.includes('ago') || timeString === 'Just now') {
      return timeString;
    }
    // Otherwise format the timestamp
    return timeString;
  };

  const renderConversationItem = (conversation: Conversation) => {
    const hasUnread = conversation.unread_count > 0;
    const bgColor = ['#1877f2', '#42b883', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'][conversation.user_id % 8];
    
    return (
      <TouchableOpacity
        key={conversation.id}
        style={[styles.conversationItem, hasUnread && styles.conversationItemUnread]}
        onPress={() => setSelectedConversation(conversation)}
        activeOpacity={0.7}
      >
        <View style={styles.conversationAvatar}>
          {conversation.user_avatar ? (
            <Image
              source={{ uri: conversation.user_avatar }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: bgColor }]}>
              <Text style={styles.avatarText}>{getInitials(conversation.user_name)}</Text>
            </View>
          )}
          {hasUnread && <View style={styles.unreadBadge} />}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, hasUnread && styles.conversationNameUnread]} numberOfLines={1}>
              {conversation.user_name}
            </Text>
            <Text style={styles.conversationTime}>{conversation.last_message_time}</Text>
          </View>
          
          {conversation.project_title && (
            <Text style={styles.projectTitle} numberOfLines={1}>
              {conversation.project_title}
            </Text>
          )}
          
          <Text style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]} numberOfLines={1}>
            {conversation.last_message}
          </Text>
        </View>
        
        {hasUnread && (
          <View style={styles.unreadCountBadge}>
            <Text style={styles.unreadCountText}>{conversation.unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMessageBubble = (message: Message) => {
    const bgColor = ['#1877f2', '#42b883', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'][message.sender_id % 8];
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageBubble,
          message.is_own ? styles.messageBubbleOwn : styles.messageBubbleOther,
        ]}
      >
        {!message.is_own && (
          <View style={styles.messageAvatar}>
            {message.sender_avatar ? (
              <Image
                source={{ uri: message.sender_avatar }}
                style={styles.messageAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.messageAvatarPlaceholder, { backgroundColor: bgColor }]}>
                <Text style={styles.messageAvatarText}>{getInitials(message.sender_name)}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[
          styles.messageContent,
          message.is_own ? styles.messageContentOwn : styles.messageContentOther,
        ]}>
          {!message.is_own && (
            <Text style={styles.messageSenderName}>{message.sender_name}</Text>
          )}
          <Text style={[
            styles.messageText,
            message.is_own ? styles.messageTextOwn : styles.messageTextOther,
          ]}>
            {message.message}
          </Text>
          <Text style={[
            styles.messageTime,
            message.is_own ? styles.messageTimeOwn : styles.messageTimeOther,
          ]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  // Show chat view if conversation is selected
  if (selectedConversation) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          
          <View style={styles.chatHeaderInfo}>
            {selectedConversation.user_avatar ? (
              <Image
                source={{ uri: selectedConversation.user_avatar }}
                style={styles.chatHeaderAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.chatHeaderAvatarPlaceholder, { backgroundColor: '#1877F2' }]}>
                <Text style={styles.chatHeaderAvatarText}>
                  {getInitials(selectedConversation.user_name)}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.chatHeaderName}>{selectedConversation.user_name}</Text>
              {selectedConversation.project_title && (
                <Text style={styles.chatHeaderProject}>{selectedConversation.project_title}</Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <ScrollView
          style={styles.messagesList}
          contentContainerStyle={styles.messagesListContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => renderMessageBubble(message))}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.messageInputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color="#666666" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor="#999999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show conversations list
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC7E00" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <ScrollView
        style={styles.conversationsList}
        contentContainerStyle={styles.conversationsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EC7E00']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptyText}>Start a conversation with contractors or property owners</Text>
          </View>
        ) : (
          conversations.map(conversation => renderConversationItem(conversation))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    paddingTop: 0,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchButton: {
    padding: 4,
  },
  conversationsList: {
    flex: 1,
  },
  conversationsListContent: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  conversationItemUnread: {
    backgroundColor: '#FFF9E6',
  },
  conversationAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EC7E00',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    flex: 1,
  },
  conversationNameUnread: {
    fontWeight: '600',
    color: '#333333',
  },
  conversationTime: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 8,
  },
  projectTitle: {
    fontSize: 13,
    color: '#EC7E00',
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#999999',
  },
  lastMessageUnread: {
    color: '#666666',
    fontWeight: '500',
  },
  unreadCountBadge: {
    backgroundColor: '#EC7E00',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
    paddingHorizontal: 40,
  },
  // Chat View Styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  chatHeaderProject: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesListContent: {
    padding: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageBubbleOwn: {
    justifyContent: 'flex-end',
  },
  messageBubbleOther: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageContent: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageContentOwn: {
    backgroundColor: '#EC7E00',
    borderBottomRightRadius: 4,
  },
  messageContentOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageSenderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#333333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  messageTimeOwn: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  messageTimeOther: {
    color: '#999999',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    fontSize: 15,
    color: '#333333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EC7E00',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
});

