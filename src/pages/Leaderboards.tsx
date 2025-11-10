import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_score: number;
  wins: number;
  consistency: number;
  rank: number;
}

interface UserStats {
  total_challenges: number;
  completed_challenges: number;
  wins: number;
  total_improvement: number;
  consistency: number;
  current_streak: number;
  global_rank: number;
  friends_count: number;
}

const Leaderboards: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'myStats'>('global');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch global leaderboard
      const leaderboardResponse = await fetch('http://localhost:8080/api/leaderboard/global', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setGlobalLeaderboard(leaderboardData.leaderboard || []);
      }

      // Fetch user stats
      const statsResponse = await fetch('http://localhost:8080/api/stats/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData.stats);
      }

    } catch (err) {
      setError('Failed to load leaderboard data');
      // Fallback to sample data for demo
      setTimeout(() => {
        setGlobalLeaderboard([
          { user_id: '1', username: 'ProAthlete', total_score: 950, wins: 8, consistency: 95, rank: 1 },
          { user_id: '2', username: 'FitnessGuru', total_score: 890, wins: 7, consistency: 89, rank: 2 },
          { user_id: '3', username: 'GymAddict', total_score: 820, wins: 6, consistency: 82, rank: 3 },
          { user_id: '4', username: 'TransformQueen', total_score: 780, wins: 5, consistency: 78, rank: 4 },
          { user_id: '5', username: 'MuscleMaster', total_score: 750, wins: 5, consistency: 75, rank: 5 },
        ]);
        setUserStats({
          total_challenges: 8,
          completed_challenges: 6,
          wins: 3,
          total_improvement: 15.5,
          consistency: 85,
          current_streak: 3,
          global_rank: 12,
          friends_count: 4
        });
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-white';
      case 2: return 'bg-gray-400 text-white';
      case 3: return 'bg-orange-600 text-white';
      default: return 'bg-white/10 text-white';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Dashboard
          </button>
          
          <h1 className="text-4xl font-bold text-white">🏆 Leaderboards</h1>
          
          <Link
            to="/profile"
            className="bg-white/20 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
          >
            👤 My Profile
          </Link>
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
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'global'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              🌍 Global Rankings
            </button>
            <button
              onClick={() => setActiveTab('myStats')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'myStats'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              📊 My Stats
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'global' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Top Performers</h2>
                <p className="text-white/60">
                  Rankings based on challenge wins, consistency, and overall improvement
                </p>
              </div>

              {/* Leaderboard */}
              <div className="space-y-3">
                {globalLeaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      entry.user_id === user?.id
                        ? 'bg-green-500/20 border-green-500/30 shadow-lg scale-105'
                        : 'bg-white/10 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          entry.user_id === user?.id ? 'text-green-300' : 'text-white'
                        }`}>
                          {entry.username}
                          {entry.user_id === user?.id && ' (You)'}
                        </p>
                        <div className="flex space-x-4 text-sm text-white/60">
                          <span>🏆 {entry.wins} wins</span>
                          <span>📅 {Math.round(entry.consistency)}% consistency</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{Math.round(entry.total_score)} pts</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Your Position */}
              {userStats && (
                <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-2">Your Global Position</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Current Rank: <span className="font-bold">#{userStats.global_rank}</span></p>
                      <p className="text-white/60 text-sm">Keep competing to climb the ranks!</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{userStats.wins} Wins</p>
                      <p className="text-white/60 text-sm">{Math.round(userStats.consistency)}% Consistency</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'myStats' && userStats && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Your Fitness Journey</h2>
              
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                  <p className="text-2xl font-bold text-white">{userStats.total_challenges}</p>
                  <p className="text-white/60 text-sm">Total Challenges</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                  <p className="text-2xl font-bold text-white">{userStats.wins}</p>
                  <p className="text-white/60 text-sm">Wins</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                  <p className="text-2xl font-bold text-white">{Math.round(userStats.consistency)}%</p>
                  <p className="text-white/60 text-sm">Consistency</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
                  <p className="text-2xl font-bold text-white">#{userStats.global_rank}</p>
                  <p className="text-white/60 text-sm">Global Rank</p>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">📈 Progress Tracking</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Completed Challenges:</span>
                      <span className="text-white font-semibold">{userStats.completed_challenges}/{userStats.total_challenges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Improvement:</span>
                      <span className="text-white font-semibold">+{userStats.total_improvement.toFixed(1)} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Current Streak:</span>
                      <span className="text-white font-semibold">{userStats.current_streak} weeks</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">👥 Social Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Friends:</span>
                      <span className="text-white font-semibold">{userStats.friends_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Win Rate:</span>
                      <span className="text-white font-semibold">
                        {userStats.total_challenges > 0 
                          ? Math.round((userStats.wins / userStats.total_challenges) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Active Challenges:</span>
                      <span className="text-white font-semibold">{userStats.total_challenges - userStats.completed_challenges}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Preview */}
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">🏅 Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userStats.wins >= 1 && (
                    <div className="bg-yellow-500/20 rounded-lg p-4 text-center border border-yellow-500/30">
                      <div className="text-2xl mb-2">🥇</div>
                      <p className="text-white font-semibold">First Victory</p>
                      <p className="text-yellow-300 text-xs">Won your first challenge</p>
                    </div>
                  )}
                  {userStats.consistency >= 80 && (
                    <div className="bg-green-500/20 rounded-lg p-4 text-center border border-green-500/30">
                      <div className="text-2xl mb-2">📅</div>
                      <p className="text-white font-semibold">Consistent Performer</p>
                      <p className="text-green-300 text-xs">80%+ weekly consistency</p>
                    </div>
                  )}
                  {userStats.friends_count >= 3 && (
                    <div className="bg-blue-500/20 rounded-lg p-4 text-center border border-blue-500/30">
                      <div className="text-2xl mb-2">👥</div>
                      <p className="text-white font-semibold">Social Butterfly</p>
                      <p className="text-blue-300 text-xs">3+ fitness friends</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/20 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to Climb the Ranks?</h3>
          <p className="text-white/80 mb-4">Join more challenges and track your progress to improve your ranking!</p>
          <Link
            to="/create-challenge"
            className="bg-white text-green-600 font-bold py-3 px-6 rounded-lg hover:bg-green-50 transition-colors inline-block"
          >
            Start New Challenge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;