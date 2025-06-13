import React from "react";

const Home: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-4 text-white">About Zubo</h2>
      <p className="text-lg text-gray-200 mb-2">
        <strong>Zubo</strong> is a next-generation intelligence and self-reflection game designed by David Labs. Our goal is to make learning about yourself fun, challenging, and rewarding. Zubo combines logic, analytical thinking, general knowledge, and personality questions to help you discover your unique persona while competing for the top spot on the leaderboard.
      </p>
      <p className="text-gray-400">
        We believe that games can be both entertaining and meaningful. Zubo is our experiment in blending gamification, psychology, and technology to create a new kind of digital experience.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold mb-4 text-white">Privacy & Data Policy</h2>
      <p className="text-gray-200 mb-2">
        We collect your first name, last name, and email address when you submit your score to the leaderboard. We also store your score, number of lives, questions answered, persona, and avatar.
      </p>
      <p className="text-gray-400 mb-2">
        This data is used solely for displaying the leaderboard, sending you a congratulatory email, and improving the game experience. We do not sell or share your data with third parties. Your email is only used for leaderboard notifications and is never displayed publicly.
      </p>
      <p className="text-gray-400">
        If you have any questions or want your data removed, contact us at <a href="mailto:zubo@davidlabs.ca" className="underline text-purple-300">zubo@davidlabs.ca</a>.
      </p>
    </section>
  </div>
);

export default Home; 