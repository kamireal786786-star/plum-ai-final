import React, { useState } from 'react';
import * as contactService from '../services/contactService';

type FormStatus = 'idle' | 'sending' | 'success' | 'error';

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus('error');
      setResponseMessage('Please fill out all fields.');
      return;
    }
    
    setStatus('sending');
    setResponseMessage('');

    try {
      const response = await contactService.sendMessage({ name, email, message });
      if (response.success) {
        setStatus('success');
        setResponseMessage("Thank you! Your message has been sent successfully. We'll get back to you shortly.");
        // Clear form
        setName('');
        setEmail('');
        setMessage('');
        // Reset status after a few seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setResponseMessage(errorMessage);
    }
  };

  const isSending = status === 'sending';

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Get in Touch
        </h2>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400">
          Have a project in mind or just want to learn more? We'd love to hear from you.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 bg-gray-800/50 p-8 md:p-12 rounded-xl border border-gray-700/50">
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Contact Information</h3>
            <p className="text-gray-400 mb-8">Fill out the form and our team will get back to you within 24 hours.</p>
            <div className="space-y-4">
              <p className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                <span className="text-gray-300">sales@plumai.com</span>
              </p>
              <p className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <span className="text-gray-300">San Francisco, CA</span>
              </p>
            </div>
          </div>
          <div className="flex space-x-4 mt-8 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">GitHub</a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input type="text" id="name" name="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={isSending} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={isSending} />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
            <textarea id="message" name="message" rows={4} value={message} onChange={e => setMessage(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={isSending}></textarea>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-purple-800 disabled:cursor-not-allowed" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Message'}
          </button>
          {status === 'success' && <p className="text-green-400 text-sm mt-2">{responseMessage}</p>}
          {status === 'error' && <p className="text-red-400 text-sm mt-2">{responseMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
