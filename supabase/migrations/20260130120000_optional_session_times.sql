-- Allow morning and afternoon session times to be nullable
-- This enables clubs that only offer one session type (e.g., afternoon-only workshops)

ALTER TABLE clubs ALTER COLUMN morning_start DROP NOT NULL;
ALTER TABLE clubs ALTER COLUMN morning_end DROP NOT NULL;
ALTER TABLE clubs ALTER COLUMN afternoon_start DROP NOT NULL;
ALTER TABLE clubs ALTER COLUMN afternoon_end DROP NOT NULL;

ALTER TABLE clubs ALTER COLUMN morning_start DROP DEFAULT;
ALTER TABLE clubs ALTER COLUMN morning_end DROP DEFAULT;
ALTER TABLE clubs ALTER COLUMN afternoon_start DROP DEFAULT;
ALTER TABLE clubs ALTER COLUMN afternoon_end DROP DEFAULT;
