
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import * as adminAuthService from '../services/adminAuthService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const creds = adminAuthService.getAdminCredentials();
    if (username === creds.username && password === creds.password) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Invalid username or password.');
    }
  };
  
  const handleClose = () => {
    // Reset fields on close
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
      <div
        className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-sm transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="admin-login-title" className="text-lg font-semibold text-white">Admin Access</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Login
          </button>
        </form>
      </div>
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

export default AdminLoginModal;