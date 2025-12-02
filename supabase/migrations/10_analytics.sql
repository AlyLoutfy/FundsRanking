-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('fund_click', 'ad_view', 'ad_click')),
  target_id UUID NOT NULL, -- fund_id or ad_id
  target_type TEXT NOT NULL CHECK (target_type IN ('fund', 'ad')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert events (tracking)
CREATE POLICY "Allow anonymous insert" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow admins to view all events
CREATE POLICY "Allow admins to select" ON analytics_events
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Create index for faster querying
CREATE INDEX idx_analytics_target ON analytics_events(target_id, event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
