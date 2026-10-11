import { motion } from 'framer-motion';
import { Star, Store } from 'lucide-react';

export default function AuthShell({ title, sub, children }) {
  return (
    <motion.div className="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="auth-art">
        <div className="brand big"><Store size={30} /> Shelfie</div>
        <h1>Good shops<br />deserve good<br />feedback.</h1>
        <p>Rate your neighbourhood stores from 1 to 5 and help others find the best ones.</p>
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className={`float f${i}`} animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.6 }}>
            <Star size={36 + i * 12} />
          </motion.div>
        ))}
      </section>
      <section className="auth-form">
        <motion.div className="card" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
          <h2>{title}</h2><p className="sub">{sub}</p>
          {children}
        </motion.div>
      </section>
    </motion.div>
  );
}
