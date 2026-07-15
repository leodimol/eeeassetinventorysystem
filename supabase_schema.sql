-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model TEXT NOT NULL,
    brand TEXT,
    equipment_type TEXT NOT NULL,
    asset_tag TEXT UNIQUE,
    serial TEXT,
    location TEXT,
    assigned_to TEXT,
    added_by TEXT,
    idle_release TEXT,
    released_by TEXT,
    release_datetime TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'available',
    condition TEXT DEFAULT 'new',
    last_service DATE DEFAULT CURRENT_DATE,
    purchase_date DATE,
    warranty_date DATE,
    processor TEXT,
    ram TEXT,
    storage TEXT,
    accessories TEXT,
    plate_number TEXT,
    engine_number TEXT,
    chassis_number TEXT,
    fuel_type TEXT,
    capacity TEXT,
    year_manufactured TEXT,
    logistics_type TEXT,
    quantity INTEGER DEFAULT 1,
    remaining_quantity INTEGER DEFAULT 1,
    batch_number TEXT,
    brand_make TEXT,
    material TEXT,
    dimensions TEXT,
    load_capacity TEXT,
    features TEXT,
    type TEXT,
    color TEXT,
    design TEXT,
    volume_capacity TEXT,
    finish TEXT,
    serial_id TEXT,
    notes TEXT,
    office_type TEXT,
    specs TEXT,
    use TEXT,
    office_quantity TEXT,
    office_serial_id TEXT,
    office_condition TEXT,
    office_status TEXT,
    office_features TEXT,
    office_type_field TEXT,
    office_size TEXT,
    office_capacity TEXT,
    office_ports TEXT,
    office_lock TEXT,
    office_tier TEXT,
    office_material TEXT,
    office_cut_type TEXT,
    office_notes TEXT,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Create policies requiring authentication
-- Equipment table policies
CREATE POLICY "Equipment Select Authenticated" ON equipment
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Equipment Insert Authenticated" ON equipment
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Equipment Update Authenticated" ON equipment
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Equipment Delete Admin" ON equipment
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    (auth.email() LIKE '%@admin.com' OR auth.email() = 'admin@example.com')
  );

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    field_changes JSONB,
    changed_by TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

-- Enable RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies requiring authentication for audit_logs
CREATE POLICY "Audit Logs Select Authenticated" ON audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Audit Logs Insert Authenticated" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Audit Logs Delete Admin" ON audit_logs
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    (auth.email() LIKE '%@admin.com' OR auth.email() = 'admin@example.com')
  );

-- Create deleted_assets table to track deletion history
CREATE TABLE IF NOT EXISTS deleted_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_equipment_id UUID NOT NULL,
    model TEXT NOT NULL,
    brand TEXT,
    equipment_type TEXT NOT NULL,
    asset_tag TEXT,
    serial TEXT,
    location TEXT,
    status TEXT,
    condition TEXT,
    deleted_by TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

-- Enable RLS for deleted_assets
ALTER TABLE deleted_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for deleted_assets
CREATE POLICY "Deleted Assets Select Authenticated" ON deleted_assets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Deleted Assets Insert Authenticated" ON deleted_assets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create trigger function to log deleted assets
CREATE OR REPLACE FUNCTION log_deleted_asset()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO deleted_assets (
        original_equipment_id,
        model,
        brand,
        equipment_type,
        asset_tag,
        serial,
        location,
        status,
        condition,
        deleted_by,
        deleted_at,
        reason
    )
    VALUES (
        OLD.id,
        OLD.model,
        OLD.brand,
        OLD.equipment_type,
        OLD.asset_tag,
        OLD.serial,
        OLD.location,
        OLD.status,
        OLD.condition,
        auth.email(),
        NOW(),
        NULL
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- IMPORTANT: Run the following SQL commands in your Supabase SQL Editor to remove duplicate audit log triggers:
-- DROP TRIGGER IF EXISTS on_equipment_update ON equipment;
-- DROP TRIGGER IF EXISTS on_equipment_insert ON equipment;

-- To remove existing duplicate audit logs, run this query:
-- DELETE FROM audit_logs a1
-- WHERE id NOT IN (
--   SELECT DISTINCT ON (equipment_id, action, changed_at) id
--   FROM audit_logs a2
--   WHERE a1.equipment_id = a2.equipment_id
--     AND a1.action = a2.action
--     AND a1.changed_at >= a2.changed_at - INTERVAL '5 seconds'
--   ORDER BY equipment_id, action, changed_at, id
-- );

-- Create trigger to automatically log deleted assets
DROP TRIGGER IF EXISTS on_equipment_delete FROM equipment;
DROP TRIGGER IF EXISTS on_equipment_update FROM equipment;
DROP TRIGGER IF EXISTS on_equipment_insert FROM equipment;
CREATE TRIGGER on_equipment_delete
    BEFORE DELETE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION log_deleted_asset();

-- Migration script to update existing data for new batch tracking system
-- Run this in Supabase SQL Editor after updating the schema

-- Add new columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'equipment' AND column_name = 'batch_number'
    ) THEN
        ALTER TABLE equipment ADD COLUMN batch_number TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'equipment' AND column_name = 'remaining_quantity'
    ) THEN
        ALTER TABLE equipment ADD COLUMN remaining_quantity INTEGER DEFAULT 1;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'equipment' AND column_name = 'date_added'
    ) THEN
        ALTER TABLE equipment ADD COLUMN date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Convert quantity from TEXT to INTEGER and update remaining_quantity
UPDATE equipment
SET
    quantity = CASE WHEN quantity ~ '^[0-9]+$' THEN CAST(quantity AS INTEGER) ELSE 1 END,
    remaining_quantity = CASE WHEN quantity ~ '^[0-9]+$' THEN CAST(quantity AS INTEGER) ELSE 1 END
WHERE quantity IS NOT NULL;

-- Set remaining_quantity to 0 for items that are already released/in_use
UPDATE equipment
SET remaining_quantity = 0
WHERE status IN ('in_use', 'released') AND idle_release = 'release';

-- Generate batch numbers for existing records that don't have one
WITH numbered_rows AS (
    SELECT id, 'BATCH-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0') as new_batch_number
    FROM equipment
    WHERE batch_number IS NULL
)
UPDATE equipment e
SET batch_number = nr.new_batch_number
FROM numbered_rows nr
WHERE e.id = nr.id;

-- Set date_added for existing records
UPDATE equipment
SET date_added = created_at
WHERE date_added IS NULL;

-- Set quantity and remaining_quantity for existing records
-- For existing records, set quantity to 1 (each record represents one item)
UPDATE equipment
SET quantity = 1
WHERE quantity IS NULL;

-- Set remaining_quantity based on status
-- If status is 'available' or NULL, set remaining_quantity to 1
-- If status is 'in_use' or similar, set remaining_quantity to 0
UPDATE equipment
SET remaining_quantity = CASE
  WHEN status = 'in_use' OR status = 'maintenance' OR status = 'retired' THEN 0
  ELSE 1
END
WHERE remaining_quantity IS NULL;

