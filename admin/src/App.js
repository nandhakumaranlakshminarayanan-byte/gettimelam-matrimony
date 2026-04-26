import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Profiles from './pages/Profiles/Profiles';
import Services from './pages/Services/Services';
import Plans from './pages/Plans/Plans';
import Bookings from './pages/Bookings/Bookings';
import Testimonials from './pages/Testimonials/Testimonials';
import Analytics from './pages/Analytics/Analytics';
import Notifications from './pages/Notifications/Notifications';
import Banners from './pages/Banners/Banners';
import Messages from './pages/Messages/Messages';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdmin();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: '18px', color: '#555' }}>
      Loading Admin Panel...
    </div>
  );
  return admin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AdminProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/profiles" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/testimonials" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/banners" element={<ProtectedRoute><Banners /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;