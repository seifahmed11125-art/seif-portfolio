import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  'Visual Identity', 'Brand Strategy', 'Social Media Design',
  'Motion Graphics', 'Print Design', 'Presentation Design'
];

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = textRef.current?.querySelectorAll('.reveal-line');
      if (lines) {
        gsap.from(lines, {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 80%',
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={containerRef} className="py-32 bg-bg-offset relative overflow-hidden">
      {/* Background Number */}
      <div className="absolute top-1/2 right-[-5%] -translate-y-1/2 select-none pointer-events-none">
        <span className="text-[40vw] font-display font-bold text-primary opacity-10 leading-none">
          01
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div ref={textRef} className="w-full md:w-[60%]">
            <div className="reveal-line mb-4">
              <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-2">
                About Me
              </h2>
              <div className="w-24 h-1 bg-accent" />
            </div>

            <div className="reveal-line mt-12 space-y-6">
              <p className="text-xl text-text-secondary font-body leading-relaxed">
                I am a passionate Creative Designer and Visual Identity Specialist based in Cairo. 
                With a deep focus on storytelling through design, I help brands build unique 
                personalities that resonate with their audience.
              </p>
              <p className="text-xl text-text-secondary font-body leading-relaxed">
                My approach combines strategic thinking with bold aesthetics, ensuring that 
                every project—from a single social media post to a full brand identity—delivers 
                impact and value.
              </p>
            </div>

            <div className="reveal-line mt-12 flex flex-wrap gap-4">
              {skills.map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ backgroundColor: '#161f6e', color: '#b9efa3', borderColor: '#161f6e' }}
                  className="px-6 py-2 border border-primary text-text-secondary font-ui text-sm rounded-full transition-colors duration-300"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="w-full md:w-[40%] flex justify-center">
            {/* Visual element or image could go here */}
            <div className="relative group">
              <div className="absolute -inset-4 border border-accent/20 translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
              <div className="w-64 h-80 bg-primary/20 backdrop-blur-3xl border border-primary/50 flex items-center justify-center p-8 text-center">
                <p className="font-display italic text-2xl text-accent">
                  "Design is the silent ambassador of your brand."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
