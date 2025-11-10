import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  height?: number;
  weight?: number;
  bio?: string;
  fitness_goals?: string;
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<UserProfile>({
    id: user?.id || '',
    username: user?.username || '',
    email: user?.email || '',
    height: undefined,
    weight: undefined,
    bio: '',
    fitness_goals: '',
  });

  useEffect(() => {
    fetchCurrentProfile();
  }, []);

  const fetchCurrentProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'height' || name === 'weight' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          height: formData.height,
          weight: formData.weight,
          bio: formData.bio,
          fitness_goals: formData.fitness_goals,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      
      // Update auth context if username changed
      if (formData.username !== user?.username) {
        // In a real app, you'd refresh the token or update context
        setTimeout(() => {
          window.location.reload(); // Simple refresh to update context
        }, 1500);
      } else {
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
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

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                {formData.username.charAt(0).toUpperCase()}
              </div>
              <p className="text-white/80 text-sm">Profile picture (coming soon)</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username *
              </label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Enter your username"
                required
                minLength={3}
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60"
                readOnly
                disabled
              />
              <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Tell others about your fitness journey..."
                maxLength={500}
              />
              <p className="text-white/40 text-xs mt-1">
                {formData.bio?.length || 0}/500 characters
              </p>
            </div>

            {/* Fitness Goals */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Fitness Goals
              </label>
              <textarea
                name="fitness_goals"
                value={formData.fitness_goals || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="What are your fitness goals? e.g., Lose 5kg, gain muscle, improve consistency..."
                maxLength={500}
              />
              <p className="text-white/40 text-xs mt-1">
                {formData.fitness_goals?.length || 0}/500 characters
              </p>
            </div>

            {/* Body Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Height (cm)
                </label>
                <input
                  name="height"
                  type="number"
                  value={formData.height || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="Height in cm"
                  min="100"
                  max="250"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Weight (kg)
                </label>
                <input
                  name="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="Weight in kg"
                  min="30"
                  max="200"
                  step="0.1"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-white text-green-600 font-bold py-3 px-6 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 bg-white/20 text-white font-bold py-3 px-6 rounded-lg hover:bg-white/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;