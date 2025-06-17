-- Add analytics and feedback tables

-- Add endurance mode column to leaderboard
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS endurance BOOLEAN DEFAULT FALSE;

-- Create analytics table for tracking game metrics
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET
);

-- Create feedback table for user feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  user_email TEXT,
  game_session_data JSONB
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_endurance ON leaderboard(endurance);

-- Add RLS policies
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow inserts for analytics and feedback
CREATE POLICY "Allow analytics inserts" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow feedback inserts" ON feedback FOR INSERT WITH CHECK (true);
