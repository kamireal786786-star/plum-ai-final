

const SYSTEM_PROMPT_KEY = 'plum_ai_system_prompt';
const CALENDAR_SETTINGS_KEY = 'plum_ai_calendar_settings';


// --- Default Values ---

const defaultSystemInstruction = `You are PlumBot, a friendly, efficient, and professional sales assistant for 'Plum AI'.
Your primary goal is to answer user questions about our services and schedule a meeting with our sales team using Google Calendar.

**Communication Style:**
- Be concise and to the point.
- Use markdown for clear formatting. When listing available times, use a bulleted list.
- Maintain a professional and helpful tone.

**Core Task: Scheduling Meetings**
You have two tools to help you schedule meetings:
1.  \`get_available_slots\`: Use this to check for available times on a specific date (format: YYYY-MM-DD). The availability comes directly from the admin's Google Calendar and their configured schedule.
    - If the tool returns an error or an empty list, inform the user that no slots are available for that day and suggest they try another date. If it returns a "not connected" error, tell the user scheduling is temporarily unavailable and to check back later.
2.  \`schedule_meeting\`: Use this to book a meeting. You MUST have the user's full name, email address, and their chosen date and time before calling this function.
    - Do not guess any information.
    - Confirm all details with the user before you call the function to book the meeting.

**Scheduling Flow:**
1. If a user wants to book a meeting, ask for their preferred date first.
2. Use \`get_available_slots\` to check that date.
3. Present the available time slots in a clear list.
4. Once the user picks a time, ask for their full name and email address.
5. After gathering all information, confirm the details (name, email, date, time) with the user.
6. If confirmed, call \`schedule_meeting\` to finalize.
7. Inform the user that the meeting is successfully booked and an invitation has been sent to their email.

**General Information:**
- Today's date is ${new Date().toISOString().split('T')[0]}.
- Our services include: AI Receptionist, AI Chatbots, AI Voice Agents, and Custom AI Agent Solutions.
- Only provide a contact link if the user explicitly refuses to schedule a meeting. Your main goal is to use the scheduling tools.`;

export interface DaySchedule {
    enabled: boolean;
    start: string; // HH:MM
    end: string;   // HH:MM
}

export interface DateExclusion {
    id: string; // for unique key in React
    date: string; // YYYY-MM-DD
    allDay: boolean;
    start?: string; // HH:MM
    end?: string;   // HH:MM
}

export interface CalendarSettings {
    // Array of 7, index 0 is Sunday
    schedule: DaySchedule[]; 
    meetingDuration: number; // in minutes
    exclusions: DateExclusion[];
}

const defaultCalendarSettings: CalendarSettings = {
    schedule: [
        { enabled: false, start: '09:00', end: '17:00' }, // Sunday
        { enabled: true, start: '09:00', end: '17:00' },  // Monday
        { enabled: true, start: '09:00', end: '17:00' },  // Tuesday
        { enabled: true, start: '09:00', end: '17:00' },  // Wednesday
        { enabled: true, start: '09:00', end: '17:00' },  // Thursday
        { enabled: true, start: '09:00', end: '17:00' },  // Friday
        { enabled: false, start: '09:00', end: '17:00' }, // Saturday
    ],
    meetingDuration: 30,
    exclusions: [],
};


// --- Calendar Settings Functions ---

export const getCalendarSettings = (): CalendarSettings => {
    try {
        const stored = localStorage.getItem(CALENDAR_SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Basic validation to ensure the loaded settings match the new structure
            if (Array.isArray(parsed.schedule) && parsed.schedule.length === 7 && Array.isArray(parsed.exclusions)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to parse calendar settings from localStorage", error);
    }
    // If stored settings are invalid or don't exist, save and return defaults
    saveCalendarSettings(defaultCalendarSettings);
    return defaultCalendarSettings;
};

export const saveCalendarSettings = (settings: CalendarSettings) => {
    try {
        localStorage.setItem(CALENDAR_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save calendar settings to localStorage", error);
    }
};


// --- System Prompt Functions ---

export const getSystemPrompt = (): string => {
  try {
    const stored = localStorage.getItem(SYSTEM_PROMPT_KEY);
    if (stored) {
        return stored;
    }
  } catch (error) {
    console.error("Failed to get system prompt from localStorage", error);
  }
  // Initialize with default if nothing is stored
  saveSystemPrompt(defaultSystemInstruction);
  return defaultSystemInstruction;
};

export const saveSystemPrompt = (prompt: string) => {
  try {
    localStorage.setItem(SYSTEM_PROMPT_KEY, prompt);
  } catch (error) {
    console.error("Failed to save system prompt to localStorage", error);
  }
};