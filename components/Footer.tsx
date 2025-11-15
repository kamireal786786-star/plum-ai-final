
import React from 'react';

interface FooterProps {
  onAdminClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer id="contact" className="border-t border-gray-800">
      <div className="container mx-auto px-6 py-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Plum AI. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onAdminClick(); }} className="hover:text-white transition-colors">Admin</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;