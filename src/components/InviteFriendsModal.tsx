import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface InviteFriendsModalProps {
  challengeId: string;
  challengeName: string;
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  challengeId,
  challengeName,
  isOpen,
  onClose,
  onInviteSent
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          challenge_id: challengeId,
          invitee_email: email,
          invitee_name: name,
          message: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      setSuccess('Invitation sent successfully!');
      setEmail('');
      setName('');
      setMessage('');
      onInviteSent();
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Invite Friends</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Invite friends to join <strong>"{challengeName}"</strong>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Friend's Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="friend@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Friend's Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Hey! Join me in this fitness challenge..."
              rows={3}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteFriendsModal;