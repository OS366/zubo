import { Question } from '../types';

export const questionPool: Question[] = [
  // Logical Reasoning Questions
  {
    id: 1,
    text: "If all roses are flowers and all flowers are plants, then all roses are:",
    options: ["Plants", "Trees", "Weeds", "Bushes"],
    answer: 0,
    type: 'logical',
    timed: true
  },
  {
    id: 2,
    text: "What comes next in the sequence: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    answer: 1,
    type: 'logical',
    timed: true
  },
  {
    id: 3,
    text: "If A = 1, B = 2, C = 3, what does 'CAB' equal?",
    options: ["6", "321", "312", "123"],
    answer: 0,
    type: 'logical',
    timed: false
  },
  {
    id: 4,
    text: "Which number doesn't belong: 8, 27, 64, 100, 125?",
    options: ["8", "27", "100", "125"],
    answer: 2,
    type: 'logical',
    timed: true
  },
  {
    id: 5,
    text: "If it takes 5 machines 5 minutes to make 5 widgets, how long does it take 100 machines to make 100 widgets?",
    options: ["5 minutes", "20 minutes", "100 minutes", "500 minutes"],
    answer: 0,
    type: 'logical',
    timed: true
  },

  // Analytical Thinking Questions
  {
    id: 6,
    text: "A company's revenue increased by 25% in year 1, then decreased by 20% in year 2. What's the net change?",
    options: ["5% increase", "0% change", "5% decrease", "2% increase"],
    answer: 3,
    type: 'analytical',
    timed: true
  },
  {
    id: 7,
    text: "Which data visualization would best show the relationship between two continuous variables?",
    options: ["Bar chart", "Pie chart", "Scatter plot", "Line graph"],
    answer: 2,
    type: 'analytical',
    timed: false
  },
  {
    id: 8,
    text: "What's the most likely cause of a sudden spike in website traffic?",
    options: ["Server maintenance", "Viral content", "Technical error", "Weekend effect"],
    answer: 1,
    type: 'analytical',
    timed: false
  },
  {
    id: 9,
    text: "If correlation between X and Y is 0.8, what can we conclude?",
    options: ["X causes Y", "Y causes X", "Strong positive relationship", "No relationship"],
    answer: 2,
    type: 'analytical',
    timed: true
  },
  {
    id: 10,
    text: "What's the best approach to solve a complex multi-step problem?",
    options: ["Guess and check", "Break into smaller parts", "Use the first solution", "Ask someone else"],
    answer: 1,
    type: 'analytical',
    timed: false
  },

  // General Knowledge Questions
  {
    id: 11,
    text: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    answer: 2,
    type: 'gk',
    timed: false
  },
  {
    id: 12,
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: 1,
    type: 'gk',
    timed: false
  },
  {
    id: 13,
    text: "Who wrote '1984'?",
    options: ["Aldous Huxley", "Ray Bradbury", "George Orwell", "H.G. Wells"],
    answer: 2,
    type: 'gk',
    timed: true
  },
  {
    id: 14,
    text: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    answer: 3,
    type: 'gk',
    timed: false
  },
  {
    id: 15,
    text: "Which element has the chemical symbol 'Au'?",
    options: ["Silver", "Gold", "Aluminum", "Argon"],
    answer: 1,
    type: 'gk',
    timed: true
  },

  // Weighted Personality Questions
  {
    id: 16,
    text: "When facing a difficult decision, you typically:",
    options: [
      "Analyze all possible outcomes carefully",
      "Trust your gut feeling",
      "Seek advice from others",
      "Look for precedent or rules to follow"
    ],
    weights: { "Analyst": 3, "Explorer": 2, "Empathetic": 1, "Leader": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 17,
    text: "In a group project, you naturally:",
    options: [
      "Take charge and delegate tasks",
      "Focus on the creative aspects",
      "Ensure everyone's voice is heard",
      "Handle the technical details"
    ],
    weights: { "Leader": 3, "Creative": 2, "Empathetic": 1, "Analyst": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 18,
    text: "Your ideal weekend involves:",
    options: [
      "Reading and learning something new",
      "Outdoor adventures and exploration",
      "Socializing with friends and family",
      "Working on personal projects"
    ],
    weights: { "Analyst": 3, "Explorer": 2, "Empathetic": 1, "Creative": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 19,
    text: "When you're stressed, you:",
    options: [
      "Create detailed plans to address the issues",
      "Take a break and do something relaxing",
      "Talk through your feelings with someone",
      "Push through and work harder"
    ],
    weights: { "Analyst": 3, "Creative": 2, "Empathetic": 1, "Achiever": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 20,
    text: "You're most motivated by:",
    options: [
      "Solving complex problems",
      "Creating something beautiful",
      "Helping others succeed",
      "Achieving personal goals"
    ],
    weights: { "Analyst": 3, "Creative": 2, "Empathetic": 1, "Achiever": 0 },
    type: 'weighted',
    timed: false
  },

  // Additional questions to reach 50+
  {
    id: 21,
    text: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    answer: 2,
    type: 'logical',
    timed: true
  },
  {
    id: 22,
    text: "Which country has the most time zones?",
    options: ["Russia", "USA", "China", "France"],
    answer: 3,
    type: 'gk',
    timed: false
  },
  {
    id: 23,
    text: "In your free time, you prefer:",
    options: [
      "Learning new skills online",
      "Exploring nature or traveling", 
      "Spending time with loved ones",
      "Working on hobbies alone"
    ],
    weights: { "Analyst": 3, "Explorer": 2, "Empathetic": 1, "Creative": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 24,
    text: "What percentage is 3/8?",
    options: ["35%", "37.5%", "40%", "42.5%"],
    answer: 1,
    type: 'analytical',
    timed: true
  },
  {
    id: 25,
    text: "Your communication style is typically:",
    options: [
      "Direct and to the point",
      "Warm and encouraging",
      "Thoughtful and detailed",
      "Casual and humorous"
    ],
    weights: { "Leader": 3, "Empathetic": 2, "Analyst": 1, "Creative": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 26,
    text: "Which programming concept relates to 'inheritance'?",
    options: ["Variables", "Functions", "Object-Oriented Programming", "Loops"],
    answer: 2,
    type: 'gk',
    timed: false
  },
  {
    id: 27,
    text: "If 2x + 5 = 15, what is x?",
    options: ["3", "4", "5", "6"],
    answer: 2,
    type: 'logical',
    timed: true
  },
  {
    id: 28,
    text: "When learning something new, you:",
    options: [
      "Study theory first, then practice",
      "Jump in and learn by doing",
      "Find a mentor or teacher",
      "Research extensively online"
    ],
    weights: { "Analyst": 3, "Explorer": 2, "Empathetic": 1, "Creative": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 29,
    text: "What is the largest mammal?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    answer: 1,
    type: 'gk',
    timed: false
  },
  {
    id: 30,
    text: "Your biggest strength in teamwork is:",
    options: [
      "Organizing and coordinating",
      "Generating creative ideas",
      "Mediating conflicts",
      "Executing tasks efficiently"
    ],
    weights: { "Leader": 3, "Creative": 2, "Empathetic": 1, "Achiever": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 31,
    text: "Which logical fallacy involves attacking the person rather than their argument?",
    options: ["Straw man", "Ad hominem", "False dichotomy", "Slippery slope"],
    answer: 1,
    type: 'analytical',
    timed: true
  },
  {
    id: 32,
    text: "You handle criticism by:",
    options: [
      "Analyzing it objectively for truth",
      "Taking it to heart emotionally",
      "Discussing it with others",
      "Using it as motivation to improve"
    ],
    weights: { "Analyst": 3, "Empathetic": 2, "Leader": 1, "Achiever": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 33,
    text: "What year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    answer: 1,
    type: 'gk',
    timed: false
  },
  {
    id: 34,
    text: "If all A are B, and some B are C, then:",
    options: ["All A are C", "Some A are C", "No A are C", "Cannot be determined"],
    answer: 3,
    type: 'logical',
    timed: true
  },
  {
    id: 35,
    text: "Your approach to risk is:",
    options: [
      "Calculate probabilities carefully",
      "Trust your instincts",
      "Seek consensus from others",
      "Minimize risk whenever possible"
    ],
    weights: { "Analyst": 3, "Explorer": 2, "Empathetic": 1, "Achiever": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 36,
    text: "Which is NOT a renewable energy source?",
    options: ["Solar", "Wind", "Natural Gas", "Hydroelectric"],
    answer: 2,
    type: 'gk',
    timed: false
  },
  {
    id: 37,
    text: "What comes next: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "13", "15", "16"],
    answer: 1,
    type: 'logical',
    timed: true
  },
  {
    id: 38,
    text: "In conflict situations, you typically:",
    options: [
      "Focus on finding logical solutions",
      "Try to understand all perspectives",
      "Seek to maintain harmony",
      "Stand firm on your principles"
    ],
    weights: { "Analyst": 3, "Empathetic": 2, "Creative": 1, "Leader": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 39,
    text: "What is the most abundant gas in Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    answer: 2,
    type: 'gk',
    timed: false
  },
  {
    id: 40,
    text: "When making important life decisions, you prioritize:",
    options: [
      "Logic and practical outcomes",
      "Personal values and beliefs",
      "Impact on relationships",
      "Long-term stability"
    ],
    weights: { "Analyst": 3, "Creative": 2, "Empathetic": 1, "Achiever": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 41,
    text: "A train travels 120 miles in 2 hours. What's its average speed?",
    options: ["50 mph", "60 mph", "70 mph", "80 mph"],
    answer: 1,
    type: 'analytical',
    timed: true
  },
  {
    id: 42,
    text: "Your ideal work environment is:",
    options: [
      "Quiet and focused",
      "Dynamic and changing",
      "Collaborative and social",
      "Structured and predictable"
    ],
    weights: { "Analyst": 3, "Explorer": 2, "Empathetic": 1, "Achiever": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 43,
    text: "Who painted the Mona Lisa?",
    options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
    answer: 1,
    type: 'gk',
    timed: false
  },
  {
    id: 44,
    text: "Which word is the opposite of 'verbose'?",
    options: ["Talkative", "Concise", "Elaborate", "Detailed"],
    answer: 1,
    type: 'logical',
    timed: false
  },
  {
    id: 45,
    text: "You define success as:",
    options: [
      "Achieving measurable goals",
      "Personal fulfillment and growth",
      "Positive impact on others",
      "Recognition and status"
    ],
    weights: { "Achiever": 3, "Creative": 2, "Empathetic": 1, "Leader": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 46,
    text: "What is the formula for the area of a circle?",
    options: ["πr", "2πr", "πr²", "2πr²"],
    answer: 2,
    type: 'analytical',
    timed: true
  },
  {
    id: 47,
    text: "When facing uncertainty, you:",
    options: [
      "Gather more information",
      "Make a decision quickly",
      "Consult with trusted advisors",
      "Wait for clearer circumstances"
    ],
    weights: { "Analyst": 3, "Leader": 2, "Empathetic": 1, "Creative": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 48,
    text: "Which ocean is the smallest?",
    options: ["Atlantic", "Indian", "Arctic", "Southern"],
    answer: 2,
    type: 'gk',
    timed: false
  },
  {
    id: 49,
    text: "In base 2, what is 1011?",
    options: ["9", "10", "11", "12"],
    answer: 2,
    type: 'logical',
    timed: true
  },
  {
    id: 50,
    text: "Your greatest motivation comes from:",
    options: [
      "Intellectual challenges",
      "Creative expression",
      "Helping others grow",
      "Personal achievement"
    ],
    weights: { "Analyst": 3, "Creative": 2, "Empathetic": 1, "Achiever": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 51,
    text: "What is 15% of 200?",
    options: ["25", "30", "35", "40"],
    answer: 1,
    type: 'analytical',
    timed: true
  },
  {
    id: 52,
    text: "You prefer feedback that is:",
    options: [
      "Specific and actionable",
      "Encouraging and supportive",
      "Honest and direct",
      "Constructive and balanced"
    ],
    weights: { "Analyst": 3, "Empathetic": 2, "Leader": 1, "Creative": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 53,
    text: "Which vitamin is produced when skin is exposed to sunlight?",
    options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
    answer: 2,
    type: 'gk',
    timed: false
  },
  {
    id: 54,
    text: "Your leadership style focuses on:",
    options: [
      "Setting clear goals and metrics",
      "Inspiring and motivating others",
      "Building consensus and collaboration",
      "Developing people's skills"
    ],
    weights: { "Achiever": 3, "Leader": 2, "Empathetic": 1, "Creative": 0 },
    type: 'weighted',
    timed: false
  },
  {
    id: 55,
    text: "If today is Wednesday, what day will it be in 100 days?",
    options: ["Monday", "Tuesday", "Wednesday", "Friday"],
    answer: 3,
    type: 'logical',
    timed: true
  }
];

export function getRandomQuestions(count: number = 100): Question[] {
  // Enhanced randomization using Fisher-Yates shuffle algorithm
  const questions = [...questionPool];
  
  // Fisher-Yates shuffle for better randomization
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  
  return questions.slice(0, Math.min(count, questionPool.length));
}