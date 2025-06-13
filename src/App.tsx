import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Game } from "./components/Game";
import { Leaderboard } from "./components/Leaderboard";
import { Trophy } from "lucide-react";
import Footer from "./components/Footer";
import boltLogo from "./assets/bolt-logo.png"; // PNG import
import Home from "./components/Home";

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
          <img src={boltLogo} alt="Made in Bolt" className="w-16 h-16" />
          <span className="text-xs text-gray-300 mt-1 bg-black/70 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Made in Bolt
          </span>
        </a>
        <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <Link to="/" className="text-white text-xl font-bold">
                  Play Zubo
                </Link>
                <Link
                  to="/about"
                  className="text-white text-sm font-medium hover:underline"
                >
                  About & Privacy
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
            <Route path="/about" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
        <Footer />
        {/* Temporary Email Debug Panel */}
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            padding: "16px",
            zIndex: 1000,
            minWidth: "300px",
          }}
        >
          <h3 style={{ color: "#fff", margin: "0 0 12px 0", fontSize: "14px" }}>
            Email Debug Panel
          </h3>

          <button
            style={{
              margin: "4px",
              padding: "8px 12px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
            onClick={() => {
              fetch("/.netlify/functions/send-leaderboard-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: "test@example.com",
                  firstName: "Test User",
                  avatarUrl:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
                  lives: 3,
                  easterEggs: 0,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  console.log("Email test response:", data);
                  alert(
                    "Email test response: " + JSON.stringify(data, null, 2)
                  );
                })
                .catch((err) => {
                  console.error("Email test error:", err);
                  alert("Email test error: " + err.message);
                });
            }}
          >
            Test Email Function
          </button>

          <button
            style={{
              margin: "4px",
              padding: "8px 12px",
              background: "#059669",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
            onClick={() => {
              const email = prompt("Enter email address to test:");
              if (email) {
                fetch("/.netlify/functions/send-leaderboard-email", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    to: email,
                    firstName: "Debug Test",
                    avatarUrl:
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=debug",
                    lives: 2,
                    easterEggs: 1,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("Real email test response:", data);
                    alert(
                      "Real email sent to " +
                        email +
                        ": " +
                        JSON.stringify(data, null, 2)
                    );
                  })
                  .catch((err) => {
                    console.error("Real email test error:", err);
                    alert("Real email test error: " + err.message);
                  });
              }
            }}
          >
            Send Real Test Email
          </button>

          <button
            style={{
              margin: "4px",
              padding: "8px 12px",
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
            onClick={() => {
              fetch("/.netlify/functions/send-leaderboard-email", {
                method: "GET",
              })
                .then((res) => res.json())
                .then((data) => {
                  console.log("Function status:", data);
                  alert("Function status: " + JSON.stringify(data, null, 2));
                })
                .catch((err) => {
                  console.error("Function status error:", err);
                  alert("Function status error: " + err.message);
                });
            }}
          >
            Check Function Status
          </button>

          <div style={{ marginTop: "8px", fontSize: "11px", color: "#9ca3af" }}>
            Check browser console for detailed logs
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
