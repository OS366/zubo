export const personas = {
  "Analyst": {
    title: "The Strategic Analyst",
    description: "You approach life with careful analysis and logical thinking. You excel at breaking down complex problems and making data-driven decisions.",
    traits: ["Logical", "Methodical", "Detail-oriented", "Strategic"]
  },
  "Creative": {
    title: "The Innovative Creator", 
    description: "You see the world through a lens of possibility and imagination. Your strength lies in generating original ideas and artistic expression.",
    traits: ["Imaginative", "Original", "Artistic", "Visionary"]
  },
  "Leader": {
    title: "The Natural Leader",
    description: "You inspire others and naturally take charge in group situations. People look to you for direction and motivation.",
    traits: ["Charismatic", "Decisive", "Motivating", "Confident"]
  },
  "Empathetic": {
    title: "The Compassionate Connector",
    description: "You understand and connect with others on a deep level. Your emotional intelligence helps you build strong relationships.",
    traits: ["Understanding", "Supportive", "Intuitive", "Caring"]
  },
  "Explorer": {
    title: "The Adventurous Explorer",
    description: "You thrive on new experiences and discoveries. Your curiosity drives you to constantly seek out adventure and learning.",
    traits: ["Curious", "Adventurous", "Open-minded", "Energetic"]
  },
  "Achiever": {
    title: "The Driven Achiever",
    description: "You are goal-oriented and persistent in pursuing success. Your determination helps you overcome obstacles and reach new heights.",
    traits: ["Ambitious", "Persistent", "Goal-focused", "Disciplined"]
  }
};

export function calculatePersona(personaScores: Record<string, number>): string {
  const entries = Object.entries(personaScores);
  if (entries.length === 0) return "Analyst"; // Default fallback
  
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function getPersonaInfo(personaKey: string) {
  return personas[personaKey as keyof typeof personas] || personas.Analyst;
}