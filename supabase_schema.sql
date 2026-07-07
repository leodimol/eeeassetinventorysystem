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
    quantity TEXT,
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

-- Create trigger to automatically log deleted assets
DROP TRIGGER IF EXISTS on_equipment_delete ON equipment;
CREATE TRIGGER on_equipment_delete
    BEFORE DELETE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION log_deleted_asset();

