-- Create audit_logs table for tracking all equipment changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE')),
  changed_by VARCHAR(255) NOT NULL DEFAULT 'system',
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  old_values JSONB,
  new_values JSONB,
  field_changes JSONB,
  ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_equipment_id ON audit_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs are read-only from the client; writes happen via database triggers
DROP POLICY IF EXISTS "Allow all operations on audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Audit Logs Select Authenticated" ON audit_logs;
DROP POLICY IF EXISTS "Audit Logs Delete Admin" ON audit_logs;

CREATE POLICY "Audit Logs Select Authenticated" ON audit_logs
  FOR SELECT USING ((auth.jwt() ->> 'role') = 'authenticated');

CREATE POLICY "Audit Logs Delete Admin" ON audit_logs
  FOR DELETE USING (
    (auth.jwt() ->> 'role') = 'authenticated' AND
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Create function to automatically log equipment changes
CREATE OR REPLACE FUNCTION log_equipment_change()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changes JSONB := '{}';
  key TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    INSERT INTO audit_logs (equipment_id, action, old_values, new_values, field_changes)
    VALUES (OLD.id, 'DELETE', old_data, null, null);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    INSERT INTO audit_logs (equipment_id, action, old_values, new_values, field_changes)
    VALUES (NEW.id, 'CREATE', null, new_data, null);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);

    FOR key IN SELECT jsonb_object_keys(new_data)
    LOOP
      IF old_data->key IS DISTINCT FROM new_data->key THEN
        changes := changes || jsonb_build_object(
          key,
          jsonb_build_object(
            'old', old_data->key,
            'new', new_data->key
          )
        );
      END IF;
    END LOOP;

    INSERT INTO audit_logs (equipment_id, action, old_values, new_values, field_changes)
    VALUES (NEW.id, 'UPDATE', old_data, new_data, changes);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic logging
DROP TRIGGER IF EXISTS equipment_audit_trigger ON equipment;
CREATE TRIGGER equipment_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION log_equipment_change();
