/**
 * Validate asset data based on asset type
 * @param {Object} asset - Asset data to validate
 * @param {string} type - Asset type
 * @returns {Object} Validation result with isValid and errors
 */
export const validateAssetByType = (asset, type) => {
  const errors = [];

  // Common required fields for all asset types
  const requiredFields = ['brand', 'model', 'asset_tag', 'serial'];

  requiredFields.forEach((field) => {
    if (!asset[field] || asset[field].trim() === '') {
      errors.push(`${field.replace('_', ' ')} is required`);
    }
  });

  // Type-specific validations
  switch (type) {
    case 'laptop':
    case 'computer':
      if (!asset.specs || !asset.specs.processor) {
        errors.push('Processor is required for computers/laptops');
      }
      if (!asset.specs || !asset.specs.ram) {
        errors.push('RAM is required for computers/laptops');
      }
      break;

    case 'monitor':
      if (!asset.specs || !asset.specs.screen_size) {
        errors.push('Screen size is required for monitors');
      }
      break;

    case 'printer':
      if (!asset.specs || !asset.specs.printer_type) {
        errors.push('Printer type is required for printers');
      }
      break;

    default:
      // No type-specific validations
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate asset tag format
 * @param {string} assetTag - Asset tag to validate
 * @returns {Object} Validation result with isValid and error
 */
export const validateAssetTag = (assetTag) => {
  if (!assetTag || assetTag.trim() === '') {
    return {
      isValid: false,
      error: 'Asset tag is required',
    };
  }

  // Check for common formats (e.g., AST-XXX-XXX, EQ-XXXX)
  const validFormats = [
    /^[A-Z]{2,4}-\d{3}-\d{3}$/, // AST-001-001
    /^[A-Z]{2,4}-\d{4,6}$/, // EQ-12345
    /^[A-Z]{3}-\d{4}-[A-Z]{2}$/, // LPT-1234-IT
  ];

  const isValidFormat = validFormats.some((regex) => regex.test(assetTag.toUpperCase()));

  if (!isValidFormat) {
    return {
      isValid: false,
      error: 'Invalid asset tag format. Expected format: AST-XXX-XXX or EQ-XXXX',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate location selection
 * @param {string} locationId - Location ID to validate
 * @param {Array} availableLocations - Array of available locations
 * @returns {Object} Validation result with isValid and error
 */
export const validateLocationSelection = (locationId, availableLocations) => {
  if (!locationId || locationId.trim() === '') {
    return {
      isValid: false,
      error: 'Location is required',
    };
  }

  const locationExists = availableLocations.some((loc) => loc.id === locationId);

  if (!locationExists) {
    return {
      isValid: false,
      error: 'Invalid location selected',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate serial number format
 * @param {string} serial - Serial number to validate
 * @returns {Object} Validation result with isValid and error
 */
export const validateSerialNumber = (serial) => {
  if (!serial || serial.trim() === '') {
    return {
      isValid: false,
      error: 'Serial number is required',
    };
  }

  // Serial numbers should be alphanumeric with possible hyphens
  const isValidFormat = /^[A-Za-z0-9-]+$/.test(serial);

  if (!isValidFormat) {
    return {
      isValid: false,
      error: 'Serial number should only contain letters, numbers, and hyphens',
    };
  }

  if (serial.length < 5) {
    return {
      isValid: false,
      error: 'Serial number is too short (minimum 5 characters)',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate condition value
 * @param {string} condition - Condition to validate
 * @returns {Object} Validation result with isValid and error
 */
export const validateCondition = (condition) => {
  const validConditions = ['new', 'good', 'fair', 'poor'];

  if (!condition || !validConditions.includes(condition.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid condition. Must be one of: ${validConditions.join(', ')}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate status value
 * @param {string} status - Status to validate
 * @returns {Object} Validation result with isValid and error
 */
export const validateStatus = (status) => {
  const validStatuses = ['available', 'active', 'maintenance', 'retired'];

  if (!status || !validStatuses.includes(status.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
