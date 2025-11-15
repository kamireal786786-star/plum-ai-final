// services/calendarService.ts
// Now: uses client-side settings to calculate available slots,
// but asks server for busy periods (via /api/google/freebusy).
// Booking uses /api/google/schedule (server-side).

import * as settingsService from './settingsService';

const NOT_CONNECTED_ERROR = "Error: Scheduling temporarily unavailable. Admin not connected.";

interface BusySlot { start: string; end: string; }

export const getAvailableSlots = async (date: string): Promise<string[] | string> => {
  try {
    // Load calendar settings (local client-side config)
    const settings = settingsService.getCalendarSettings();

    // Build day schedule
    const dateObj = new Date(`${date}T12:00:00`); // avoid timezone math on day
    const dayIndex = dateObj.getDay(); // 0=Sunday
    const daySchedule = settings.schedule[dayIndex];

    if (!daySchedule || !daySchedule.enabled) {
      return []; // not a working day
    }

    // check full-day exclusion
    const allDayExclusion = settings.exclusions.find(ex => ex.date === date && ex.allDay);
    if (allDayExclusion) return [];

    const meetingDuration = settings.meetingDuration;
    const startStr = daySchedule.start; // "09:00"
    const endStr = daySchedule.end;     // "17:00"

    // time window in ISO to pass to server freebusy
    const timeMin = new Date(`${date}T${startStr}:00`).toISOString();
    const timeMax = new Date(`${date}T${endStr}:00`).toISOString();

    // Call server to get busy slots (server will use stored refresh token)
    const base = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const fbResp = await fetch(`${base}/api/google/freebusy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeMin, timeMax }),
    });

    if (!fbResp.ok) {
      const txt = await fbResp.text();
      console.error('freebusy endpoint error', fbResp.status, txt);
      return `Error: Failed to retrieve calendar availability (status ${fbResp.status})`;
    }

    const busyFromServer: BusySlot[] = await fbResp.json();

    // Convert client-side time exclusions to ISO ranges
    const timeExclusions = settings.exclusions
      .filter(ex => ex.date === date && !ex.allDay && ex.start && ex.end)
      .map(ex => ({ start: new Date(`${date}T${ex.start}:00`).toISOString(), end: new Date(`${date}T${ex.end}:00`).toISOString() }));

    const combinedBusy = [...busyFromServer, ...timeExclusions];

    // iterate through the day windows to create slots
    const availableSlots: string[] = [];
    let current = new Date(`${date}T${startStr}:00`);

    const endDate = new Date(`${date}T${endStr}:00`);

    while (current.getTime() + meetingDuration * 60000 <= endDate.getTime()) {
      const slotEnd = new Date(current.getTime() + meetingDuration * 60000);

      const isBusy = combinedBusy.some(b => {
        const bStart = new Date(b.start);
        const bEnd = new Date(b.end);
        return bStart < slotEnd && bEnd > current;
      });

      if (!isBusy) {
        const hh = String(current.getHours()).padStart(2, '0');
        const mm = String(current.getMinutes()).padStart(2, '0');
        availableSlots.push(`${hh}:${mm}`);
      }

      // step forward by meetingDuration
      current = new Date(current.getTime() + meetingDuration * 60000);
    }

    return availableSlots;
  } catch (err: any) {
    console.error('getAvailableSlots error', err);
    return `Error: ${err?.message || 'Unknown error while fetching slots'}`;
  }
};

export const scheduleMeeting = async (date: string, time: string, name: string, email: string): Promise<string> => {
  try {
    const base = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const resp = await fetch(`${base}/api/google/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, date, time }),
    });

    const json = await resp.json();
    if (!resp.ok) {
      console.error('scheduleMeeting server error', resp.status, json);
      return `Error: Failed to schedule meeting (${json?.error || resp.status})`;
    }

    if (json.success) {
      return `Success! A meeting has been scheduled for ${name} on ${date} at ${time}.`;
    } else {
      return `Error: ${json?.error || 'Unknown scheduling error'}`;
    }
  } catch (err: any) {
    console.error('scheduleMeeting error', err);
    return `Error: ${err?.message || 'Unable to schedule meeting'}`;
  }
};
