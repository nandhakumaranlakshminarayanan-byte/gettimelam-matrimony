import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import Browse from './pages/Browse/Browse';
import Dashboard from './pages/Dashboard/Dashboard';
import ServiceProvider from './pages/ServiceProvider/ServiceProvider';
import Horoscope from './pages/Horoscope/Horoscope';
import Plans from './pages/Plans/Plans';
import Services from './pages/Services/Services';
import ServiceDetail from './pages/Services/ServiceDetail';
import AdminPanel from './pages/Admin/AdminPanel';
import Contact from './pages/Contact/Contact';
import ProfileDetail from './pages/Profile/ProfileDetail';
import Messages from './pages/Messages/Messages';
import LanguageSelect from './pages/LanguageSelect/LanguageSelect';
import Register from './pages/Register/Register'; {/* ✅ ADD THIS */ }
import AadharReminder from './components/AadharReminder/AadharReminder';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <AadharReminder />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />  {/* ✅ ADD THIS */}
          <Route path="/browse" element={<Browse />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/service-provider" element={<ServiceProvider />} />
          <Route path="/horoscope" element={<Horoscope />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/language" element={<LanguageSelect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;