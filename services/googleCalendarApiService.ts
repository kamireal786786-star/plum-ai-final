import { loadGapiService } from './googleApiService';

// This service now exclusively uses the Google API Client (gapi) for all interactions,
// aligning it with the gmail service and improving reliability.
declare const gapi: any;

interface BusySlot {
    start: string;
    end: string;
}

export const getFreeBusy = async (accessToken: string, timeMin: string, timeMax: string): Promise<BusySlot[]> => {
    try {
        await loadGapiService('calendar', 'v3');
        gapi.client.setToken({ access_token: accessToken });

        const response = await gapi.client.calendar.freebusy.query({
            resource: {
                timeMin,
                timeMax,
                items: [{ id: 'primary' }]
            }
        });
        
        if (response.status < 200 || response.status >= 300) {
            console.error("Google Calendar API Error (getFreeBusy):", response.result.error);
            throw new Error(`Failed to fetch free/busy data. Status: ${response.status}`);
        }
        
        return response.result.calendars?.primary?.busy || [];

    } catch (error: any) {
        console.error("Error in getFreeBusy via GAPI:", error);
        const errorMessage = error?.result?.error?.message || error.message || 'Failed to fetch free/busy data from Google Calendar';
        throw new Error(errorMessage);
    }
};

export const createEvent = async (accessToken: string, eventDetails: any): Promise<void> => {
    try {
        await loadGapiService('calendar', 'v3');
        gapi.client.setToken({ access_token: accessToken });

        const response = await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': eventDetails,
            'sendUpdates': 'all'
        });

        if (response.status < 200 || response.status >= 300) {
             console.error("Google Calendar API Error (createEvent):", response.result.error);
             throw new Error(`Failed to create event in Google Calendar. Status: ${response.status}`);
        }

        console.log("Event created successfully in Google Calendar via GAPI.");
    } catch (error: any) {
        console.error("Error in createEvent via GAPI:", error);
        const errorMessage = error?.result?.error?.message || error.message || 'Failed to create event in Google Calendar';
        throw new Error(errorMessage);
    }
};

/**
 * Lists upcoming events from the primary Google Calendar.
 * @param accessToken The user's OAuth 2.0 access token.
 * @param timeMin The start time to search from (ISO string).
 * @param q An optional search query to filter events.
 * @returns An array of event objects.
 */
export const listEvents = async (accessToken: string, timeMin: string, q?: string): Promise<any[]> => {
    try {
        await loadGapiService('calendar', 'v3');
        gapi.client.setToken({ access_token: accessToken });

        const response = await gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': timeMin,
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime',
            'q': q, // Search query
        });

        if (response.status < 200 || response.status >= 300) {
            console.error("Google Calendar API Error (listEvents):", response.result.error);
            throw new Error(`Failed to list events from Google Calendar. Status: ${response.status}`);
        }
        
        return response.result.items || [];

    } catch (error: any) {
        console.error("Error in listEvents via GAPI:", error);
        const errorMessage = error?.result?.error?.message || error.message || 'Failed to list events from Google Calendar';
        throw new Error(errorMessage);
    }
};