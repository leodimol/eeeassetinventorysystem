-- Security hardening migration
-- Applies the following changes to an existing database:
-- 1. Makes added_by nullable so the frontend default does not break inserts.
-- 2. Replaces legacy auth.role()/auth.email() RLS checks with auth.jwt()->>role.
-- 3. Adds an is_admin() helper backed by app_metadata/user_metadata role claim.
-- 4. Adds a server-side audit trigger so the client no longer needs to write audit_logs.
-- 5. Removes legacy permissive audit_logs/deleted_assets insert policies.

-- Fix added_by nullability to avoid insert failures when the client sends null
ALTER TABLE equipment ALTER COLUMN added_by DROP NOT NULL;
ALTER TABLE equipment ALTER COLUMN added_by SET DEFAULT 'system';

-- Helper function to determine if the current user is an admin.
-- Configure an admin by setting app_metadata.role = 'admin' via a secure
-- Supabase Edge Function or the service role key.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role'
  ) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get the current user's identifier for audit records
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(auth.email()::TEXT, auth.uid()::TEXT, 'system');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace legacy equipment RLS policies
DROP POLICY IF EXISTS "Equipment Select Authenticated" ON equipment;
DROP POLICY IF EXISTS "Equipment Insert Authenticated" ON equipment;
DROP POLICY IF EXISTS "Equipment Update Authenticated" ON equipment;
DROP POLICY IF EXISTS "Equipment Delete Admin" ON equipment;

CREATE POLICY "Equipment Select Authenticated" ON equipment
  FOR SELECT USING ((auth.jwt() ->> 'role') = 'authenticated');

CREATE POLICY "Equipment Insert Authenticated" ON equipment
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'role') = 'authenticated');

CREATE POLICY "Equipment Update Authenticated" ON equipment
  FOR UPDATE USING ((auth.jwt() ->> 'role') = 'authenticated');

CREATE POLICY "Equipment Delete Admin" ON equipment
  FOR DELETE USING (
    (auth.jwt() ->> 'role') = 'authenticated' AND is_admin()
  );

-- Replace legacy audit_logs RLS policies: read-only from client
DROP POLICY IF EXISTS "Audit Logs Select Authenticated" ON audit_logs;
DROP POLICY IF EXISTS "Audit Logs Insert Authenticated" ON audit_logs;
DROP POLICY IF EXISTS "Audit Logs Delete Admin" ON audit_logs;

CREATE POLICY "Audit Logs Select Authenticated" ON audit_logs
  FOR SELECT USING ((auth.jwt() ->> 'role') = 'authenticated');

CREATE POLICY "Audit Logs Delete Admin" ON audit_logs
  FOR DELETE USING (
    (auth.jwt() ->> 'role') = 'authenticated' AND is_admin()
  );

-- Replace legacy deleted_assets RLS policies: read-only from client
DROP POLICY IF EXISTS "Deleted Assets Select Authenticated" ON deleted_assets;
DROP POLICY IF EXISTS "Deleted Assets Insert Authenticated" ON deleted_assets;

CREATE POLICY "Deleted Assets Select Authenticated" ON deleted_assets
  FOR SELECT USING ((auth.jwt() ->> 'role') = 'authenticated');

-- Update the deleted_assets trigger to use the secure current_user_id()
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
        current_user_id(),
        NOW(),
        NULL
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a comprehensive server-side audit trigger
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
    INSERT INTO audit_logs (equipment_id, action, old_values, new_values, field_changes, changed_by)
    VALUES (OLD.id, 'DELETE', old_data, null, null, current_user_id());
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    INSERT INTO audit_logs (equipment_id, action, old_values, new_values, field_changes, changed_by)
    VALUES (NEW.id, 'CREATE', null, new_data, null, current_user_id());
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

    INSERT INTO audit_logs (equipment_id, action, old_values, new_values, field_changes, changed_by)
    VALUES (NEW.id, 'UPDATE', old_data, new_data, changes, current_user_id());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up legacy triggers and apply the new one
DROP TRIGGER IF EXISTS on_equipment_delete ON equipment;
DROP TRIGGER IF EXISTS on_equipment_update ON equipment;
DROP TRIGGER IF EXISTS on_equipment_insert ON equipment;
DROP TRIGGER IF EXISTS equipment_audit_trigger ON equipment;

CREATE TRIGGER on_equipment_delete
    BEFORE DELETE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION log_deleted_asset();

CREATE TRIGGER equipment_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION log_equipment_change();
