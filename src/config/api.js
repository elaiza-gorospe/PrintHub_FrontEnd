/**
 * Centralized API configuration
 * Uses environment variables for flexible deployment across dev, staging, and production
 * Falls back to localhost:3000 for local development if not configured
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

/**
 * Build a complete API endpoint URL
 * @param {string} endpoint - API endpoint (e.g., '/api/products', '/api/admin/users')
 * @returns {string} Full API URL
 */
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Standard fetch wrapper with consistent error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} Response JSON or error
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export default {
  API_BASE_URL,
  buildApiUrl,
  apiCall,
};
