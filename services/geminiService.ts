// services/geminiService.ts
// Replaces direct @google/genai usage in the browser.
// Sends prompts to your server-side /api/plumbot which calls Gemini securely.

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const base = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const resp = await fetch(`${base}/api/plumbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: message }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('Gemini proxy error:', resp.status, txt);
      throw new Error(`Gemini proxy error: ${resp.status}`);
    }

    const data = await resp.json();
    return data.reply || '';
  } catch (err: any) {
    console.error('sendMessageToGemini error', err);
    throw err;
  }
};

// keep a stub for createChatSession if other files import it
export const createChatSession = () => {
  console.warn('createChatSession is now a no-op in the browser; server-side /api/plumbot handles sessions.');
  return null as any;
};
