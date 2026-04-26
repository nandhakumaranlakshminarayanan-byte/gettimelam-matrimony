import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import Browse from './pages/Browse/Browse';
import Dashboard from './pages/Dashboard/Dashboard';
import Horoscope from './pages/Horoscope/Horoscope';
import './App.css';
import Plans from './pages/Plans/Plans';
import Services from './pages/Services/Services';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/horoscope" element={<Horoscope />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/services" element={<Services />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;