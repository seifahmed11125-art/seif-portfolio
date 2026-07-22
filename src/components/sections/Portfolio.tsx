import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['All', 'Branding', 'Social Media', 'Print', 'Motion'];

const projects = [
  { id: 1, name: 'Minimal Brand System', category: 'Branding', gradient: 'from-[#161f6e] to-[#0a0a0f]' },
  { id: 2, name: 'Aesthetic Feed Concept', category: 'Social Media', gradient: 'from-[#b9efa3] to-[#161f6e]' },
  { id: 3, name: 'Editorial Design', category: 'Print', gradient: 'from-[#1a1a2e] to-[#b9efa3]' },
  { id: 4, name: 'Dynamic Motion Logo', category: 'Motion', gradient: 'from-[#161f6e] to-[#b9efa3]' },
  { id: 5, name: 'Luxury Visual Identity', category: 'Branding', gradient: 'from-[#0d0d18] to-[#161f6e]' },
  { id: 6, name: 'Creative Stories Pack', category: 'Social Media', gradient: 'from-[#b9efa3] to-[#0a0a0f]' },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="portfolio" className="py-32 bg-bg-offset relative overflow-hidden">
      {/* Background Number */}
      <div className="absolute top-1/2 right-[-5%] -translate-y-1/2 select-none pointer-events-none">
        <span className="text-[40vw] font-display font-bold text-primary opacity-5 leading-none">
          03
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-12 text-center">
          Featured Work
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full font-ui text-sm uppercase tracking-widest transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-text-secondary border border-white/10 hover:text-accent hover:border-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode='popLayout'>
          {filteredProjects.slice(0, 4).map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[4/5] bg-bg-dark overflow-hidden group cursor-pointer"
              >
                {/* Gradient Placeholder */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-50 transition-transform duration-700 group-hover:scale-110`} />
                
                {/* Overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-primary/80 flex flex-col items-center justify-center p-8 text-center"
                >
                  <p className="text-accent font-ui text-xs uppercase tracking-widest mb-4">{project.category}</p>
                  <h3 className="text-white text-3xl font-display font-bold">{project.name}</h3>
                  <div className="mt-8 w-12 h-[1px] bg-accent" />
                </motion.div>

                {/* Card Border/Frame */}
                <div className="absolute inset-4 border border-white/5 pointer-events-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
