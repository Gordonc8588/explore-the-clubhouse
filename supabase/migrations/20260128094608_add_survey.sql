-- =============================================================================
-- PARENT SURVEY FEATURE
-- Market research survey for holiday/half-term club demand
-- =============================================================================

-- Sessions for auto-save (partial responses)
CREATE TABLE survey_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_step INT NOT NULL DEFAULT 1,
  responses JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Completed responses (flattened for analytics)
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES survey_sessions(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_complete BOOLEAN NOT NULL DEFAULT false,

  -- Q1-2: About Children
  num_children VARCHAR(10),
  children_ages TEXT[],

  -- Q3-4: Demand
  interest_level VARCHAR(50),
  holiday_periods TEXT[],

  -- Q5-7: Days & Times
  preferred_days VARCHAR(50),
  specific_days TEXT[],
  preferred_times TEXT[],
  days_per_week VARCHAR(50),

  -- Q8-9: Activities
  activities TEXT[],
  activities_notes TEXT,

  -- Q10-11: Structure
  age_group_preference VARCHAR(50),
  structure_preference VARCHAR(50),

  -- Q12-13 + Postcode: Practical
  important_factors TEXT[],
  additional_services TEXT[],
  postcode VARCHAR(10),

  -- Q14-16: Final
  other_feedback TEXT,
  next_holiday_interest VARCHAR(50),
  contact_consent BOOLEAN DEFAULT false,
  email VARCHAR(255),
  gdpr_consent BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_survey_sessions_started_at ON survey_sessions(started_at);
CREATE INDEX idx_survey_sessions_completed_at ON survey_sessions(completed_at);
CREATE INDEX idx_survey_responses_submitted_at ON survey_responses(submitted_at);
CREATE INDEX idx_survey_responses_is_complete ON survey_responses(is_complete);
CREATE INDEX idx_survey_responses_interest_level ON survey_responses(interest_level);
CREATE INDEX idx_survey_responses_postcode ON survey_responses(postcode);

-- Trigger to update updated_at timestamp on survey_sessions
CREATE OR REPLACE FUNCTION update_survey_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER survey_sessions_updated_at
  BEFORE UPDATE ON survey_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_survey_session_updated_at();

-- RLS Policies (allow public access for survey submission)
ALTER TABLE survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Public can create and update their own sessions
CREATE POLICY "Allow public to create survey sessions"
  ON survey_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public to update survey sessions"
  ON survey_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to read own survey session"
  ON survey_sessions FOR SELECT
  TO anon
  USING (true);

-- Public can create responses
CREATE POLICY "Allow public to create survey responses"
  ON survey_responses FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users (admin) can read all data
CREATE POLICY "Allow authenticated to read all survey sessions"
  ON survey_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to read all survey responses"
  ON survey_responses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE survey_sessions IS 'Tracks survey progress for auto-save functionality';
COMMENT ON TABLE survey_responses IS 'Completed and partial survey responses for analytics';
COMMENT ON COLUMN survey_sessions.responses IS 'JSONB storage of partial responses during survey completion';
COMMENT ON COLUMN survey_responses.important_factors IS 'Maximum 3 selections enforced in application';
