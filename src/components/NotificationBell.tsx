import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchUnreadCount();
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/notifications?page=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Fallback to sample notifications for demo
      setNotifications([
        {
          id: '1',
          type: 'challenge_invite',
          title: 'Challenge Invitation',
          message: 'John invited you to join "Summer Shred 2024"',
          is_read: false,
          created_at: new Date().toISOString(),
          data: { challenge_id: '1', challenge_name: 'Summer Shred 2024' }
        },
        {
          id: '2',
          type: 'friend_request',
          title: 'Friend Request',
          message: 'Sarah wants to be your friend',
          is_read: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'challenge_reminder',
          title: 'Weekly Reminder',
          message: 'Don\'t forget to upload your progress photos for "Winter Gains"',
          is_read: false,
          created_at: new Date().toISOString(),
        }
      ]);
      setUnreadCount(2);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:8080/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔔</span>
                </div>
                <p className="text-gray-500">No notifications</p>
                <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400 text-xs">
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-600 hover:text-green-700 text-xs font-medium"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <a
              href="/notifications"
              className="block text-center text-green-600 hover:text-green-700 font-medium text-sm py-2"
            >
              View All Notifications
            </a>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;