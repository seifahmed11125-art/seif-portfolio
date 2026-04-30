import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const services = [
  {
    number: '01',
    name: 'Social Media Design',
    description: 'Posts, Stories, Reels Covers, Highlight Icons. High-impact visuals that drive engagement and build brand presence across social platforms.',
  },
  {
    number: '02',
    name: 'Visual Identity & Branding',
    description: 'Logo Design, Brand Guide, Color Palette, Typography. Creating cohesive and memorable identities that represent your brand values.',
  },
  {
    number: '03',
    name: 'Marketing Materials',
    description: 'Brochures, Flyers, Banners, Outdoor Advertising. Print and digital collateral designed to effectively communicate your message.',
  },
  {
    number: '04',
    name: 'Presentation Design',
    description: 'PowerPoint, Pitch Decks, Business Proposals. Professional and persuasive decks that help you win clients and tell your story.',
  },
  {
    number: '05',
    name: 'Motion Graphics',
    description: 'Animated Content, Intro Videos, Social Reels. Bringing designs to life through dynamic motion and storytelling.',
  },
];

const Services = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="services" className="py-32 bg-bg-dark relative overflow-hidden">
      {/* Background Number */}
      <div className="absolute top-1/2 left-[-5%] -translate-y-1/2 select-none pointer-events-none">
        <span className="text-[40vw] font-display font-bold text-primary opacity-5 leading-none">
          02
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-20 text-center">
          My Services
        </h2>

        <div className="max-w-4xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group border-t border-white/10 py-12 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-12">
                  <span className="text-accent font-ui text-xl">{service.number}</span>
                  <h3 className="text-3xl md:text-5xl font-display text-white group-hover:text-accent transition-colors duration-300">
                    {service.name}
                  </h3>
                </div>
                
                <div className="md:text-right">
                   <motion.div
                     animate={{ rotate: hoveredIndex === index ? 90 : 0 }}
                     className="text-white hidden md:block"
                   >
                     <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                       <path d="M10 20H30M30 20L22 12M30 20L22 28" stroke="currentColor" strokeWidth="1" />
                     </svg>
                   </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="mt-8 text-xl text-text-secondary font-body max-w-2xl">
                      {service.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hover Background */}
              <motion.div
                className="absolute inset-0 bg-primary/10 -z-0 origin-left"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
              />
            </motion.div>
          ))}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  );
};

export default Services;
