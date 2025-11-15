import { GoogleGenAI, Chat, FunctionDeclaration, Type, GenerateContentResponse, Part } from "@google/genai";
import * as calendarService from './calendarService';
import * as settingsService from './settingsService';

if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn("API_KEY environment variable not set. Chatbot will not function.");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });

const getAvailableSlotsDeclaration: FunctionDeclaration = {
  name: 'get_available_slots',
  description: "Gets the available meeting slots for a specific date from the admin's Google Calendar.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description: "The date to check for available slots, in YYYY-MM-DD format.",
      },
    },
    required: ['date'],
  },
};

const scheduleMeetingDeclaration: FunctionDeclaration = {
  name: 'schedule_meeting',
  description: "Schedules a meeting in the admin's Google Calendar after collecting client information.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description: "The date of the meeting in YYYY-MM-DD format.",
      },
      time: {
        type: Type.STRING,
        description: "The time of the meeting in HH:MM format (24-hour).",
      },
      name: {
        type: Type.STRING,
        description: "The full name of the client.",
      },
      email: {
        type: Type.STRING,
        description: "The email address of the client.",
      },
    },
    required: ['date', 'time', 'name', 'email'],
  },
};

export const createChatSession = (): Chat => {
    return ai.chats.create({
        model: 'gemini-flash-lite-latest',
        config: {
            systemInstruction: settingsService.getSystemPrompt(),
            tools: [{
                functionDeclarations: [getAvailableSlotsDeclaration, scheduleMeetingDeclaration]
            }],
        },
    });
};

export const sendMessageToGemini = async (
    chat: Chat, 
    message: string
): Promise<string> => {
    try {
        let response: GenerateContentResponse = await chat.sendMessage({ message });

        while (response.functionCalls && response.functionCalls.length > 0) {
            const toolResponses: Part[] = await Promise.all(
                response.functionCalls.map(async (fc) => {
                    const { name, args } = fc;
                    let result: any;

                    console.log(`Model wants to call function "${name}" with args:`, args);
                    
                    // FIX: Add a defensive check for args to prevent runtime errors if they are missing.
                    if (!args) {
                        result = { error: `Function call to '${name}' is missing arguments.` };
                    } else if (name === 'get_available_slots') {
                        result = await calendarService.getAvailableSlots(args.date as string);
                    } else if (name === 'schedule_meeting') {
                        result = await calendarService.scheduleMeeting(
                            args.date as string,
                            args.time as string,
                            args.name as string,
                            args.email as string
                        );
                    } else {
                        result = { error: `Unknown function: ${name}` };
                    }
                    
                    return {
                        functionResponse: {
                            name,
                            response: { result: result },
                        }
                    };
                })
            );

            console.log("Sending tool responses back to model:", toolResponses);
            response = await chat.sendMessage({ message: toolResponses });
        }
        
        // FIX: Handle the case where response.text might be undefined by providing a default empty string.
        return response.text ?? '';
    } catch (error: any) {
        console.error("Error sending message to Gemini:", error);

        // Check for the specific RESOURCE_EXHAUSTED status
        if (error?.error?.status === 'RESOURCE_EXHAUSTED') {
            return `It looks like the API quota has been exceeded. This is a temporary issue related to usage limits.

For more information, please check your plan and billing details or visit the links below:
- [About Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Monitor Usage](https://ai.dev/usage?tab=rate-limit)

Please try again later.`;
        }

        // Generic error handling for other cases
        const errorMessage = error?.error?.message || (error instanceof Error ? error.message : JSON.stringify(error));
        return `I'm sorry, an error occurred. Please try again later. Details: ${errorMessage}`;
    }
};