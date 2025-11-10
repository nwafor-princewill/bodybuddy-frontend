import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';

interface Friend {
  id: string;
  friend_id: string;
  friend_name: string;
  status: string;
  created_at: string;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState(''); // Keep this for error handling
  // const { token } = useAuth(); // Keep this for future API calls

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    // For now, we'll use mock data since we don't have a friends endpoint yet
    // In a real app, you'd fetch from /api/friends
    setTimeout(() => {
      setFriends([
        {
          id: '1',
          friend_id: 'friend1',
          friend_name: 'John Doe',
          status: 'accepted',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          friend_id: 'friend2',
          friend_name: 'Jane Smith',
          status: 'accepted',
          created_at: new Date().toISOString()
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const removeFriend = (friendId: string) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Friends</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">👥 Friends</h3>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {friends.length} friends
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {friends.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-gray-600">No friends yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Friends will be automatically added when you accept invitations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">
                    {friend.friend_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{friend.friend_name}</p>
                  <p className="text-green-600 text-xs font-medium">Friends</p>
                </div>
              </div>
              
              <button
                onClick={() => removeFriend(friend.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm">
          💡 <strong>Tip:</strong> Friends are automatically added when you accept their challenge invitations.
        </p>
      </div>
    </div>
  );
};

export default FriendsList;