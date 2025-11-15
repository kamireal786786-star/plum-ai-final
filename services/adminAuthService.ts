const ADMIN_CREDS_KEY = 'plum_ai_admin_creds';

interface AdminCredentials {
  username: string;
  password?: string; // Keep password optional for backward compatibility if needed, but we'll always set it.
}

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'password123';

/**
 * Retrieves the admin credentials from localStorage.
 * If not found, it initializes with default credentials.
 * @returns The stored AdminCredentials object.
 */
export const getAdminCredentials = (): Required<AdminCredentials> => {
  try {
    const stored = localStorage.getItem(ADMIN_CREDS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure both username and password exist, fall back to defaults if not
      return {
        username: parsed.username || DEFAULT_USERNAME,
        password: parsed.password || DEFAULT_PASSWORD,
      };
    }
  } catch (error) {
    console.error("Failed to parse admin credentials from localStorage", error);
  }
  // If no stored credentials, set and return the defaults
  const defaultCreds = { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
  saveAdminCredentials(defaultCreds.username, defaultCreds.password);
  return defaultCreds;
};

/**
 * Saves the admin credentials to localStorage.
 * @param username The new admin username.
 * @param password The new admin password.
 */
export const saveAdminCredentials = (username: string, password?: string) => {
  try {
    // To prevent recursion, read from localStorage directly instead of calling getAdminCredentials.
    let existingPassword = DEFAULT_PASSWORD;
    const stored = localStorage.getItem(ADMIN_CREDS_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if(parsed.password) {
                existingPassword = parsed.password;
            }
        } catch(e) {
            // Ignore parse errors, will fall back to default
        }
    }
    
    const newCreds: AdminCredentials = {
      username,
      // If a new password isn't provided, keep the existing one
      password: password || existingPassword,
    };
    localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(newCreds));
  } catch (error) {
    console.error("Failed to save admin credentials to localStorage", error);
  }
};
