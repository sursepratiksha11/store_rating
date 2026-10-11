import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans', border: '2px solid #2b2118', borderRadius: 10 } }} />
    </AuthProvider>
  </BrowserRouter>
);
