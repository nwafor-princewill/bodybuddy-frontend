import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ChallengeInvitation {
  id: string;
  challenge_id: string;
  challenge_name: string;
  inviter_name: string;
  invitee_email: string;
  message: string;
  status: string;
  expires_at: string;
  created_at: string;
}

const PendingInvitations: React.FC = () => {
  const [invitations, setInvitations] = useState<ChallengeInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  const fetchPendingInvitations = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/invitations/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      // Remove from list and show success
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      alert('Invitation accepted! You have been added to the challenge.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to accept invitation');
    }
  };

  const handleDecline = async (invitationId: string) => {
    if (!window.confirm('Are you sure you want to decline this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/invitations/${invitationId}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to decline invitation');
      }

      // Remove from list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to decline invitation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📨 Pending Invitations</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">📨 Pending Invitations</h3>
        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
          {invitations.length} pending
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📭</span>
          </div>
          <p className="text-gray-600">No pending invitations</p>
          <p className="text-gray-500 text-sm mt-1">When friends invite you, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-800">{invitation.challenge_name}</h4>
                  <p className="text-gray-600 text-sm">
                    Invited by <span className="font-semibold">{invitation.inviter_name}</span>
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                  Expires: {formatDate(invitation.expires_at)}
                </span>
              </div>

              {invitation.message && (
                <p className="text-gray-700 text-sm mb-3 bg-gray-50 p-3 rounded-lg">
                  "{invitation.message}"
                </p>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleAccept(invitation.id)}
                  className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(invitation.id)}
                  className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingInvitations;