import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Protected Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard initialTab="overview" />} />
          <Route path="/admin/dashboard" element={<AdminDashboard initialTab="overview" />} />
          <Route path="/admin/fund-requests" element={<AdminDashboard initialTab="submissions" />} />
          <Route path="/admin/funds" element={<AdminDashboard initialTab="funds" />} />
          <Route path="/admin/ad-requests" element={<AdminDashboard initialTab="ads" />} />
          <Route path="/admin/ads" element={<AdminDashboard initialTab="live_ads" />} />
          <Route path="/admin/logs" element={<AdminDashboard initialTab="logs" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
