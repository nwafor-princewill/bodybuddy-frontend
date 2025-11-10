import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  height?: number;
  weight?: number;
  bio?: string;
  fitness_goals?: string;
  created_at: string;
  stats: {
    total_challenges: number;
    completed_challenges: number;
    wins: number;
    total_improvement: number;
    consistency: number;
    current_streak: number;
  };
}

interface Friend {
  id: string;
  friend_id: string;
  friend_name: string;
  status: string;
  created_at: string;
}

interface Challenge {
  id: string;
  name: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  rank?: number;
  total_participants: number;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'friends'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState<'loading' | 'real' | 'mock'>('loading');

  const isOwnProfile = !userId || userId === 'me' || userId === currentUser?.id;

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError('');
      setApiStatus('loading');

      const targetUserId = userId || 'me';

      // Try REAL API first
      try {
        const profileResponse = await fetch(`http://localhost:8080/api/users/${targetUserId}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.profile);
          setApiStatus('real');
          
          // Fetch challenges
          const challengesResponse = await fetch(`http://localhost:8080/api/users/${targetUserId}/challenges`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (challengesResponse.ok) {
            const challengesData = await challengesResponse.json();
            setChallenges(challengesData.challenges || []);
          }

          // Fetch friends
          const friendsResponse = await fetch(`http://localhost:8080/api/users/${targetUserId}/friends`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (friendsResponse.ok) {
            const friendsData = await friendsResponse.json();
            setFriends(friendsData.friends || []);
          }

          return; // Success - exit early
        }
      } catch (apiError) {
        console.log('API Error:', apiError);
      }

      // Fallback to mock data
      setApiStatus('mock');
      const mockProfile: UserProfile = {
        id: userId || currentUser?.id || '1',
        username: isOwnProfile ? currentUser?.username || 'User' : 'JohnDoe',
        email: isOwnProfile ? currentUser?.email || 'user@example.com' : 'johndoe@example.com',
        height: 180,
        weight: 75,
        bio: isOwnProfile ? 'Fitness enthusiast and challenge lover! 💪' : 'Working on my fitness goals and loving the journey!',
        fitness_goals: 'Lose 5kg, gain muscle definition, improve consistency',
        created_at: new Date('2024-01-01').toISOString(),
        stats: {
          total_challenges: 8,
          completed_challenges: 6,
          wins: 3,
          total_improvement: 15.5,
          consistency: 85,
          current_streak: 3
        }
      };

      const mockFriends: Friend[] = [
        {
          id: '1',
          friend_id: '2',
          friend_name: 'Jane Smith',
          status: 'accepted',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          friend_id: '3',
          friend_name: 'Mike Johnson',
          status: 'accepted',
          created_at: new Date().toISOString()
        }
      ];

      const mockChallenges: Challenge[] = [
        {
          id: '1',
          name: 'Summer Shred 2024',
          type: 'weight_loss',
          status: 'completed',
          start_date: '2024-01-01',
          end_date: '2024-02-01',
          rank: 1,
          total_participants: 5
        },
        {
          id: '2',
          name: 'Winter Gains',
          type: 'muscle_gain',
          status: 'completed',
          start_date: '2024-02-01',
          end_date: '2024-03-01',
          rank: 2,
          total_participants: 8
        }
      ];

      setProfile(mockProfile);
      setFriends(mockFriends);
      setChallenges(mockChallenges);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementLevel = (wins: number) => {
    if (wins >= 10) return { level: 'Elite', color: 'text-purple-600', icon: '🏆' };
    if (wins >= 5) return { level: 'Pro', color: 'text-yellow-600', icon: '⭐' };
    if (wins >= 3) return { level: 'Advanced', color: 'text-blue-600', icon: '🔥' };
    if (wins >= 1) return { level: 'Intermediate', color: 'text-green-600', icon: '💪' };
    return { level: 'Beginner', color: 'text-gray-600', icon: '🌱' };
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
        alert('Friend request sent successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send friend request');
      }
    } catch (err) {
      alert('Error sending friend request');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  const achievement = getAchievementLevel(profile.stats.wins);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* API STATUS BANNER - NEW VISIBLE FEATURE */}
        <div className={`mb-6 rounded-lg p-4 text-center border ${
          apiStatus === 'real' 
            ? 'bg-green-500/20 border-green-500/30' 
            : 'bg-yellow-500/20 border-yellow-500/30'
        }`}>
          <p className={`font-semibold ${
            apiStatus === 'real' ? 'text-green-200' : 'text-yellow-200'
          }`}>
            {apiStatus === 'real' 
              ? '✅ LIVE DATA - Connected to Real Backend API' 
              : '🟡 DEMO DATA - Using sample data (backend not connected)'}
          </p>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex space-x-4">
            {!isOwnProfile && (
              <button
                onClick={() => sendFriendRequest(profile.id)}
                className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <span>👥</span>
                <span>Add Friend</span>
              </button>
            )}
            {isOwnProfile && (
              <div className="flex space-x-4">
                <Link
                  to="/friends/search"
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <span>🔍</span>
                  <span>Find Friends</span>
                </Link>
                <Link
                  to="/edit-profile"
                  className="bg-white text-green-600 font-bold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
          <div className="flex items-center space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              {profile.stats.current_streak > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  🔥 {profile.stats.current_streak}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                <span className={`bg-white/20 px-3 py-1 rounded-full text-sm font-medium ${achievement.color}`}>
                  {achievement.icon} {achievement.level}
                </span>
              </div>
              
              <p className="text-white/80 mb-4">{profile.bio || 'No bio yet'}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile.stats.total_challenges}</p>
                  <p className="text-white/60 text-sm">Challenges</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile.stats.wins}</p>
                  <p className="text-white/60 text-sm">Wins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{Math.round(profile.stats.consistency)}%</p>
                  <p className="text-white/60 text-sm">Consistency</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">+{profile.stats.total_improvement.toFixed(1)}</p>
                  <p className="text-white/60 text-sm">Improvement</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{friends.length}</p>
                  <p className="text-white/60 text-sm">Friends</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile.stats.current_streak}</p>
                  <p className="text-white/60 text-sm">Week Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex space-x-4 mb-6 border-b border-white/20 pb-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'challenges'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              🏆 Challenges ({challenges.length})
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              👥 Friends ({friends.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Fitness Goals */}
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🎯 Fitness Goals</h3>
                <p className="text-white/80">{profile.fitness_goals || 'No fitness goals set yet'}</p>
              </div>

              {/* Body Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">📏 Body Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Height:</span>
                      <span className="text-white font-semibold">
                        {profile.height ? `${profile.height} cm` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Weight:</span>
                      <span className="text-white font-semibold">
                        {profile.weight ? `${profile.weight} kg` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Member since:</span>
                      <span className="text-white font-semibold">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">📈 Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Active challenges:</span>
                      <span className="text-white">
                        {challenges.filter(c => c.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Current streak:</span>
                      <span className="text-white">{profile.stats.current_streak} weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Win rate:</span>
                      <span className="text-white">
                        {profile.stats.total_challenges > 0 
                          ? Math.round((profile.stats.wins / profile.stats.total_challenges) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Badges - NEW VISIBLE SECTION */}
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🏅 Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profile.stats.wins >= 1 && (
                    <div className="bg-yellow-500/20 rounded-lg p-4 text-center border border-yellow-500/30">
                      <div className="text-2xl mb-2">🥇</div>
                      <p className="text-white font-semibold">First Win</p>
                      <p className="text-yellow-300 text-xs">Earned your first victory</p>
                    </div>
                  )}
                  {profile.stats.consistency >= 80 && (
                    <div className="bg-green-500/20 rounded-lg p-4 text-center border border-green-500/30">
                      <div className="text-2xl mb-2">📅</div>
                      <p className="text-white font-semibold">Consistent</p>
                      <p className="text-green-300 text-xs">80%+ consistency rate</p>
                    </div>
                  )}
                  {profile.stats.total_challenges >= 5 && (
                    <div className="bg-blue-500/20 rounded-lg p-4 text-center border border-blue-500/30">
                      <div className="text-2xl mb-2">🏆</div>
                      <p className="text-white font-semibold">Challenge Pro</p>
                      <p className="text-blue-300 text-xs">5+ challenges completed</p>
                    </div>
                  )}
                  {friends.length >= 3 && (
                    <div className="bg-purple-500/20 rounded-lg p-4 text-center border border-purple-500/30">
                      <div className="text-2xl mb-2">👥</div>
                      <p className="text-white font-semibold">Social Butterfly</p>
                      <p className="text-purple-300 text-xs">3+ friends added</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Challenge History</h3>
              {challenges.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <p className="text-white/60">No challenges yet</p>
                  <p className="text-white/40 text-sm mt-2">
                    Join challenges to track your progress!
                  </p>
                </div>
              ) : (
                challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-white/10 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white text-lg">{challenge.name}</h4>
                        <p className="text-white/60 text-sm capitalize">
                          {challenge.type.replace('_', ' ')} • 
                          <span className={challenge.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                            {' '}{challenge.status}
                          </span>
                        </p>
                      </div>
                      {challenge.rank && (
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          #{challenge.rank}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/60">
                        {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                      <span className="text-white/60">
                        {challenge.total_participants} participants
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Friends List</h3>
                {isOwnProfile && (
                  <Link
                    to="/friends/search"
                    className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-2"
                  >
                    <span>🔍</span>
                    <span>Find Friends</span>
                  </Link>
                )}
              </div>
              
              {friends.length === 0 ? (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-white/60">No friends yet</p>
                  {isOwnProfile && (
                    <p className="text-white/40 text-sm mt-2">
                      Add friends to challenge them and track progress together!
                    </p>
                  )}
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 hover:border-white/40 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {friend.friend_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{friend.friend_name}</p>
                        <p className="text-white/60 text-sm">
                          Friends since {new Date(friend.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {isOwnProfile && (
                      <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;