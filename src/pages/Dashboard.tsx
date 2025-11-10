import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import PendingInvitations from '../components/PendingInvitations';
import FriendsList from '../components/FriendsList';
import NotificationBell from '../components/NotificationBell';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: number;
  snaps_per_week: number;
  loser_penalty: string;
  status: string;
  start_date: string;
  end_date: string;
  participants: string[];
}

const Dashboard: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/challenges`,  {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }

      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'weight_loss': return 'bg-red-100 text-red-800';
      case 'muscle_gain': return 'bg-blue-100 text-blue-800';
      case 'general_fitness': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading your challenges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive Layout */}
        <div className="mb-6 sm:mb-8">
          {/* Top Row - Welcome Message and Notification */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Welcome back, {user?.username}! 💪
              </h1>
              <p className="text-white/80 mt-1 sm:mt-2 text-sm sm:text-base">
                Track your fitness challenges and progress
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationBell />
              {/* Mobile Menu Button (Optional - can be expanded later) */}
              <div className="sm:hidden">
                {/* Space for future mobile menu */}
              </div>
            </div>
          </div>

          {/* Action Buttons - Responsive Grid */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            <Link
              to="/leaderboards"
              className="bg-yellow-500 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-xl hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <span>🏆</span>
              <span className="hidden xs:inline">Leaderboards</span>
              <span className="xs:hidden">Rank</span>
            </Link>

            <Link
              to="/profile"
              className="bg-white/20 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <span>👤</span>
              <span className="hidden xs:inline">Profile</span>
              <span className="xs:hidden">Me</span>
            </Link>

            <Link
              to="/penalties"
              className="bg-red-500 text-white font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <span>⚖️</span>
              <span className="hidden xs:inline">Penalties</span>
              <span className="xs:hidden">Debts</span>
            </Link>

            <Link
              to="/create-challenge"
              className="bg-white text-green-600 font-bold py-2 sm:py-3 px-3 sm:px-6 rounded-xl hover:bg-green-50 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base col-span-2 sm:col-span-1"
            >
              <span>+</span>
              <span>New Challenge</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content - Challenges */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Your Challenges</h2>
              
              {challenges.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-white/10 rounded-3xl p-6 sm:p-8 border border-white/20">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl sm:text-2xl">🏆</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No challenges yet</h3>
                    <p className="text-white/80 mb-4 text-sm sm:text-base">Create your first challenge to get started!</p>
                    <Link
                      to="/create-challenge"
                      className="bg-white text-green-600 font-bold py-2 px-4 sm:py-2 sm:px-6 rounded-lg hover:bg-green-50 transition-colors text-sm sm:text-base"
                    >
                      Create Challenge
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 sm:p-4 border border-white/20 hover:border-white/40 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 flex-1 mr-2">
                          {challenge.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(challenge.status)}`}>
                          {challenge.status}
                        </span>
                      </div>

                      <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                        {challenge.description || 'No description provided'}
                      </p>

                      <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-white/60">Type:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getChallengeColor(challenge.type)}`}>
                            {challenge.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-white/60">Duration:</span>
                          <span className="text-white">{challenge.duration} weeks</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-white/60">Participants:</span>
                          <span className="text-white">{challenge.participants.length}</span>
                        </div>
                      </div>

                      <Link 
                        to={`/challenge/${challenge.id}`}
                        className="block w-full bg-white/20 text-white font-bold py-2 px-3 sm:py-2 sm:px-4 rounded-lg hover:bg-white/30 transition-colors text-center text-xs sm:text-sm"
                      >
                        View Challenge
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Invitations & Friends */}
          <div className="space-y-4 sm:space-y-6">
            <PendingInvitations />
            <FriendsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;