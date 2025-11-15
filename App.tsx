
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AnimatedBackground from './components/AnimatedBackground';
import EmailConfirmationModal from './components/EmailConfirmationModal';
import AdminLoginModal from './components/AdminLoginModal';
import { GoogleAuthProvider } from './contexts/GoogleAuthContext';

export interface MeetingDetails {
  name: string;
  email: string;
  date: string;
  time: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'admin'
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null);

  const handleMeetingScheduled = (details: MeetingDetails) => {
    setMeetingDetails(details);
    setShowConfirmationModal(true);
  };

  return (
    <GoogleAuthProvider>
      <div className="bg-black min-h-screen text-gray-200">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header onNavigate={setCurrentPage} />
          <main className="flex-grow">
            {currentPage === 'home' && <HomePage />}
            {currentPage === 'admin' && <AdminPage />}
          </main>
          <Footer onAdminClick={() => setShowAdminLogin(true)} />
          <Chatbot onMeetingScheduled={handleMeetingScheduled} />
        </div>
        <EmailConfirmationModal 
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          details={meetingDetails}
        />
        <AdminLoginModal
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onLoginSuccess={() => {
            setCurrentPage('admin');
            setShowAdminLogin(false);
          }}
        />
      </div>
    </GoogleAuthProvider>
  );
};

export default App;