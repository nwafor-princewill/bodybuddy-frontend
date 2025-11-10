import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  username: string;
  email: string;
}

const FriendSearch: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8080/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else {
        setError('Failed to search users');
      }
    } catch (err) {
      setError('Error searching users');
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ friend_id: friendId }),
      });

      if (response.ok) {
        setSuccess('Friend request sent!');
        // Remove from search results
        setSearchResults(prev => prev.filter(user => user.id !== friendId));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send friend request');
      }
    } catch (err) {
      setError('Error sending friend request');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      searchUsers(query);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="bg-white/20 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-white">Find Friends</h1>
          <div className="w-20"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Search Box */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by username or email..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <p className="text-white/60 text-sm mt-2">
            Find friends to challenge and track progress together
          </p>
        </div>

        {/* Search Results */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Results'}
          </h2>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-white/60">
                {searchQuery 
                  ? 'No users found. Try a different search term.' 
                  : 'Enter a username or email to find friends'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 hover:border-white/40 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => sendFriendRequest(user.id)}
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-6">
          <h3 className="text-lg font-bold text-white mb-3">💡 How Friend System Works</h3>
          <ul className="text-white/80 space-y-2 text-sm">
            <li>• Search for users by username or email</li>
            <li>• Send friend requests to connect</li>
            <li>• Challenge friends to fitness competitions</li>
            <li>• Track each other's progress</li>
            <li>• Built-in trash talk chat in challenges</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FriendSearch;