import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Game } from './components/Game';
import { Leaderboard } from './components/Leaderboard';
import { Trophy } from 'lucide-react';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col relative">
        {/* Bolt logo in top-right corner */}
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed top-4 right-4 z-50 flex flex-col items-center group"
        >
          <img
            src={require('./assets/bolt-logo.png')}
            alt="Made in Bolt"
            className="w-14 h-14 drop-shadow-lg transition-transform group-hover:scale-110"
          />
          <span className="text-xs text-gray-300 mt-1 bg-black/70 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Made in Bolt</span>
        </a>
        <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-white text-xl font-bold">
                  Zubo Challenge
                </Link>
              </div>
              <div className="flex items-center">
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Game />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;