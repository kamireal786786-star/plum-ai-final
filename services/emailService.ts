import * as authManager from './authManager';
import * as googleGmailApiService from './googleGmailApiService';

export interface MeetingConfirmationDetails {
    name: string;
    email: string;
    date: string;
    time: string;
    adminEmail: string;
    meetingDuration: number;
}

/**
 * Sends confirmation emails using the Gmail API via the connected admin account.
 * @param details - The details of the scheduled meeting.
 */
export const sendMeetingConfirmationEmails = async (details: MeetingConfirmationDetails): Promise<void> => {
    console.log("[Email Service] Preparing to send confirmation emails via Gmail API...");
    const token = authManager.getToken();
    if (!token) {
        throw new Error("Cannot send email. Admin is not authenticated.");
    }

    const { name, email, date, time, adminEmail, meetingDuration } = details;

    // 1. Send confirmation email to the client
    const clientSubject = `Confirmation: Your Meeting with Plum AI on ${date}`;
    const clientBody = `
Hi ${name},

This is to confirm your ${meetingDuration}-minute meeting with a Plum AI specialist.

Meeting Details:
- Date: ${date}
- Time: ${time}

We look forward to speaking with you. A Google Calendar invitation has also been sent to your email address.

Best regards,
The Plum AI Team
`;

    try {
        await googleGmailApiService.sendEmail(token, email, adminEmail, clientSubject, clientBody);
        console.log(`[Email Service] Successfully sent confirmation to client: ${email}`);
    } catch (error) {
        console.error(`[Email Service] Failed to send email to client:`, error);
        // Decide if we should continue or throw. For now, we'll try to notify the admin anyway.
    }

    // 2. Send notification email to the admin
    const adminSubject = `New Meeting Scheduled with ${name}`;
    const adminBody = `
A new meeting has been scheduled via the PlumBot Assistant.

Client Details:
- Name: ${name}
- Email: ${email}

Meeting Details:
- Date: ${date}
- Time: ${time}
- Duration: ${meetingDuration} minutes

This event has been automatically added to your primary Google Calendar.
`;

    try {
        await googleGmailApiService.sendEmail(token, adminEmail, adminEmail, adminSubject, adminBody);
        console.log(`[Email Service] Successfully sent notification to admin: ${adminEmail}`);
    } catch (error) {
        console.error(`[Email Service] Failed to send email to admin:`, error);
        // Throw an error here as the admin needs to know about the booking
        throw new Error("Failed to send internal admin notification email.");
    }
};