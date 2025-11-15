

import React from 'react';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';
import { NavLink } from '../components/NavLink';

const ServiceDetailCard: React.FC<{ title: string; description: string; details: string[] }> = ({ title, description, details }) => (
  <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 h-full flex flex-col">
    <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">{title}</h3>
    <p className="text-gray-400 mb-6 flex-grow">{description}</p>
    <ul className="space-y-3 text-gray-300 list-disc list-inside">
      {details.map((detail, index) => <li key={index}>{detail}</li>)}
    </ul>
  </div>
);

const ServicesPage: React.FC = () => {
  const services = [
    {
      title: "AI Receptionist",
      description: "Deploy a fully autonomous receptionist to manage your front-desk communications, ensuring you never miss an opportunity, 24/7.",
      details: [
        "24/7 Call Answering & Routing", 
        "Automated Appointment Scheduling", 
        "Frequently Asked Questions Handling", 
        "Lead Capture & Qualification", 
        "Integration with Calendars & CRMs"
      ]
    },
    {
      title: "AI Chatbots",
      description: "Enhance your website with intelligent chatbots that provide instant support, answer questions, and convert visitors into qualified leads.",
      details: [
        "Website & Social Media Integration", 
        "Proactive Lead Generation", 
        "Instant Customer Support", 
        "Personalized Product Recommendations", 
        "Seamless Handoff to Human Agents"
      ]
    },
    {
      title: "AI Voice Agents",
      description: "Modernize your call center with sophisticated voice agents that offer natural, human-like conversations to resolve customer issues efficiently.",
      details: [
        "Inbound & Outbound Call Automation", 
        "Advanced Interactive Voice Response (IVR)", 
        "Real-time Transcription & Analysis", 
        "Sentiment Analysis & Call Scoring", 
        "Multi-language & Accent Support"
      ]
    },
    {
      title: "Custom AI Agent Solutions",
      description: "For unique challenges, we design and build bespoke AI agents tailored to automate your specific workflows and operational needs.",
      details: [
        "Workflow-specific Task Automation", 
        "Internal Knowledge Base Agents", 
        "Data Analysis & Reporting Agents", 
        "Custom API & System Integrations", 
        "End-to-end Development & Deployment"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-6 py-20 text-center">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Our AI Agent Solutions
      </h2>
      <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-16">
        We offer a comprehensive suite of AI agents designed to drive innovation and create tangible value for your business.
      </p>
      <div className="grid md:grid-cols-2 gap-8 text-left">
        {services.map(service => <ServiceDetailCard key={service.title} {...service} />)}
      </div>
       <div className="mt-20">
        <NavLink href="#contact" className="inline-flex items-center space-x-2 bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-700 transition-transform duration-300 hover:scale-105">
            <span>Get a Custom Quote</span>
            <ArrowRightIcon className="w-5 h-5" />
        </NavLink>
      </div>
    </div>
  );
};

export default ServicesPage;