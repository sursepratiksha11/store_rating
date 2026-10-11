import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children }) {
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        {children}
      </motion.div>
    </motion.div>
  );
}
