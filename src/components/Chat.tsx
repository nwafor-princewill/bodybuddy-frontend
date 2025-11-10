import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  challenge_id: string;
  user_id: string;
  username: string;
  message: string;
  type: 'message' | 'system' | 'trash_talk';
  timestamp: number;
}

interface ChatProps {
  challengeId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Helper to generate MongoDB-like ObjectIDs in frontend
const generateObjectId = (): string => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const random = Array(16)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
  return timestamp + random;
};

const Chat: React.FC<ChatProps> = ({ challengeId, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (isOpen && challengeId) {
      console.log('🔄 Chat opened, fetching history and connecting WebSocket...');
      fetchChatHistory();
      connectWebSocket();
    } else {
      console.log('🔴 Chat closed, disconnecting WebSocket...');
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isOpen, challengeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      console.log('📚 Fetching chat history for challenge:', challengeId);
      
      const response = await fetch(`http://localhost:8080/api/chat/${challengeId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat history loaded:', data.messages?.length || 0, 'messages');
        setMessages(data.messages || []);
      } else {
        console.error('❌ Failed to fetch chat history - HTTP error:', response.status);
      }
    } catch (err) {
      console.error('❌ Failed to fetch chat history:', err);
      // Create some dummy messages for testing
      setMessages([
        {
          id: '1',
          challenge_id: challengeId,
          user_id: 'system',
          username: 'System',
          message: 'Welcome to the trash talk chat! 💪',
          type: 'system',
          timestamp: Math.floor(Date.now() / 1000)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    try {
      console.log('🔌 Connecting to WebSocket...');
      
      // Include user data in WebSocket connection
      const wsUrl = `ws://localhost:8080/ws?user_id=${user?.id}&username=${encodeURIComponent(user?.username || 'User')}&challenge_id=${challengeId}`;
      console.log('🌐 WebSocket URL:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        console.log('📨 RAW WebSocket message received:', event.data);
        try {
          const message: ChatMessage = JSON.parse(event.data);
          console.log('✅ PARSED message:', message);
          setMessages(prev => {
            console.log('🔄 Adding message to state. Previous messages:', prev.length);
            return [...prev, message];
          });
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err, 'Raw data:', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('❌ WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  };

  const disconnectWebSocket = () => {
    if (socket) {
      console.log('🔴 Disconnecting WebSocket...');
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    console.log('📤 Attempting to send message:', newMessage);

    // If WebSocket is connected, send via WebSocket
    if (socket && isConnected) {
      const chatMessage: ChatMessage = {
        id: generateObjectId(),
        challenge_id: challengeId,
        user_id: user?.id || 'unknown',
        username: user?.username || 'User',
        message: newMessage,
        type: 'message',
        timestamp: Math.floor(Date.now() / 1000)
      };

      console.log('🚀 Sending via WebSocket:', chatMessage);
      
      try {
        socket.send(JSON.stringify(chatMessage));
        console.log('✅ Message sent via WebSocket');
        setNewMessage('');
      } catch (err) {
        console.error('❌ Error sending via WebSocket:', err);
        alert('Failed to send message');
      }
    } else {
      console.log('🌐 WebSocket not connected, falling back to HTTP API');
      // Fallback to HTTP API
      try {
        const response = await fetch('http://localhost:8080/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            challenge_id: challengeId,
            message: newMessage,
            type: 'message'
          }),
        });

        if (response.ok) {
          console.log('✅ Message sent via HTTP API');
          setNewMessage('');
          // Refresh messages to see the new one
          fetchChatHistory();
        } else {
          console.error('❌ Failed to send message via HTTP - Status:', response.status);
          alert('Failed to send message');
        }
      } catch (err) {
        console.error('❌ Send message error:', err);
        alert('Failed to send message');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Chat Header */}
      <div className={`rounded-t-2xl p-4 text-white flex justify-between items-center ${
        isConnected ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
      }`}>
        <div>
          <h3 className="font-bold text-lg">💬 Trash Talk</h3>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            <span className="text-xs opacity-75">({messages.length} messages)</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl"
        >
          ×
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the trash talk! 💪</p>
            <p className="text-sm mt-2">WebSocket: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || `msg-${index}`}
              className={`flex ${
                message.user_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 ${
                  message.type === 'system'
                    ? 'bg-yellow-100 text-yellow-800 text-center mx-auto'
                    : message.user_id === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.type !== 'system' && message.user_id !== user?.id && (
                  <p className="text-xs font-semibold text-gray-600">{message.username}</p>
                )}
                <p className="break-words">{message.message}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your trash talk... 💪" : "Connecting..."}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={!isConnected && isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || (!isConnected && isLoading)}
            className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ➤
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          {isConnected ? '✅ Real-time chat active' : '🔄 Connecting...'}
        </p>
      </div>
    </div>
  );
};

export default Chat;