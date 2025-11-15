import * as settingsService from './settingsService';
import * as googleCalendarApiService from './googleCalendarApiService';
import * as emailService from './emailService';
import * as authManager from './authManager';

const NOT_CONNECTED_ERROR = "Error: Google Calendar is not connected. Please go to the Admin page to connect your account.";

/**
 * Gets available meeting slots for a given date using Google Calendar and user-defined settings.
 * @param date The date in YYYY-MM-DD format.
 * @returns An array of available time slots in HH:MM format, or an error message.
 */
export const getAvailableSlots = async (date: string): Promise<string[] | string> => {
  console.log(`Checking available slots for: ${date}`);
  const token = authManager.getToken();
  if (!token) {
    return NOT_CONNECTED_ERROR;
  }

  try {
    const settings = settingsService.getCalendarSettings();
    
    // Use noon to avoid timezone issues with getDay()
    const dateObj = new Date(`${date}T12:00:00Z`);
    const dayIndex = dateObj.getUTCDay(); // 0 = Sunday, 1 = Monday...
    const daySchedule = settings.schedule[dayIndex];

    if (!daySchedule.enabled) {
      return []; // Not a working day
    }
    
    // Check for a full-day exclusion on this date
    const allDayExclusion = settings.exclusions.find(ex => ex.date === date && ex.allDay);
    if (allDayExclusion) {
      return []; // Day is fully blocked
    }

    const { start, end } = daySchedule;
    const { meetingDuration } = settings;

    const timeMin = new Date(`${date}T${start}:00`);
    const timeMax = new Date(`${date}T${end}:00`);

    // Get busy slots from Google Calendar
    const busySlotsFromGoogle = await googleCalendarApiService.getFreeBusy(token, timeMin.toISOString(), timeMax.toISOString());
    
    // Get time-based exclusions for this date from settings
    const timeExclusions = settings.exclusions
      .filter(ex => ex.date === date && !ex.allDay && ex.start && ex.end)
      .map(ex => ({
        start: new Date(`${date}T${ex.start}:00`).toISOString(),
        end: new Date(`${date}T${ex.end}:00`).toISOString(),
      }));
    
    const combinedBusySlots = [...busySlotsFromGoogle, ...timeExclusions];

    const availableSlots: string[] = [];
    let currentSlot = new Date(timeMin.getTime());

    while (currentSlot.getTime() < timeMax.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + meetingDuration * 60 * 1000);
      
      const isBusy = combinedBusySlots.some(busy =>
        (new Date(busy.start) < slotEnd) && (new Date(busy.end) > currentSlot)
      );

      if (!isBusy && slotEnd.getTime() <= timeMax.getTime()) {
        const hours = String(currentSlot.getHours()).padStart(2, '0');
        const minutes = String(currentSlot.getMinutes()).padStart(2, '0');
        availableSlots.push(`${hours}:${minutes}`);
      }
      
      currentSlot = new Date(currentSlot.getTime() + meetingDuration * 60 * 1000);
    }

    return availableSlots;

  } catch (error: any) {
    console.error("Error getting available slots:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching calendar slots.";
    return `Error: ${errorMessage}`;
  }
};


/**
 * Schedules a meeting using Google Calendar API.
 * @param date The date of the meeting in YYYY-MM-DD format.
 * @param time The time of the meeting in HH:MM format.
 * @param name The name of the client.
 * @param email The email of the client.
 * @returns A confirmation message string or an error message.
 */
export const scheduleMeeting = async (date: string, time: string, name:string, email: string): Promise<string> => {
    console.log(`Attempting to schedule meeting for ${name} at ${date} ${time} via Google Calendar`);
    const token = authManager.getToken();
    if (!token) {
        return NOT_CONNECTED_ERROR;
    }

    try {
        const adminProfile = authManager.getUserProfile();
        if (!adminProfile || !adminProfile.email) {
            return "Error: Admin user profile not found or email is missing. Please reconnect the Google Account on the Admin page.";
        }

        const settings = settingsService.getCalendarSettings();
        const meetingDuration = settings.meetingDuration;

        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + meetingDuration * 60000);

        const eventDetails = {
            summary: `Meeting with ${name}`,
            description: `Discovery call with ${name} (${email}) to discuss AI solutions. Scheduled via PlumBot.`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            attendees: [{ email: email }, { email: adminProfile.email }],
        };

        await googleCalendarApiService.createEvent(token, eventDetails);
        
        await emailService.sendMeetingConfirmationEmails({
            name,
            email,
            date,
            time,
            adminEmail: adminProfile.email,
            meetingDuration,
        });

        const confirmationMessage = `Success! A meeting has been scheduled for ${name} on ${date} at ${time}. A confirmation email has been sent to ${email}.`;
        console.log(confirmationMessage);
        return confirmationMessage;
    } catch (error: any) {
        console.error("Error scheduling meeting via Google Calendar:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not schedule the meeting. The time slot may have just been taken or there was a configuration error.";
        return `Error: ${errorMessage}`;
    }
};


export interface UpcomingMeeting {
    id: string;
    summary: string;
    start: string; // ISO string
    end: string;   // ISO string
    hangoutLink?: string;
    attendees: Array<{ email: string, responseStatus: string }>;
}

/**
 * Fetches upcoming meetings scheduled by the bot from the user's Google Calendar.
 * @returns A promise that resolves to an array of meetings or an error string.
 */
export const getUpcomingMeetings = async (): Promise<UpcomingMeeting[] | string> => {
  const token = authManager.getToken();
  if (!token) {
    return "Error: Google Account not connected.";
  }

  try {
    const now = new Date().toISOString();
    // Use a specific query to find meetings scheduled by the bot
    const events = await googleCalendarApiService.listEvents(token, now, "Scheduled via PlumBot"); 
    
    return events.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      hangoutLink: event.hangoutLink,
      attendees: (event.attendees || []).filter((a: any) => !a.self), // Filter out the admin's own attendance
    }));
  } catch (error: any) {
    console.error("Error fetching upcoming meetings:", error);
    return `Error: ${error.message}`;
  }
};