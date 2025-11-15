
const GOOGLE_CONFIG_KEY = 'plum_ai_google_config';

export interface GoogleConfig {
  clientId: string;
  apiKey: string;
}

/**
 * Saves the Google API configuration to localStorage.
 * @param config The GoogleConfig object containing clientId and apiKey.
 */
export const saveGoogleConfig = (config: GoogleConfig) => {
  try {
    localStorage.setItem(GOOGLE_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save Google config to localStorage", error);
  }
};

/**
 * Retrieves the Google API configuration from localStorage.
 * @returns The stored GoogleConfig object or null if not found.
 */
export const getGoogleConfig = (): GoogleConfig | null => {
  try {
    const stored = localStorage.getItem(GOOGLE_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to parse Google config from localStorage", error);
    return null;
  }
};

/**
 * Removes the Google API configuration from localStorage.
 */
export const clearGoogleConfig = () => {
  try {
    localStorage.removeItem(GOOGLE_CONFIG_KEY);
  } catch (error) {
    console.error("Failed to clear Google config from localStorage", error);
  }
};
