-- Migration: Expand child info form
-- Adds fields for:
-- - Emergency contact relationship (EC1)
-- - Second emergency contact (EC2)
-- - Authorized pickup persons (up to 3)
-- - Farm animal consent
-- - Woodland consent
-- - Parent notes

-- Emergency Contact 1: add relationship
ALTER TABLE children ADD COLUMN emergency_contact_relationship TEXT;

-- Emergency Contact 2 (all new)
ALTER TABLE children
  ADD COLUMN emergency_contact_2_name TEXT,
  ADD COLUMN emergency_contact_2_phone TEXT,
  ADD COLUMN emergency_contact_2_relationship TEXT;

-- Authorized Pickup Persons (3 slots, all optional)
ALTER TABLE children
  ADD COLUMN pickup_person_1_name TEXT,
  ADD COLUMN pickup_person_1_phone TEXT,
  ADD COLUMN pickup_person_1_relationship TEXT,
  ADD COLUMN pickup_person_2_name TEXT,
  ADD COLUMN pickup_person_2_phone TEXT,
  ADD COLUMN pickup_person_2_relationship TEXT,
  ADD COLUMN pickup_person_3_name TEXT,
  ADD COLUMN pickup_person_3_phone TEXT,
  ADD COLUMN pickup_person_3_relationship TEXT;

-- New consent checkboxes
ALTER TABLE children
  ADD COLUMN farm_animal_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN woodland_consent BOOLEAN NOT NULL DEFAULT false;

-- Parent notes
ALTER TABLE children ADD COLUMN parent_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN children.emergency_contact_relationship IS 'Relationship to child for emergency contact 1';
COMMENT ON COLUMN children.emergency_contact_2_name IS 'Second emergency contact name';
COMMENT ON COLUMN children.emergency_contact_2_phone IS 'Second emergency contact phone';
COMMENT ON COLUMN children.emergency_contact_2_relationship IS 'Second emergency contact relationship to child';
COMMENT ON COLUMN children.farm_animal_consent IS 'Consent for child to interact with farm animals';
COMMENT ON COLUMN children.woodland_consent IS 'Consent for child to participate in woodland activities';
COMMENT ON COLUMN children.parent_notes IS 'Additional notes from parent about child (behavioral, special needs, concerns)';
