import { supabase } from '../lib/supabase';

/**
 * Check for duplicate equipment by serial number or asset tag
 * @param {Object} params - Check parameters
 * @param {string} params.serial - Serial number to check
 * @param {string} params.assetTag - Asset tag to check
 * @param {string} params.excludeId - Equipment ID to exclude (for edit operations)
 * @returns {Promise<Object>} - Duplicate check result
 */
export const checkDuplicates = async ({ serial, assetTag, excludeId = null }) => {
  const result = {
    hasDuplicates: false,
    duplicates: [],
    messages: [],
  };

  try {
    // Check serial number (exact match, only if provided)
    if (serial && serial.trim()) {
      let query = supabase
        .from('equipment')
        .select('id, model, asset_tag, serial, status')
        .eq('serial', serial.trim());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data: serialDups, error: serialError } = await query;

      if (serialError) {
        // Serial duplicate query failed; let server-side validation catch it
      } else if (serialDups && serialDups.length > 0) {
        result.hasDuplicates = true;
        result.duplicates.push(...serialDups);
        result.messages.push(`Serial number "${serial}" already exists`);
      }
    }

    // Check asset tag (exact match)
    if (assetTag && assetTag.trim()) {
      let query = supabase
        .from('equipment')
        .select('id, model, asset_tag, serial, status')
        .eq('asset_tag', assetTag.trim());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data: assetDups, error: assetError } = await query;

      if (assetError) {
        // Asset tag duplicate query failed; let server-side validation catch it
      } else if (assetDups && assetDups.length > 0) {
        // Avoid adding same equipment twice if both serial and asset tag match
        const newDups = assetDups.filter(
          (dup) => !result.duplicates.some((existing) => existing.id === dup.id)
        );

        if (newDups.length > 0) {
          result.hasDuplicates = true;
          result.duplicates.push(...newDups);
          result.messages.push(`Asset tag "${assetTag}" already exists`);
        }
      }
    }

    return result;
  } catch (err) {
    return { hasDuplicates: false, duplicates: [], messages: [], error: err.message };
  }
};

/**
 * Real-time duplicate check with debouncing
 * @param {Object} params - Check parameters
 * @param {string} params.serial - Serial number
 * @param {string} params.assetTag - Asset tag
 * @param {string} params.excludeId - ID to exclude
 * @param {Function} callback - Callback with results
 */
let debounceTimer = null;

export const debouncedDuplicateCheck = (params, callback, delay = 500) => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    const result = await checkDuplicates(params);
    callback(result);
  }, delay);
};

/**
 * Format duplicate warning message
 * @param {Array} duplicates - Array of duplicate equipment
 * @returns {string} - Formatted warning message
 */
export const formatDuplicateWarning = (duplicates) => {
  if (!duplicates || duplicates.length === 0) return '';

  const items = duplicates.map((dup) => {
    const parts = [];
    if (dup.model) parts.push(dup.model);
    if (dup.asset_tag) parts.push(`Tag: ${dup.asset_tag}`);
    if (dup.serial) parts.push(`SN: ${dup.serial}`);
    if (dup.status) parts.push(`(${dup.status})`);
    return parts.join(' - ');
  });

  return `Duplicate found:\n${items.join('\n')}`;
};
