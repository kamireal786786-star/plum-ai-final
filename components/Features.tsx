

import React from 'react';

// Fix: Changed icon type from JSX.Element to React.ReactElement to resolve namespace issue.
const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactElement }> = ({ title, description, icon }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500/10 text-purple-400 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};


const Features: React.FC = () => {
  const features = [
    {
      title: "AI Receptionist",
      description: "Automate your front desk with an intelligent agent that answers calls, schedules appointments, and provides 24/7 customer support.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg>
    },
    {
      title: "AI Chat & Voice Agents",
      description: "Engage customers across platforms with intelligent chatbots and voice agents for support, sales, and lead generation.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 01.375-.375h3.375a.375.375 0 010 .75H9a.375.375 0 01-.375-.375zm0 2.25a.375.375 0 01.375-.375h3.375a.375.375 0 010 .75H9a.375.375 0 01-.375-.375zM12 21a8.966 8.966 0 01-5.902-2.657c-1.161-.99-1.92-2.314-2.097-3.791A8.966 8.966 0 0112.001 3c4.948 0 8.995 3.982 9 8.924a8.966 8.966 0 01-5.902 8.326z" /></svg>
    },
    {
      title: "Custom Agent Development",
      description: "We design and build bespoke AI agents for any business need, from automating complex workflows to performing specialized tasks.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">What We Do</h2>
          <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">We build intelligent AI agents to automate tasks, engage customers, and drive business growth.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;