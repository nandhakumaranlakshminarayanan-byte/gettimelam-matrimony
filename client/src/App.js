import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import Browse from './pages/Browse/Browse';
import Dashboard from './pages/Dashboard/Dashboard';
import VendorDashboard from './pages/VendorDashboard/VendorDashboard';
import Horoscope from './pages/Horoscope/Horoscope';
import Plans from './pages/Plans/Plans';
import Services from './pages/Services/Services';
import AdminPanel from './pages/Admin/AdminPanel';
import Contact from './pages/Contact/Contact';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/horoscope" element={<Horoscope />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/services" element={<Services />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;