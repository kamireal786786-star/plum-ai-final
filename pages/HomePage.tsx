import React, { useEffect, useRef } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import TechnologySection from '../components/TechnologySection';
import TestimonialsSection from '../components/TestimonialsSection';
import ServicesPage from './ServicesPage';
import ContactPage from './ContactPage';

// Custom hook for observing elements
const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, options);

    const elements = containerRef.current?.querySelectorAll('.animate-on-scroll');
    if (elements) {
      elements.forEach(el => observer.observe(el));
    }

    return () => {
      if (elements) {
        elements.forEach(el => observer.unobserve(el));
      }
    };
  }, [options]);

  return containerRef;
};

const HomePage: React.FC = () => {
  const containerRef = useIntersectionObserver({ root: null, rootMargin: '0px', threshold: 0.1 });

  return (
    // @ts-ignore
    <div ref={containerRef}>
      <Hero />
      <div className="animate-on-scroll">
        <Features />
      </div>
      <section id="services" className="animate-on-scroll">
        <ServicesPage />
      </section>
      <div className="animate-on-scroll">
        <TechnologySection />
      </div>
      <div className="animate-on-scroll">
        <TestimonialsSection />
      </div>
      <section id="contact" className="animate-on-scroll">
        <ContactPage />
      </section>
    </div>
  );
};

export default HomePage;