import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateChallenge from './pages/CreateChallenge';
import Dashboard from './pages/Dashboard';
import ChallengeDetails from './pages/ChallengeDetails';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import FriendSearch from './pages/FriendSearch';
import Leaderboards from './pages/Leaderboards';
import Notifications from './pages/Notifications';
import Penalties from './pages/Penalties';

const Homepage: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('how-it-works');

  // Only redirect to dashboard if user is on the exact root path
  if (user && window.location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">💪</span>
              </div>
              <span className="text-2xl font-bold text-white">BodyBuddy</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="bg-white text-green-600 font-bold py-2 px-6 rounded-lg hover:bg-green-50 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-transparent border-2 border-white text-white font-bold py-2 px-6 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Transform Together. <br />Compete. Win. 💪
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          The social fitness platform where your friends' progress literally costs you money if you lose. Real stakes. Real results.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link 
            to="/register" 
            className="block sm:inline-block bg-white text-green-600 font-bold py-4 px-8 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg text-lg"
          >
            Start Your First Challenge - It's Free
          </Link>
          <button 
            onClick={() => setActiveSection('how-it-works')}
            className="block sm:inline-block bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white/10 transition-all duration-300 text-lg"
          >
            See How It Works
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/10 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">90%</div>
              <div className="text-white/80">Lower Quit Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">2.5x</div>
              <div className="text-white/80">More Consistency</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">$0</div>
              <div className="text-white/80">Hardware Cost</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-white/80">AI Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            How BodyBuddy Works
          </h2>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* 1. Create Challenges */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-6xl mb-6">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Create Fitness Challenges</h3>
              <p className="text-white/80 mb-6">
                Start a fitness battle with friends. Choose your challenge type, set the duration, and define what the loser owes the winner.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  <span><strong>Challenge Types:</strong> Weight Loss, Muscle Gain, General Fitness</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  <span><strong>Duration:</strong> 4-12 weeks with weekly photo check-ins</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  <span><strong>Real Stakes:</strong> Set meaningful penalties for the loser</span>
                </div>
              </div>
            </div>

            {/* 2. Invite Friends */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-6xl mb-6">👥</div>
              <h3 className="text-2xl font-bold text-white mb-4">2. Invite Friends & Auto-Connect</h3>
              <p className="text-white/80 mb-6">
                Send email invitations to friends. When they accept, they automatically join your challenge and become your BodyBuddy friend.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span><strong>Smart Invites:</strong> Secure email invitations with one-click acceptance</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span><strong>Auto-Friends:</strong> Accepting challenges = automatic friend connections</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span><strong>Find Friends:</strong> Search and connect with other fitness enthusiasts</span>
                </div>
              </div>
            </div>

            {/* 3. AI Progress Tracking */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-6xl mb-6">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-4">3. AI-Powered Progress Tracking</h3>
              <p className="text-white/80 mb-6">
                Weekly photo submissions analyzed by AI to measure your transformation objectively. No guesswork, just data.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  <span><strong>Google MediaPipe AI:</strong> Advanced pose detection technology</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  <span><strong>Precise Measurements:</strong> Waist circumference, shoulder width, progress scores</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  <span><strong>Zero Hardware:</strong> Uses your phone camera - no expensive equipment needed</span>
                </div>
              </div>
            </div>

            {/* 4. Real Stakes & Penalties */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-6xl mb-6">⚖️</div>
              <h3 className="text-2xl font-bold text-white mb-4">4. Real Stakes & Penalty System</h3>
              <p className="text-white/80 mb-6">
                The loser completes a pre-agreed penalty. This creates real accountability that drives results.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  <span><strong>Meaningful Penalties:</strong> "Buy dinner", "Do 100 burpees", "Clean their car"</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  <span><strong>7-Day Completion:</strong> Loser has one week to complete the penalty</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  <span><strong>Winner Verification:</strong> Winner confirms penalty completion</span>
                </div>
              </div>
            </div>

            {/* 5. Live Chat & Trash Talk */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-6xl mb-6">💬</div>
              <h3 className="text-2xl font-bold text-white mb-4">5. Live Chat & Trash Talk</h3>
              <p className="text-white/80 mb-6">
                Real-time chat within each challenge keeps the motivation high and the competition fierce.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                  <span><strong>Challenge-Specific Chat:</strong> Dedicated chat rooms for each challenge</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                  <span><strong>Real-time Messaging:</strong> Instant updates without page refreshes</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                  <span><strong>Built-in Banter:</strong> Healthy trash talk to fuel competition</span>
                </div>
              </div>
            </div>

            {/* 6. Leaderboards & Rankings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-2xl font-bold text-white mb-4">6. Leaderboards & Global Rankings</h3>
              <p className="text-white/80 mb-6">
                See how you stack up against friends and the global BodyBuddy community.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  <span><strong>Fair Scoring:</strong> 40% waist reduction, 30% shoulder gains, 20% progress, 10% consistency</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  <span><strong>Global Leaderboards:</strong> Compare yourself with all BodyBuddy users</span>
                </div>
                <div className="flex items-center text-white/90">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></span>
                  <span><strong>Achievement Badges:</strong> Earn badges for wins, consistency, and social activity</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Science Behind It */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">The Science Behind Our Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-4">😨</div>
              <h3 className="text-xl font-bold text-white mb-3">Loss Aversion</h3>
              <p className="text-white/80">
                People work 2x harder to avoid losing than to gain equivalent rewards. Real penalties create real motivation.
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-4">👀</div>
              <h3 className="text-xl font-bold text-white mb-3">Social Accountability</h3>
              <p className="text-white/80">
                When others are watching your progress, you're 65% more likely to achieve your goals.
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-3">Gamification</h3>
              <p className="text-white/80">
                Turning fitness into a game with points, rankings, and rewards increases engagement by 3x.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Fitness Journey?
        </h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Join thousands of users who are achieving real results through social accountability and AI-powered tracking.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link 
            to="/register" 
            className="block sm:inline-block bg-white text-green-600 font-bold py-4 px-8 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg text-lg"
          >
            Start Your First Challenge
          </Link>
          <Link 
            to="/login" 
            className="block sm:inline-block bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white/10 transition-all duration-300 text-lg"
          >
            Sign In to Continue
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/60">
            Built with 💪 for fitness enthusiasts worldwide. BodyBuddy - Transform Together.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/create-challenge" element={
            <ProtectedRoute>
              <CreateChallenge />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/challenge/:id" element={
            <ProtectedRoute>
              <ChallengeDetails />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          <Route path="/friends/search" element={
            <ProtectedRoute>
              <FriendSearch />
            </ProtectedRoute>
          } />
          <Route path="/leaderboards" element={
            <ProtectedRoute>
              <Leaderboards />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/penalties" element={
            <ProtectedRoute>
              <Penalties />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;