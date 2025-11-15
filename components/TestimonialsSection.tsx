
import React from 'react';

const TestimonialCard: React.FC<{ quote: string; name: string; title: string; company: string; }> = ({ quote, name, title, company }) => (
  <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700/50 backdrop-blur-sm">
    <blockquote className="text-gray-300 italic">“{quote}”</blockquote>
    <div className="mt-6">
      <p className="font-bold text-white">{name}</p>
      <p className="text-sm text-purple-400">{title}, {company}</p>
    </div>
  </div>
);

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: "Plum AI's strategic consulting was a game-changer for our business. They provided a clear roadmap that demystified AI and delivered tangible results.",
      name: "Jane Doe",
      title: "CEO",
      company: "Innovate Inc."
    },
    {
      quote: "The custom machine learning model they developed has revolutionized our data analysis, giving us insights we never thought possible. Truly exceptional work.",
      name: "John Smith",
      title: "Head of Data Science",
      company: "DataCorp"
    },
    {
      quote: "The automation suite streamlined our entire workflow, saving us hundreds of hours per week. The efficiency gains have been incredible.",
      name: "Emily White",
      title: "COO",
      company: "Strive Logistics"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">What Our Clients Say</h2>
          <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">We're proud to partner with industry leaders to drive innovation and success.</p>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
