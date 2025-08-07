-- Comprehensive fix for all numeric type issues
-- Convert all amount columns to DOUBLE PRECISION to ensure compatibility

-- First, drop the generated column that depends on the columns we want to alter
ALTER TABLE consumption_readings DROP COLUMN IF EXISTS consumption;

-- Update transactions table
ALTER TABLE transactions ALTER COLUMN amount TYPE DOUBLE PRECISION;

-- Update installments table
ALTER TABLE installments ALTER COLUMN amount TYPE DOUBLE PRECISION;
ALTER TABLE installments ALTER COLUMN paid_amount TYPE DOUBLE PRECISION;

-- Update consumption_readings table (now that the generated column is dropped)
ALTER TABLE consumption_readings ALTER COLUMN previous_reading TYPE DOUBLE PRECISION;
ALTER TABLE consumption_readings ALTER COLUMN current_reading TYPE DOUBLE PRECISION;
ALTER TABLE consumption_readings ALTER COLUMN total_amount TYPE DOUBLE PRECISION;

-- Recreate the computed column with proper type
ALTER TABLE consumption_readings ADD COLUMN consumption DOUBLE PRECISION GENERATED ALWAYS AS (current_reading - previous_reading) STORED;

-- Add explicit indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS idx_installments_amount ON installments(amount);
CREATE INDEX IF NOT EXISTS idx_consumption_total_amount ON consumption_readings(total_amount);

-- Note: No need to UPDATE existing data since ALTER COLUMN TYPE automatically converts the data
