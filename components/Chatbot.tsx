// components/Chatbot.tsx
import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import * as calendarService from '../services/calendarService';

interface Message {
  from: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingBooking, setAwaitingBooking] = useState<{ date?: string; time?: string; name?: string; email?: string } | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, loading]);

  const pushMessage = (m: Message) => setMessages(prev => [...prev, m]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    pushMessage({ from: 'user', text });
    setInput('');
    setLoading(true);

    try {
      // Ask the server-side Gemini for a reply
      const reply = await sendMessageToGemini(text);
      pushMessage({ from: 'bot', text: reply });

      // Basic heuristic: if user asked to schedule, start flow (you can refine this)
      if (/schedule|meeting|book|appointment/i.test(text)) {
        pushMessage({ from: 'bot', text: 'Sure — what date would you like to check? (YYYY-MM-DD)' });
      }
    } catch (err: any) {
      console.error('Chat error', err);
      pushMessage({ from: 'bot', text: 'Sorry — something went wrong. Try again later.' });
    } finally {
      setLoading(false);
    }
  };

  // simplified booking flow handlers (UI can call these)
  const checkSlotsForDate = async (date: string) => {
    pushMessage({ from: 'user', text: date });
    pushMessage({ from: 'bot', text: 'Checking available slots...' });
    setLoading(true);
    const slots = await calendarService.getAvailableSlots(date);
    setLoading(false);

    if (typeof slots === 'string') {
      pushMessage({ from: 'bot', text: slots }); // error message
      return;
    }

    if (Array.isArray(slots) && slots.length === 0) {
      pushMessage({ from: 'bot', text: 'No slots available on that date. Try another date.' });
      return;
    }

    // show list and ask to pick
    const listText = slots.map(s => `- ${s}`).join('\n');
    pushMessage({ from: 'bot', text: `Available times for ${date}:\n${listText}\nPlease reply with your preferred time (HH:MM).` });
    setAwaitingBooking({ date });
  };

  const confirmAndSchedule = async (time: string) => {
    if (!awaitingBooking?.date) {
      pushMessage({ from: 'bot', text: 'Please provide a date first (YYYY-MM-DD).' });
      return;
    }
    // Ask for name & email (simple flow)
    pushMessage({ from: 'user', text: time });
    pushMessage({ from: 'bot', text: 'Please provide your full name.' });
    setAwaitingBooking({ ...awaitingBooking, time });
    // Next steps: expecting name and email from user messages — for brevity this demo asks sequentially
  };

  // For a production flow, you would implement a structured modal or form to collect name/email/time,
  // then call calendarService.scheduleMeeting(date, time, name, email)

  return (
    <div className="chatbot border rounded p-4 bg-white max-w-lg">
      <div ref={ref} className="messages h-64 overflow-auto mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${m.from === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <pre className="whitespace-pre-wrap">{m.text}</pre>
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500">Thinking…</div>}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border px-3 py-2 rounded"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              // special flow: if awaitingBooking expects a date/time or name, handle basic parsing
              const t = input.trim();
              if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
                checkSlotsForDate(t);
                setInput('');
              } else if (/^\d{2}:\d{2}$/.test(t) && awaitingBooking?.date && !awaitingBooking?.time) {
                // user picked time
                confirmAndSchedule(t);
                setInput('');
              } else {
                handleSend();
              }
            }
          }}
          placeholder="Type a message…"
        />
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
