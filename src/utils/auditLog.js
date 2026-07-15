import { supabase } from '../lib/supabase';

/**
 * Equipment changes are now logged server-side by the `equipment_audit_trigger`
 * in the database. This function is kept as a no-op for backwards compatibility
 * with existing callers.
 */
export const logAudit = async () => {
  return null;
};

/**
 * Get audit history for a specific equipment
 * @param {string} equipmentId - Equipment ID
 * @param {number} limit - Maximum records to fetch
 * @returns {Promise<Array>} - Array of audit logs
 */
export const getEquipmentHistory = async (equipmentId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data || [];
  } catch (err) {
    return [];
  }
};

/**
 * Get all recent audit logs
 * @param {number} limit - Maximum records to fetch
 * @returns {Promise<Array>} - Array of audit logs
 */
export const getRecentAuditLogs = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, equipment:equipment_id(model, asset_tag, serial)')
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data || [];
  } catch (err) {
    return [];
  }
};

/**
 * Format audit log for display
 * @param {Object} log - Audit log entry
 * @returns {Object} - Formatted log data
 */
export const formatAuditLog = (log) => {
  const timestamp = new Date(log.changed_at);
  const formattedDate = timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  let description = '';
  let icon = 'edit';
  let color = 'blue';

  switch (log.action) {
    case 'CREATE':
      description = 'Equipment created';
      icon = 'plus';
      color = 'green';
      break;
    case 'DELETE':
      description = 'Equipment deleted';
      icon = 'trash';
      color = 'red';
      break;
    case 'UPDATE':
      if (log.field_changes) {
        const changedFields = Object.keys(log.field_changes);
        if (changedFields.length === 1) {
          const field = changedFields[0];
          const change = log.field_changes[field];
          description = `${formatFieldName(field)} changed from "${formatValue(change.old)}" to "${formatValue(change.new)}"`;
        } else {
          description = `${changedFields.length} fields updated: ${changedFields.map(formatFieldName).join(', ')}`;
        }
      } else {
        description = 'Equipment updated';
      }
      icon = 'edit';
      color = 'blue';
      break;
    case 'STATUS_CHANGE':
      description = `Status changed to "${log.new_values?.status || 'Unknown'}"`;
      icon = 'refresh';
      color = 'orange';
      break;
    default:
      description = 'Unknown action';
  }

  return {
    ...log,
    formattedDate,
    formattedTime,
    description,
    icon,
    color,
    reason: log.reason,
  };
};

// Helper functions
const formatFieldName = (field) => {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (value) => {
  if (value === null || value === undefined) return 'empty';
  if (value === '') return 'empty';
  return String(value);
};
