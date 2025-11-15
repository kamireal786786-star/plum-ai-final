
import { loadGapiService } from './googleApiService';

// This service interacts with the Google Gmail API using the `gapi` client loaded from the script in index.html

declare const gapi: any;

const loadGmailApi = async (): Promise<void> => {
    // This will initialize the gapi client with the API Key if it hasn't been already,
    // and then load the gmail service.
    await loadGapiService('gmail', 'v1');
};


/**
 * Constructs a MIME-compliant, base64url-encoded email body.
 * @param to Recipient's email address.
 * @param from Sender's email address.
 * @param subject The email subject.
 * @param message The plain text body of the email.
 * @returns A base64url-encoded string representing the raw email.
 */
const createEmailBody = (to: string, from: string, subject: string, message: string): string => {
    const email = [
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        `Content-Transfer-Encoding: 7bit`,
        `to: ${to}`,
        `from: ${from}`,
        `subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`, // UTF-8 encoding for subject
        ``,
        message
    ].join('\n');
    
    // Base64 encoding, then make it URL-safe for the Gmail API
    return btoa(unescape(encodeURIComponent(email))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Sends an email using the Gmail API on behalf of the authenticated user.
 * @param accessToken The user's OAuth 2.0 access token.
 * @param to Recipient's email address.
 * @param from Sender's email address (must match authenticated user).
 * @param subject The email subject.
 * @param message The plain text body of the email.
 */
export const sendEmail = async (accessToken: string, to: string, from: string, subject: string, message: string): Promise<void> => {
    try {
        await loadGmailApi();
        
        // Set the access token for the gapi client for this request
        gapi.client.setToken({ access_token: accessToken });

        const rawEmail = createEmailBody(to, from, subject, message);

        const response = await gapi.client.gmail.users.messages.send({
            'userId': 'me',
            'resource': {
                'raw': rawEmail
            }
        });

        if (response.status < 200 || response.status >= 300) {
            console.error('Gmail API Error Response:', response);
            throw new Error(`Failed to send email. Status: ${response.status}`);
        }
        console.log("Successfully sent email via Gmail API:", response.result);
    } catch (error) {
        console.error("Error in sendEmail:", error);
        // Re-throw the error to be handled by the calling function
        throw error;
    }
};
