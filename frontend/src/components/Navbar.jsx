import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, homeFor } from '../AuthContext';

const roleLabel = { ADMIN: 'Admin', STORE_OWNER: 'Store owner', NORMAL_USER: 'Shopper' };

export default function Navbar() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  return (
    <motion.header className="nav" initial={{ y: -60 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120 }}>
      <Link to={homeFor(user.role)} className="brand"><Store size={22} /> Shelfie</Link>
      <div className="nav-right">
        <span className="chip">{roleLabel[user.role]}</span>
        <span className="who">{user.name.split(' ')[0]}</span>
        <Link to="/password" className="icon-btn" title="Change password"><KeyRound size={18} /></Link>
        <button className="icon-btn" title="Log out" onClick={() => { signOut(); nav('/login'); }}><LogOut size={18} /></button>
      </div>
    </motion.header>
  );
}
