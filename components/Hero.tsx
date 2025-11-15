
import React from 'react';
import { NavLink } from './NavLink';

const Hero: React.FC = () => {
  return (
    <section id="mission" className="min-h-screen flex items-center justify-center text-center pt-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500">
            Pioneering
          </span>
          <br/>
          the Future of Intelligence.
        </h2>
        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-400 mb-8">
          Our mission is to democratize artificial intelligence, creating innovative solutions that empower businesses and individuals to solve the world's most complex challenges.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <NavLink href="#services" className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105 w-full sm:w-auto">
            Our Services
          </NavLink>
          <NavLink href="#contact" className="bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg border border-gray-700 hover:bg-gray-700 transition-transform duration-300 hover:scale-105 w-full sm:w-auto">
            Contact Sales
          </NavLink>
        </div>
      </div>
    </section>
  );
};

export default Hero;
