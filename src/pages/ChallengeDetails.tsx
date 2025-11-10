import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PhotoUpload from '../components/PhotoUpload';
import AIBodyAnalyzer, { type BodyMeasurements } from '../components/AIBodyAnalyzer';
import ChallengeResults from '../components/ChallengeResults';
import Chat from '../components/Chat';
import InviteFriendsModal from '../components/InviteFriendsModal';

interface ChallengeDetails {
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

interface ProgressPhoto {
  id: string;
  week: number;
  front_photo: string;
  side_photo: string;
  back_photo: string;
  ai_processed: boolean;
  created_at: string;
  measurements?: BodyMeasurements;
}

interface ImprovementMetrics {
  waist_reduction: number;
  shoulder_gain: number;
  progress_increase: number;
  consistency_score: number;
  overall_improvement: number;
}

interface ParticipantResult {
  user_id: string;
  username: string;
  week1_measurements?: any;
  final_measurements?: any;
  improvement: ImprovementMetrics;
  total_score: number;
  rank: number;
}

interface ChallengeResultsData {
  challenge_id: string;
  challenge_name: string;
  winner: ParticipantResult;
  loser: ParticipantResult;
  results: ParticipantResult[];
  completed_at: string;
}

const ChallengeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeDetails | null>(null);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingMeasurements, setSavingMeasurements] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [challengeResults, setChallengeResults] = useState<ChallengeResultsData | null>(null);
  const [completingChallenge, setCompletingChallenge] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    fetchChallenge();
    fetchProgressPhotos();
  }, [id]);

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/challenges/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch challenge');
      }

      const data = await response.json();
      setChallenge(data.challenge);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgressPhotos = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/photos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Failed to fetch progress photos:', err);
    }
  };

  const fetchChallengeResults = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/challenges/${id}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChallengeResults(data.results);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };

  const completeChallenge = async () => {
    if (!window.confirm('Are you sure you want to complete this challenge? This will calculate the final results and declare a winner!')) {
      return;
    }

    setCompletingChallenge(true);
    try {
      const response = await fetch(`http://localhost:8080/api/challenges/${id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      const data = await response.json();
      setChallengeResults(data.results);
      setShowResults(true);
      
      // Refresh challenge to update status
      await fetchChallenge();
      
      alert('Challenge completed! Check the results! 🏆');
    } catch (err) {
      console.error('Complete challenge error:', err);
      alert('Failed to complete challenge. Please try again.');
    } finally {
      setCompletingChallenge(false);
    }
  };

  const handlePhotosTaken = async (capturedPhotos: { front: string; side: string; back: string }) => {
    setUploading(true);
    try {
      const response = await fetch('http://localhost:8080/api/photos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          challenge_id: id,
          front_photo: capturedPhotos.front,
          side_photo: capturedPhotos.side,
          back_photo: capturedPhotos.back,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload photos');
      }

      const result = await response.json();
      console.log('Photos uploaded:', result);
      
      // Refresh photos list
      await fetchProgressPhotos();
      
      setShowPhotoUpload(false);
      alert('Progress photos uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAIAnalysisComplete = async (measurements: BodyMeasurements) => {
    setSavingMeasurements(true);
    try {
      const currentWeek = getCurrentWeek();
      const latestPhoto = getLatestPhotoForWeek(currentWeek);

      if (latestPhoto) {
        // Save measurements to existing photo - NOW MATCHES BACKEND FORMAT
        const response = await fetch('http://localhost:8080/api/measurements/update-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            challenge_id: id,
            week: currentWeek,
            measurements: measurements // DIRECTLY USE THE MEASUREMENTS OBJECT
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save measurements');
        }

        const result = await response.json();
        console.log('Measurements saved:', result);
        
        // Refresh photos to show updated measurements
        await fetchProgressPhotos();
        
        setShowAIAnalysis(false);
        alert(`AI Analysis Saved!\n\nWaist: ${measurements.waist_circumference}cm\nShoulders: ${measurements.shoulder_width}cm\nProgress Score: ${measurements.progress_score}/100`);
      } else {
        alert('No photos found for this week. Please upload photos first.');
      }
    } catch (err) {
      console.error('Save measurements error:', err);
      alert('Failed to save measurements. Please try again.');
    } finally {
      setSavingMeasurements(false);
    }
  };

  const getCurrentWeek = () => {
    if (!challenge) return 1;
    const startDate = new Date(challenge.start_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.min(diffWeeks, challenge.duration);
  };

  const getPhotosThisWeek = () => {
    const currentWeek = getCurrentWeek();
    return photos.filter(photo => photo.week === currentWeek);
  };

  const getLatestPhotoForWeek = (week: number) => {
    const weekPhotos = photos.filter(photo => photo.week === week);
    return weekPhotos.length > 0 ? weekPhotos[weekPhotos.length - 1] : null;
  };

  const isChallengeCreator = () => {
    return challenge && user && challenge.participants.includes(user.id);
  };

  const isChallengeCompleted = () => {
    return challenge?.status === 'completed';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading challenge...</div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  const currentWeek = getCurrentWeek();
  const photosThisWeek = getPhotosThisWeek();
  const hasSubmittedThisWeek = photosThisWeek.length > 0;
  const hasAIMeasurements = photos.some(photo => photo.measurements && photo.measurements.ai_processed);
  const isCreator = isChallengeCreator();
  const isCompleted = isChallengeCompleted();

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
          
          <div className="flex space-x-4">
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <span>📧</span>
              <span>Invite Friends</span>
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <span>💬</span>
              <span>Chat</span>
            </button>
          </div>
        </div>

        {/* Challenge Status Banner */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-4 text-center mb-6">
            <p className="text-white text-lg font-bold">🏆 CHALLENGE COMPLETED!</p>
            <p className="text-yellow-100">Final results are available below</p>
          </div>
        )}

        {/* Challenge Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{challenge.name}</h1>
              <p className="text-white/80">{challenge.description}</p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                challenge.status === 'active' ? 'bg-green-100 text-green-800' : 
                challenge.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {challenge.status.toUpperCase()}
              </div>
              <p className="text-white/60 text-sm mt-1">
                {challenge.participants.length} participants
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            <div>
              <p className="text-white/60 text-sm">Type</p>
              <p className="font-bold capitalize">{challenge.type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Duration</p>
              <p className="font-bold">{challenge.duration} weeks</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Snaps/Week</p>
              <p className="font-bold">{challenge.snaps_per_week}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Penalty</p>
              <p className="font-bold">{challenge.loser_penalty}</p>
            </div>
          </div>

          {/* Challenge Completion Button */}
          {isCreator && !isCompleted && currentWeek >= challenge.duration && (
            <div className="mt-6 p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
              <p className="text-yellow-200 text-center mb-3">Challenge duration completed! Ready to declare a winner?</p>
              <div className="flex justify-center">
                <button 
                  onClick={completeChallenge}
                  disabled={completingChallenge}
                  className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {completingChallenge ? 'Calculating...' : '🏆 Complete Challenge & Declare Winner'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">🤖 AI Body Analysis</h2>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 text-center">
            <p className="text-white text-lg mb-4">
              {hasAIMeasurements ? '✅ AI Measurements Available!' : 'Get precise body measurements with AI technology!'}
            </p>
            <button 
              onClick={() => setShowAIAnalysis(true)}
              disabled={savingMeasurements || !hasSubmittedThisWeek || isCompleted}
              className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg ${
                !hasSubmittedThisWeek || isCompleted
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {savingMeasurements ? 'Saving...' : 
               isCompleted ? 'Challenge Completed' :
               !hasSubmittedThisWeek ? 'Upload Photos First' : 
               'Start AI Body Scan'}
            </button>
            <p className="text-white/60 text-sm mt-2">
              {isCompleted 
                ? 'Challenge completed - no more submissions needed'
                : !hasSubmittedThisWeek 
                  ? 'Upload progress photos first to enable AI analysis'
                  : 'Uses MediaPipe AI to measure waist, shoulders, and calculate progress score'}
            </p>
          </div>

          {/* Show AI Results if available */}
          {hasAIMeasurements && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {photos.filter(photo => photo.measurements?.ai_processed).map((photo, index) => (
                <div key={photo.id} className="bg-green-500/20 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">Week {photo.week} Results</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/80">Waist:</span>
                      <span className="text-white font-bold">{photo.measurements!.waist_circumference}cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Shoulders:</span>
                      <span className="text-white font-bold">{photo.measurements!.shoulder_width}cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Progress Score:</span>
                      <span className="text-white font-bold">{photo.measurements!.progress_score}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Your Progress - Week {currentWeek}</h2>
          
          {/* Photo Upload */}
          {!isCompleted && (
            <div className={`rounded-xl p-8 text-center mb-6 ${hasSubmittedThisWeek ? 'bg-green-500/20' : 'bg-white/20'}`}>
              <p className="text-white text-lg mb-4">
                {hasSubmittedThisWeek ? '✅ Photos Submitted This Week!' : '📸 Track Your Transformation!'}
              </p>
              <button 
                onClick={() => setShowPhotoUpload(true)}
                disabled={uploading || hasSubmittedThisWeek || isCompleted}
                className={`font-bold py-3 px-6 rounded-lg transition-colors ${
                  hasSubmittedThisWeek || isCompleted
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-white text-green-600 hover:bg-green-50'
                }`}
              >
                {uploading ? 'Uploading...' : 
                 isCompleted ? 'Challenge Completed' :
                 hasSubmittedThisWeek ? 'Already Submitted' : 
                 'Upload Progress Photos'}
              </button>
              <p className="text-white/60 text-sm mt-2">
                {isCompleted 
                  ? 'Challenge completed - no more submissions needed'
                  : hasSubmittedThisWeek 
                    ? 'Great job! Check back next week.' 
                    : 'Take front, side, and back photos for AI analysis'}
              </p>
            </div>
          )}

          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm">Current Week</p>
              <p className="text-white text-2xl font-bold">{currentWeek}/{challenge.duration}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm">Photos Submitted</p>
              <p className="text-white text-2xl font-bold">{photos.length}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm">Consistency</p>
              <p className="text-white text-2xl font-bold">
                {challenge.duration > 0 ? Math.round((photos.length / challenge.duration) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Previous Photos */}
          {photos.length > 0 && (
            <div className="bg-white/20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">📁 Your Progress Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-white/10 rounded-lg p-4">
                    <p className="text-white font-semibold mb-2">Week {photo.week}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-black rounded-lg overflow-hidden mx-auto">
                          <img 
                            src={photo.front_photo} 
                            alt={`Week ${photo.week} front`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-white/60 text-xs mt-1">Front</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-black rounded-lg overflow-hidden mx-auto">
                          <img 
                            src={photo.side_photo} 
                            alt={`Week ${photo.week} side`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-white/60 text-xs mt-1">Side</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-black rounded-lg overflow-hidden mx-auto">
                          <img 
                            src={photo.back_photo} 
                            alt={`Week ${photo.week} back`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-white/60 text-xs mt-1">Back</p>
                      </div>
                    </div>
                    {photo.measurements && photo.measurements.ai_processed && (
                      <div className="mt-2 p-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded">
                        <p className="text-white text-xs font-bold">AI Analysis</p>
                        <div className="flex justify-between text-xs">
                          <span>Waist: {photo.measurements.waist_circumference}cm</span>
                          <span>Score: {photo.measurements.progress_score}</span>
                        </div>
                      </div>
                    )}
                    <p className="text-white/60 text-xs mt-2">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="bg-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Challenge Results</h3>
            
            {isCompleted ? (
              <div className="text-center">
                <p className="text-white/80 mb-4">Final results are ready! Check who won the challenge.</p>
                <button 
                  onClick={fetchChallengeResults}
                  className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  🏆 View Final Results
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-white/80 mb-4">
                  {hasAIMeasurements 
                    ? 'AI Progress Tracking Active! Complete the challenge to see final results.' 
                    : 'Complete AI analysis and finish the challenge to see who wins!'}
                </p>
                {isCreator && currentWeek >= challenge.duration && (
                  <button 
                    onClick={completeChallenge}
                    disabled={completingChallenge}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {completingChallenge ? 'Calculating...' : 'Complete Challenge'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload
          onPhotosTaken={handlePhotosTaken}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}

      {/* AI Analysis Modal */}
      {showAIAnalysis && (
        <AIBodyAnalyzer
          onAnalysisComplete={handleAIAnalysisComplete}
          onClose={() => setShowAIAnalysis(false)}
        />
      )}

      {/* Results Modal */}
      {showResults && challengeResults && (
        <ChallengeResults
          results={challengeResults}
          onClose={() => setShowResults(false)}
        />
      )}

      {/* Chat Modal */}
      {showChat && (
        <Chat
          challengeId={id!}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <InviteFriendsModal
          challengeId={id!}
          challengeName={challenge?.name || ''}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => {
            // Refresh challenge data if needed
            fetchChallenge();
          }}
        />
      )}
    </div>
  );
};

export default ChallengeDetails;