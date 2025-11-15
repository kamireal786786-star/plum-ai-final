
import React, { useState } from 'react';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { NavLink } from './NavLink';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';

interface HeaderProps {
  onNavigate: (page: 'home' | 'admin') => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScrollToSection = (sectionId: string) => {
    // First, ensure we are on the home page so the section exists.
    onNavigate('home');
    
    // Defer the scroll action slightly to allow React to re-render the HomePage.
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    setIsMenuOpen(false); // Close menu after clicking
  };

  const handlePageNavigation = (page: 'home' | 'admin') => {
    onNavigate(page);
    setIsMenuOpen(false);
  };


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <NavLink href="#" onClick={() => handlePageNavigation('home')} className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500">
            Plum AI
          </NavLink>
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="#features" onClick={() => handleScrollToSection('features')} className="text-gray-400 hover:text-white transition-colors">What We Do</NavLink>
            <NavLink href="#mission" onClick={() => handleScrollToSection('mission')} className="text-gray-400 hover:text-white transition-colors">Our Mission</NavLink>
            <NavLink href="#contact" onClick={() => handleScrollToSection('contact')} className="text-gray-400 hover:text-white transition-colors">Contact</NavLink>
          </nav>
          <NavLink href="#contact" onClick={() => handleScrollToSection('contact')} className="hidden md:flex items-center space-x-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
            <span>Get Started</span>
            <ArrowRightIcon className="w-4 h-4" />
          </NavLink>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu" className="text-white">
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
           <NavLink href="#" onClick={() => handlePageNavigation('home')} className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500">
             Plum AI
           </NavLink>
           <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="text-white">
             <CloseIcon className="w-8 h-8" />
           </button>
        </div>
        <nav className="flex flex-col items-center justify-center h-full -mt-16 space-y-8 text-center">
          <NavLink href="#features" onClick={() => handleScrollToSection('features')} className="text-2xl text-gray-300 hover:text-white transition-colors">What We Do</NavLink>
          <NavLink href="#mission" onClick={() => handleScrollToSection('mission')} className="text-2xl text-gray-300 hover:text-white transition-colors">Our Mission</NavLink>
          <NavLink href="#contact" onClick={() => handleScrollToSection('contact')} className="text-2xl text-gray-300 hover:text-white transition-colors">Contact</NavLink>
          <NavLink href="#contact" onClick={() => handleScrollToSection('contact')} className="inline-flex items-center space-x-2 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105">
            <span>Get Started</span>
            <ArrowRightIcon className="w-5 h-5" />
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Header;