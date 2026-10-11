import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Stars({ value = 0, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || Math.round(value);
  return (
    <span className="stars" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n} type="button" disabled={!onChange} className="star-btn"
          whileHover={onChange ? { scale: 1.25, rotate: -8 } : {}} whileTap={onChange ? { scale: 0.8 } : {}}
          onMouseEnter={() => onChange && setHover(n)} onClick={() => onChange?.(n)} aria-label={`${n} star`}
        >
          <Star size={size} className={n <= shown ? 'star on' : 'star'} />
        </motion.button>
      ))}
    </span>
  );
}
