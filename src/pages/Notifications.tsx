import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  data?: any;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications?page=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      setError('Failed to load notifications');
      // Fallback to sample data for demo
      setTimeout(() => {
        setNotifications([
          {
            id: '1',
            type: 'challenge_invite',
            title: 'Challenge Invitation',
            message: 'John invited you to join "Summer Shred 2024"',
            is_read: false,
            is_archived: false,
            created_at: new Date().toISOString(),
            data: { challenge_id: '1', challenge_name: 'Summer Shred 2024' }
          },
          {
            id: '2',
            type: 'friend_request',
            title: 'Friend Request',
            message: 'Sarah wants to be your friend',
            is_read: true,
            is_archived: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            type: 'challenge_reminder',
            title: 'Weekly Reminder',
            message: 'Don\'t forget to upload your progress photos for "Winter Gains"',
            is_read: false,
            is_archived: false,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            type: 'challenge_result',
            title: 'Challenge Completed!',
            message: 'You won the "Spring Fitness" challenge! 🏆',
            is_read: true,
            is_archived: false,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications/${notificationId}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Failed to archive notification:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications/read-all`,  {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge_invite': return '🏆';
      case 'friend_request': return '👥';
      case 'challenge_reminder': return '⏰';
      case 'challenge_result': return '🎯';
      case 'system': return '📢';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'challenge_invite': return 'bg-blue-100 text-blue-600';
      case 'friend_request': return 'bg-green-100 text-green-600';
      case 'challenge_reminder': return 'bg-yellow-100 text-yellow-600';
      case 'challenge_result': return 'bg-purple-100 text-purple-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Dashboard
          </button>
          
          <h1 className="text-4xl font-bold text-white">🔔 Notifications</h1>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-white text-green-600 font-bold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex space-x-4 mb-6 border-b border-white/20 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'unread'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔔</span>
                </div>
                <p className="text-white/60 text-xl mb-2">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-white/40">
                  {activeTab === 'unread' 
                    ? 'You\'re all caught up!' 
                    : 'Notifications will appear here when you receive invites, reminders, or updates.'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white/10 rounded-xl p-6 border transition-all ${
                    !notification.is_read 
                      ? 'border-green-400/50 bg-green-500/10' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`font-bold text-lg ${
                            !notification.is_read ? 'text-green-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-white/80 mb-3">
                          {notification.message}
                        </p>
                        <p className="text-white/60 text-sm">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => archiveNotification(notification.id)}
                        className="bg-white/20 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors text-sm"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notification Tips */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">💡 Notification Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🏆</span>
              <span>Challenge Invitations</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg">👥</span>
              <span>Friend Requests</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg">⏰</span>
              <span>Weekly Reminders</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg">🎯</span>
              <span>Challenge Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;