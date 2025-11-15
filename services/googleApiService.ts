import * as configService from './configService';

declare const gapi: any;

let gapiInitialized = false;

/**
 * Resets the GAPI initialization flag.
 * This is necessary if the API key changes, so the client will re-initialize with the new key.
 */
export const resetGapiInitialization = () => {
    gapiInitialized = false;
    console.log("GAPI initialization status has been reset.");
};

/**
 * Initializes the Google API client (gapi) with the API key from config.
 * This function ensures the client is initialized only once.
 * @returns A promise that resolves when the client is initialized.
 */
export const initializeGapiClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gapiInitialized) {
      return resolve();
    }

    const config = configService.getGoogleConfig();
    if (!config || !config.apiKey) {
      const errorMsg = "Google API Key not configured. Please set it on the Admin page.";
      console.error(errorMsg);
      return reject(new Error(errorMsg));
    }

    gapi.load('client', () => {
      gapi.client.init({ apiKey: config.apiKey })
        .then(() => {
          console.log("GAPI client initialized successfully.");
          gapiInitialized = true;
          resolve();
        })
        .catch((err: any) => {
          console.error("Error initializing GAPI client:", err);
          reject(err);
        });
    });
  });
};

/**
 * Loads a specific Google API service (e.g., 'gmail', 'v1').
 * It ensures the main GAPI client is initialized before loading the service.
 * @param name The name of the API to load (e.g., 'gmail').
 * @param version The version of the API (e.g., 'v1').
 * @returns A promise that resolves when the service is loaded.
 */
export const loadGapiService = async (name: string, version: string): Promise<void> => {
    await initializeGapiClient();
    return new Promise((resolve, reject) => {
        gapi.client.load(name, version)
            .then(() => {
                console.log(`GAPI service loaded: ${name} ${version}`);
                resolve();
            })
            .catch((err: any) => {
                console.error(`Error loading GAPI service ${name}:`, err);
                if (err?.result?.error?.code === 403) {
                    const apiName = name === 'gmail' ? 'Gmail API' : 'Google Calendar API';
                    const helpfulMessage = `Failed to load Google service '${name}'. This is likely a configuration issue in your Google Cloud project. Please check the following:
1.  Ensure the '${apiName}' is enabled for your project.
2.  Verify that your API Key is valid and does not have restrictions that would block this request (e.g., incorrect HTTP referrer restrictions).

You can manage your APIs here: https://console.cloud.google.com/apis/library`;
                    reject(new Error(helpfulMessage));
                } else {
                    reject(err);
                }
            });
    });
}