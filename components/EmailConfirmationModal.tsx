import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { MeetingDetails } from '../App';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: MeetingDetails | null;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({ isOpen, onClose, details }) => {
  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="email-confirmation-title">
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-2xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="email-confirmation-title" className="text-lg font-semibold text-white">Meeting Scheduled & Confirmation Sent</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-6 md:p-8 text-sm text-gray-300">
          <p className="mb-4 text-center">An event has been added to the calendar and a confirmation email has been sent to <strong>{details.email}</strong> from the admin's connected account.</p>
          
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 my-4 text-left">
              <h3 className="font-bold text-white mb-3 text-base">Meeting Details:</h3>
              <div className="space-y-2">
                <p><strong>Client:</strong> {details.name}</p>
                <p><strong>Date:</strong> {details.date}</p>
                <p><strong>Time:</strong> {details.time}</p>
              </div>
          </div>
            
          <p className="text-xs text-gray-500 text-center">The client and admin will also receive a Google Calendar invitation.</p>
        </div>

        <footer className="p-4 border-t border-gray-700 text-right">
            <button 
              onClick={onClose}
              className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
        </footer>
      </div>
      {/* FIX: Removed the `jsx` prop as it is not a valid attribute for the style tag in standard React. */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EmailConfirmationModal;