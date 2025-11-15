
import React from 'react';

const TechCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500/10 text-purple-400 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const TechnologySection: React.FC = () => {
  const technologies = [
    {
      title: "Deep Learning",
      description: "Leveraging multi-layered neural networks to find complex patterns in large datasets for unparalleled predictive accuracy.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 12l4.179 2.25m0 0l5.571 3 5.571-3m0 0l4.179-2.25L12 9.75l-5.571 3z" /></svg>
    },
    {
      title: "Natural Language Processing",
      description: "Enabling machines to understand, interpret, and generate human language for chatbots, sentiment analysis, and more.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.483l.227.227.227.227A9.042 9.042 0 0012 20.25z" /></svg>
    },
    {
      title: "Computer Vision",
      description: "Training models to interpret and understand the visual world, from image recognition and classification to object detection.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.433-7.532A1.012 1.012 0 017.25 4h9.5a1.012 1.012 0 01.782 1.638l-4.433 7.532a1.012 1.012 0 01-1.564 0l-4.434-7.532a1.012 1.012 0 010-.639z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Our Technology Stack</h2>
          <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">We build on a foundation of industry-leading AI technologies to deliver robust and scalable solutions.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech) => (
            <TechCard key={tech.title} {...tech} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
