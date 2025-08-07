-- Add logo field to utilities table
ALTER TABLE utilities ADD COLUMN logo_url TEXT;

-- Add index for better performance when querying utilities with logos
CREATE INDEX IF NOT EXISTS idx_utilities_logo ON utilities(logo_url) WHERE logo_url IS NOT NULL;
