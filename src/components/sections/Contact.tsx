import { motion } from 'framer-motion';

const socialLinks = [
  { name: 'Instagram', href: '#' },
  { name: 'LinkedIn', href: '#' },
  { name: 'Behance', href: '#' },
  { name: 'WhatsApp', href: '#' },
];

const Contact = () => {
  const email = 'seif@email.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    alert('Email copied to clipboard!');
  };

  return (
    <section id="contact" className="py-32 bg-bg-dark relative overflow-hidden">
      {/* Background Number */}
      <div className="absolute top-1/2 left-[-5%] -translate-y-1/2 select-none pointer-events-none">
        <span className="text-[40vw] font-display font-bold text-primary opacity-5 leading-none">
          04
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-start">
          <h2 className="text-7xl md:text-[12vw] font-display font-bold text-white leading-[0.9] mb-20">
            Let's Work <br />
            <span className="text-accent">Together</span>
          </h2>

          <div className="w-full flex flex-col md:flex-row justify-between items-end gap-16">
            <div className="flex flex-col gap-8 w-full md:w-auto">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="group flex items-center gap-4 text-3xl md:text-5xl font-display text-white hover:text-accent transition-colors duration-300"
                >
                  <span className="relative">
                    {link.name}
                    <motion.div 
                      className="absolute bottom-0 left-0 h-[1px] bg-accent w-0 group-hover:w-full transition-all duration-500"
                    />
                  </span>
                  <motion.span 
                    initial={{ x: -10, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                    className="text-accent"
                  >
                    →
                  </motion.span>
                </motion.a>
              ))}
            </div>

            <div className="flex flex-col items-start md:items-end w-full md:w-auto">
              <p className="text-text-secondary font-ui uppercase tracking-widest text-sm mb-4">Get in touch</p>
              <button
                onClick={copyEmail}
                className="text-3xl md:text-5xl font-display text-white hover:text-accent transition-colors duration-300 cursor-pointer text-left md:text-right"
              >
                {email}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-40 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-text-secondary font-ui text-xs uppercase tracking-widest">
          <p>© 2025 Seif El-Din Ahmed</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
