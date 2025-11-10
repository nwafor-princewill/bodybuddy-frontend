import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Penalty {
  id: string;
  challenge_id: string;
  challenge_name: string;
  loser_id: string;
  loser_name: string;
  winner_id: string;
  winner_name: string;
  description: string;
  amount?: number;
  status: string;
  due_date: string;
  completed_at?: string;
  verified_at?: string;
  proof?: string;
  notes?: string;
  created_at: string;
}

interface PenaltyStats {
  total_penalties: number;
  pending_penalties: number;
  completed_penalties: number;
  total_amount: number;
  overdue_penalties: number;
}

const Penalties: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [stats, setStats] = useState<PenaltyStats | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    fetchPenaltiesData();
  }, [activeTab]);

  const fetchPenaltiesData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch penalties
      const statusParam = activeTab === 'all' ? '' : activeTab;
      const penaltiesResponse = await fetch(
        `http://localhost:8080/api/penalties/user${statusParam ? `?status=${statusParam}` : ''}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (penaltiesResponse.ok) {
        const penaltiesData = await penaltiesResponse.json();
        setPenalties(penaltiesData.penalties || []);
      }

      // Fetch stats
      const statsResponse = await fetch('http://localhost:8080/api/penalties/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

    } catch (err) {
      setError('Failed to load penalties data');
      // Fallback to sample data for demo
      setTimeout(() => {
        setPenalties([
          {
            id: '1',
            challenge_id: '1',
            challenge_name: 'Summer Shred 2024',
            loser_id: user?.id || '1',
            loser_name: user?.username || 'You',
            winner_id: '2',
            winner_name: 'ProAthlete',
            description: 'Buy dinner for the winner',
            amount: 50,
            status: 'pending',
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            challenge_id: '2',
            challenge_name: 'Winter Gains',
            loser_id: '3',
            loser_name: 'GymBuddy',
            winner_id: user?.id || '1',
            winner_name: user?.username || 'You',
            description: 'Do 100 burpees on video',
            status: 'completed',
            due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          }
        ]);
        setStats({
          total_penalties: 2,
          pending_penalties: 1,
          completed_penalties: 1,
          total_amount: 50,
          overdue_penalties: 0
        });
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const markPenaltyCompleted = async () => {
    if (!selectedPenalty) return;

    try {
      const response = await fetch(`http://localhost:8080/api/penalties/${selectedPenalty.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: completionNotes,
          // In real app, you'd upload proof image/video
        }),
      });

      if (response.ok) {
        setShowCompleteModal(false);
        setCompletionNotes('');
        setSelectedPenalty(null);
        fetchPenaltiesData(); // Refresh data
        alert('Penalty marked as completed! Waiting for verification.');
      } else {
        alert('Failed to mark penalty as completed');
      }
    } catch (err) {
      alert('Error marking penalty as completed');
    }
  };

  const verifyPenalty = async (penaltyId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/penalties/${penaltyId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPenaltiesData(); // Refresh data
        alert('Penalty verified!');
      } else {
        alert('Failed to verify penalty');
      }
    } catch (err) {
      alert('Error verifying penalty');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'verified': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'completed': return 'Completed - Awaiting Verification';
      case 'verified': return 'Verified ✓';
      default: return status;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading penalties...</div>
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
          
          <h1 className="text-4xl font-bold text-white">⚖️ Penalties</h1>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4 text-center border border-white/20">
              <p className="text-2xl font-bold text-white">{stats.total_penalties}</p>
              <p className="text-white/60 text-sm">Total</p>
            </div>
            <div className="bg-yellow-500/20 rounded-xl p-4 text-center border border-yellow-500/30">
              <p className="text-2xl font-bold text-white">{stats.pending_penalties}</p>
              <p className="text-yellow-300 text-sm">Pending</p>
            </div>
            <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-500/30">
              <p className="text-2xl font-bold text-white">{stats.completed_penalties}</p>
              <p className="text-green-300 text-sm">Completed</p>
            </div>
            <div className="bg-red-500/20 rounded-xl p-4 text-center border border-red-500/30">
              <p className="text-2xl font-bold text-white">{stats.overdue_penalties}</p>
              <p className="text-red-300 text-sm">Overdue</p>
            </div>
            <div className="bg-blue-500/20 rounded-xl p-4 text-center border border-blue-500/30">
              <p className="text-2xl font-bold text-white">${stats.total_amount}</p>
              <p className="text-blue-300 text-sm">Total Amount</p>
            </div>
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
              All Penalties
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Pending ({stats?.pending_penalties || 0})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-white text-green-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Completed ({stats?.completed_penalties || 0})
            </button>
          </div>

          {/* Penalties List */}
          <div className="space-y-4">
            {penalties.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <p className="text-white/60 text-xl mb-2">No penalties found</p>
                <p className="text-white/40">
                  {activeTab === 'pending' 
                    ? 'No pending penalties - great job!' 
                    : 'Penalties will appear here when you win or lose challenges.'
                  }
                </p>
              </div>
            ) : (
              penalties.map((penalty) => (
                <div
                  key={penalty.id}
                  className={`bg-white/10 rounded-xl p-6 border transition-all ${
                    penalty.status === 'pending' && isOverdue(penalty.due_date)
                      ? 'border-red-500/50 bg-red-500/10' 
                      : penalty.status === 'pending'
                      ? 'border-yellow-500/50 bg-yellow-500/10'
                      : 'border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {penalty.challenge_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-white/80">
                        <span>
                          {penalty.loser_id === user?.id ? 'You owe' : `${penalty.loser_name} owes`} 
                          {penalty.winner_id === user?.id ? ' you' : ` ${penalty.winner_name}`}
                        </span>
                        {penalty.amount && (
                          <span className="font-bold text-green-300">
                            ${penalty.amount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getStatusColor(penalty.status)}`}>
                        {getStatusText(penalty.status)}
                      </span>
                      {penalty.status === 'pending' && (
                        <p className={`text-sm mt-1 ${
                          isOverdue(penalty.due_date) ? 'text-red-300' : 'text-yellow-300'
                        }`}>
                          {isOverdue(penalty.due_date) 
                            ? 'Overdue!' 
                            : `${getDaysRemaining(penalty.due_date)} days remaining`
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-white/80">
                      <strong>Penalty:</strong> {penalty.description}
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      Due: {formatDate(penalty.due_date)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    {penalty.loser_id === user?.id && penalty.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedPenalty(penalty);
                          setShowCompleteModal(true);
                        }}
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    
                    {penalty.winner_id === user?.id && penalty.status === 'completed' && (
                      <button
                        onClick={() => verifyPenalty(penalty.id)}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Verify Completion
                      </button>
                    )}

                    {penalty.status === 'verified' && (
                      <span className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                        ✅ Verified
                      </span>
                    )}
                  </div>

                  {/* Proof & Notes */}
                  {penalty.proof && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm">
                        <strong>Proof:</strong> {penalty.proof}
                      </p>
                    </div>
                  )}

                  {penalty.notes && (
                    <div className="mt-2 p-3 bg-white/5 rounded-lg">
                      <p className="text-white/60 text-sm">
                        <strong>Notes:</strong> {penalty.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">💡 How Penalties Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80">
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="font-semibold">Challenge Completion</p>
              <p className="text-sm mt-1">Loser gets assigned the penalty from challenge settings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⏰</div>
              <p className="font-semibold">7 Days to Complete</p>
              <p className="text-sm mt-1">Complete your penalty and provide proof</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-semibold">Winner Verifies</p>
              <p className="text-sm mt-1">Winner confirms penalty completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Penalty Modal */}
      {showCompleteModal && selectedPenalty && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Mark Penalty as Complete
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                <strong>Challenge:</strong> {selectedPenalty.challenge_name}
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Penalty:</strong> {selectedPenalty.description}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Notes (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Describe how you completed the penalty..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">
                💡 <strong>Tip:</strong> For monetary penalties, include payment proof. 
                For physical penalties, upload a video or photo.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={markPenaltyCompleted}
                className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark Complete
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedPenalty(null);
                  setCompletionNotes('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Penalties;