import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth, homeFor } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/OwnerDashboard';
import Password from './pages/Password';

function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
          <Route path="/login" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Signup />} />
          <Route path="/admin" element={<Guard roles={['ADMIN']}><Admin /></Guard>} />
          <Route path="/stores" element={<Guard roles={['NORMAL_USER']}><UserStores /></Guard>} />
          <Route path="/owner" element={<Guard roles={['STORE_OWNER']}><OwnerDashboard /></Guard>} />
          <Route path="/password" element={<Guard roles={['NORMAL_USER', 'STORE_OWNER', 'ADMIN']}><Password /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
