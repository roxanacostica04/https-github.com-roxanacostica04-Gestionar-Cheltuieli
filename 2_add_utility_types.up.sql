-- Add utility type and configuration columns
ALTER TABLE utilities ADD COLUMN utility_type TEXT NOT NULL DEFAULT 'simple';
ALTER TABLE utilities ADD COLUMN config JSONB;

-- Add installment tracking
CREATE TABLE installments (
  id BIGSERIAL PRIMARY KEY,
  utility_id BIGINT NOT NULL REFERENCES utilities(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  total_installments INTEGER NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  paid_amount DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add consumption tracking for utilities
CREATE TABLE consumption_readings (
  id BIGSERIAL PRIMARY KEY,
  utility_id BIGINT NOT NULL REFERENCES utilities(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  previous_reading DOUBLE PRECISION NOT NULL,
  current_reading DOUBLE PRECISION NOT NULL,
  consumption DOUBLE PRECISION GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
  unit TEXT NOT NULL,
  total_amount DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add notifications for upcoming payments
CREATE TABLE payment_notifications (
  id BIGSERIAL PRIMARY KEY,
  utility_id BIGINT NOT NULL REFERENCES utilities(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('installment_due', 'annual_payment_due')),
  due_date DATE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update existing utilities with default type
UPDATE utilities SET utility_type = 'simple' WHERE utility_type IS NULL;

-- Add some specialized utilities to existing categories
INSERT INTO utilities (category_id, name, description, utility_type, config) 
SELECT id, 'Asigurare CASCO', 'Asigurare auto cu plată în rate', 'installment', '{"installments": 4, "frequency_months": 4}'::jsonb
FROM categories WHERE name = 'Rate și Împrumuturi';

INSERT INTO utilities (category_id, name, description, utility_type, config) 
SELECT id, 'Rată Banca Transilvania', 'Rată bancară cu opțiuni multiple de plată', 'bank_installment', '{"max_installments": 20, "available_installments": [1,3,4,5,6,8,10,12,14,16,18,20]}'::jsonb
FROM categories WHERE name = 'Rate și Împrumuturi';

INSERT INTO utilities (category_id, name, description, utility_type, config) 
SELECT id, 'Apă', 'Consum apă cu citire index', 'consumption', '{"unit": "m3", "meter_type": "water"}'::jsonb
FROM categories WHERE name = 'Utilități';

INSERT INTO utilities (category_id, name, description, utility_type, config) 
SELECT id, 'Curent Electric', 'Consum energie electrică', 'consumption', '{"unit": "kWh", "meter_type": "electricity"}'::jsonb
FROM categories WHERE name = 'Utilități';

INSERT INTO utilities (category_id, name, description, utility_type, config) 
SELECT id, 'Gaze Naturale', 'Consum gaze naturale', 'consumption', '{"unit": "m3", "meter_type": "gas"}'::jsonb
FROM categories WHERE name = 'Utilități';

INSERT INTO utilities (category_id, name, description, utility_type, config) 
SELECT id, 'Taxă Concesiune Cimitir', 'Taxă anuală cimitir cu notificări', 'annual_payment', '{"payment_years": [1,2,3,4], "notification_days_before": 30}'::jsonb
FROM categories WHERE name = 'Servicii';
