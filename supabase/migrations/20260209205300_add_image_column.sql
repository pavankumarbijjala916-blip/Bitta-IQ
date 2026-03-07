-- Add image column to batteries table
ALTER TABLE batteries ADD COLUMN IF NOT EXISTS image TEXT;

-- Comment on column
COMMENT ON COLUMN batteries.image IS 'Base64 encoded image or image URL';
