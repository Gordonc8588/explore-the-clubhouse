-- Add younger children (2-4) questions to survey_responses
ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS has_younger_children TEXT,
  ADD COLUMN IF NOT EXISTS younger_children_open_play TEXT;

COMMENT ON COLUMN survey_responses.has_younger_children IS 'Whether respondent has children aged 2-4 (Yes/No)';
COMMENT ON COLUMN survey_responses.younger_children_open_play IS 'Interest in open play mornings for 2-4 year olds (Yes definitely/Possibly/No)';
