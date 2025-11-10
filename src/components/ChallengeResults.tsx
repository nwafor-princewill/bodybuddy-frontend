import React from 'react';

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

interface ChallengeResults {
  challenge_id: string;
  challenge_name: string;
  winner: ParticipantResult;
  loser: ParticipantResult;
  results: ParticipantResult[];
  completed_at: string;
}

interface ChallengeResultsProps {
  results: ChallengeResults;
  onClose: () => void;
}

const ChallengeResults: React.FC<ChallengeResultsProps> = ({ results, onClose }) => {
  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-green-500';
    if (improvement < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0) return '↗️';
    if (improvement < 0) return '↘️';
    return '➡️';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">🏆 Challenge Results</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Winner Announcement */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-6 text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-white mb-2">CHALLENGE COMPLETED!</h3>
          <p className="text-yellow-100 text-lg">
            {results.winner.username} is the winner!
          </p>
        </div>

        {/* Winner & Loser Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Winner Card */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                1st
              </div>
              <div>
                <h4 className="text-xl font-bold text-green-800">WINNER</h4>
                <p className="text-green-600">{results.winner.username}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700">Total Score:</span>
                <span className="font-bold text-green-800">{results.winner.total_score.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Waist Reduced:</span>
                <span className={`font-bold ${getImprovementColor(results.winner.improvement.waist_reduction)}`}>
                  {getImprovementIcon(results.winner.improvement.waist_reduction)} {Math.abs(results.winner.improvement.waist_reduction).toFixed(1)}cm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Shoulders Gained:</span>
                <span className={`font-bold ${getImprovementColor(results.winner.improvement.shoulder_gain)}`}>
                  {getImprovementIcon(results.winner.improvement.shoulder_gain)} {Math.abs(results.winner.improvement.shoulder_gain).toFixed(1)}cm
                </span>
              </div>
            </div>
          </div>

          {/* Loser Card */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                {results.results.length}th
              </div>
              <div>
                <h4 className="text-xl font-bold text-red-800">LOSER</h4>
                <p className="text-red-600">{results.loser.username}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-red-700">Penalty:</span>
                <span className="font-bold text-red-800">Pay Up! 🍔</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Total Score:</span>
                <span className="font-bold text-red-800">{results.loser.total_score.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results Table */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4">📊 Detailed Results</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Participant</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Waist Δ</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Shoulders Δ</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Progress Δ</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Consistency</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Total Score</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((participant) => (
                  <tr key={participant.user_id} className="border-b border-gray-100">
                    <td className="py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        participant.rank === 1 ? 'bg-yellow-500' :
                        participant.rank === 2 ? 'bg-gray-400' :
                        participant.rank === 3 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {participant.rank}
                      </div>
                    </td>
                    <td className="py-3 font-medium text-gray-800">
                      {participant.username}
                    </td>
                    <td className={`py-3 font-bold ${getImprovementColor(participant.improvement.waist_reduction)}`}>
                      {getImprovementIcon(participant.improvement.waist_reduction)} {Math.abs(participant.improvement.waist_reduction).toFixed(1)}cm
                    </td>
                    <td className={`py-3 font-bold ${getImprovementColor(participant.improvement.shoulder_gain)}`}>
                      {getImprovementIcon(participant.improvement.shoulder_gain)} {Math.abs(participant.improvement.shoulder_gain).toFixed(1)}cm
                    </td>
                    <td className={`py-3 font-bold ${getImprovementColor(participant.improvement.progress_increase)}`}>
                      {getImprovementIcon(participant.improvement.progress_increase)} {Math.abs(participant.improvement.progress_increase).toFixed(1)}pts
                    </td>
                    <td className="py-3 text-gray-700">
                      {participant.improvement.consistency_score.toFixed(0)}%
                    </td>
                    <td className="py-3 font-bold text-gray-800">
                      {participant.total_score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors">
            🏆 Celebrate Winner
          </button>
          <button className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors">
            📱 Share Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeResults;