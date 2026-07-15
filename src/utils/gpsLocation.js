/**
 * Get full location information including GPS coordinates
 * @returns {Promise<Object>} Location data with coordinates
 */
export const getFullLocation = async () => {
  try {
    if (!navigator.geolocation) {
      return {
        success: false,
        error: 'Geolocation not supported',
        location: 'Unknown',
      };
    }

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true,
      });
    });

    return {
      success: true,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      location: 'Unknown',
    };
  }
};

/**
 * Get address from coordinates using reverse geocoding
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} Formatted address
 */
export const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    return 'Unknown location';
  }
};
