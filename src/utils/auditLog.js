 import { supabase } from '../lib/supabase';

/**
 * Log an audit entry for equipment changes
 * @param {Object} params - Audit parameters
 * @param {string} params.equipmentId - Equipment ID
 * @param {string} params.action - CREATE, UPDATE, DELETE, or STATUS_CHANGE
 * @param {Object} params.oldValues - Previous values (for updates/deletes)
 * @param {Object} params.newValues - New values (for creates/updates)
 * @param {string} params.changedBy - Username or identifier
 * @param {string} params.reason - Reason for the change (optional)
 * @returns {Promise<Object>} - Inserted audit log
 */
export const logAudit = async ({
  equipmentId,
  checkForDuplicates = true,
  action,
  oldValues = null,
  newValues = null,
  changedBy = 'system',
  reason = null
}) => {
  try {
    // Check for duplicate audit logs within the last 5 seconds to prevent duplicates
    if (checkForDuplicates && (action === 'UPDATE' || action === 'CREATE')) {
      const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
      const { data: existingLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('equipment_id', equipmentId)
        .eq('action', action)
        .gte('changed_at', fiveSecondsAgo)
        .limit(1);

      if (existingLogs && existingLogs.length > 0) {
        console.log('Duplicate audit log detected, skipping:', existingLogs[0].id);
        return existingLogs[0];
      }
    }

    // Calculate field changes for updates
    let fieldChanges = null;
    if (action === 'UPDATE' && oldValues && newValues) {
      fieldChanges = {};
      const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
      
      for (const key of allKeys) {
        const oldVal = oldValues[key];
        const newVal = newValues[key];
        
        // Skip internal fields
        if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
        
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          fieldChanges[key] = {
            old: oldVal,
            new: newVal
          };
        }
      }
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        equipment_id: equipmentId,
        action,
        old_values: oldValues,
        new_values: newValues,
        field_changes: fieldChanges,
        changed_by: changedBy,
        changed_at: new Date().toISOString(),
        reason
      }])
      .select();

    if (error) {
      console.error('Audit log error:', error);
      return null;
    }

    return data?.[0];
  } catch (err) {
    console.error('Failed to log audit:', err);
    return null;
  }
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
      console.error('Failed to fetch equipment history:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching equipment history:', err);
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
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching audit logs:', err);
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
    year: 'numeric'
  });
  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
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
    reason: log.reason
  };
};

// Helper functions
const formatFieldName = (field) => {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (value) => {
  if (value === null || value === undefined) return 'empty';
  if (value === '') return 'empty';
  return String(value);
};
