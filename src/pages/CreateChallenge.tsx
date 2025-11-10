import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateChallenge: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'weight_loss',
    duration: 4,
    snapsPerWeek: 3,
    loserPenalty: '',
    invitedEmails: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          duration: formData.duration,
          snaps_per_week: parseInt(formData.snapsPerWeek.toString()), // FIX: snake_case + convert to number
          loser_penalty: formData.loserPenalty, // FIX: snake_case
          invited_emails: formData.invitedEmails.split(',').map(email => email.trim()).filter(email => email),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create challenge');
      }

      const result = await response.json();
      console.log('Challenge created:', result);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Challenge</h2>
          <p className="text-gray-600 mt-2">Start a new fitness battle with friends</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challenge Name
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., November Gains, Summer Shred"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="What's this challenge about?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (weeks)
              </label>
              <input
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="1"
                max="12"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Snaps Per Week
              </label>
              <input
                name="snapsPerWeek"
                type="number"
                value={formData.snapsPerWeek}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="1"
                max="7"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loser Penalty
              </label>
              <input
                name="loserPenalty"
                type="text"
                value={formData.loserPenalty}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., buys dinner, does 100 burpees"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Friends (comma-separated emails)
            </label>
            <input
              name="invitedEmails"
              type="text"
              value={formData.invitedEmails}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="friend1@email.com, friend2@email.com"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Challenge'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallenge;