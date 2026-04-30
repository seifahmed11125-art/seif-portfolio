import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = headingRef.current?.querySelectorAll('.word');
      if (words) {
        gsap.from(words, {
          y: '100%',
          opacity: 0,
          duration: 1.5,
          stagger: 0.1,
          ease: 'power4.out',
          delay: 0.5,
        });
      }

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 1.5,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-bg-dark pt-20"
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"
        />
      </div>

      <div className="container mx-auto px-6 z-10 text-center">
        <h1
          ref={headingRef}
          className="text-[12vw] md:text-[8vw] leading-[1.2] font-display uppercase font-bold text-white mb-6 select-none pt-[0.2em] overflow-visible"
        >
          <span className="inline-block overflow-visible pb-4">
            <span className="word inline-block">Seif</span>
          </span>
          <br />
          <span className="inline-block overflow-visible pb-4">
            <span className="word inline-block">El-Din</span>
          </span>
          <span className="inline-block overflow-visible pb-4 ml-4">
            <span className="word inline-block text-accent">Ahmed</span>
          </span>
        </h1>

        <div ref={subtitleRef} className="flex flex-col items-center">
          <div className="w-24 h-[1px] bg-accent mb-8" />
          <p className="text-xl md:text-2xl font-body text-text-secondary tracking-widest uppercase">
            Creative Designer & Visual Identity Specialist
          </p>
          
          <motion.a
            href="#portfolio"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-12 px-10 py-4 border border-primary text-white font-ui uppercase tracking-widest text-sm relative overflow-hidden group"
          >
            <span className="relative z-10 group-hover:text-primary transition-colors duration-300">View My Work</span>
            <motion.div 
              className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            />
          </motion.a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <span className="text-[10px] font-ui uppercase tracking-[0.3em] text-text-secondary rotate-90 mb-8">Scroll</span>
        <div className="w-[1px] h-20 bg-primary/30 relative overflow-hidden">
          <motion.div
            animate={{
              y: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 left-0 w-full h-1/2 bg-accent"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
