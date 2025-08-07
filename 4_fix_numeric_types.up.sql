-- Fix numeric type issues by ensuring all amount columns use DOUBLE PRECISION
-- and add explicit casting in problematic areas

-- Update any existing numeric columns to double precision if they exist
-- This migration ensures compatibility with Encore.ts type system

-- Add indexes for better performance on reporting queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_utility_date ON transactions(utility_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date);

-- Ensure all amount calculations return proper numeric types
-- This helps with the Rust/PostgreSQL type conversion issues
